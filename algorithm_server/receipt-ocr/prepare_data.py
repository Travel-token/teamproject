#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
데이터셋 -> PaddleOCR 학습 포맷 변환기

subcommands
  aihub-rec  : AI Hub 한국어 글자체(인쇄체) -> rec 라벨 (img_path\ttext)
  cord       : CORD v2 (naver-clova-ix) -> det 라벨 + rec crop + KIE jsonl
  brand      : AI Hub 상표/상품 -> 상표 lexicon (후보정용 사전)
  dict       : rec 라벨들 -> 문자 사전(korean_receipt_dict.txt)
  split      : 라벨 파일 train/val 분할

사용 예)
  python prepare_data.py aihub-rec --root /data/aihub_printed --out data/rec
  python prepare_data.py cord --out data/cord
  python prepare_data.py brand --root /data/aihub_brand --out data/lexicon
  python prepare_data.py dict --labels data/rec/label.txt data/cord/rec/label.txt \
                              --out data/korean_receipt_dict.txt
  python prepare_data.py split --label data/rec/label.txt --ratio 0.95
"""
import argparse
import json
import os
import random
import re
import unicodedata
from pathlib import Path


# ---------------------------------------------------------------- utils
def norm_text(s: str) -> str:
    """NFC 정규화 + 공백 정리. 한글은 반드시 NFC로 통일해야 사전이 깨지지 않음."""
    s = unicodedata.normalize("NFC", str(s))
    s = re.sub(r"\s+", " ", s).strip()
    return s


def write_lines(path, lines):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print(f"[write] {path}  ({len(lines)} lines)")


# ---------------------------------------------------------------- AI Hub 인쇄체
def cmd_aihub_rec(args):
    """
    AI Hub '한국어 글자체 이미지' 인쇄체 구조 가정:
      root/
        images/**/*.png|jpg
        printed_data_info.json   (images[], annotations[])
    라벨 json 스키마가 배포본마다 조금씩 달라서 키를 유연하게 탐색한다.
    """
    root = Path(args.root)
    jsons = list(root.rglob("*.json"))
    if not jsons:
        raise SystemExit(f"라벨 json을 못 찾음: {root}")

    # file_name -> 실제 경로 인덱스 (하위 폴더가 나뉘어 있어도 매칭되게)
    index = {}
    for ext in ("*.png", "*.jpg", "*.jpeg"):
        for p in root.rglob(ext):
            index[p.name] = p

    rows, miss = [], 0
    for jp in jsons:
        try:
            data = json.loads(jp.read_text(encoding="utf-8"))
        except Exception:
            continue
        if not isinstance(data, dict) or "annotations" not in data:
            continue

        id2name = {img["id"]: img["file_name"] for img in data.get("images", [])}
        for ann in data["annotations"]:
            text = ann.get("text") or ann.get("annotation.text") or ""
            text = norm_text(text)
            if not text:
                continue
            # 글자 단위(음절) 데이터는 옵션으로 제외 (영수증은 단어/문장 위주)
            attr = json.dumps(ann.get("attributes", {}), ensure_ascii=False)
            if args.skip_syllable and ("음절" in attr or len(text) == 1):
                continue
            fname = id2name.get(ann.get("image_id"))
            if not fname:
                continue
            p = index.get(Path(fname).name)
            if p is None:
                miss += 1
                continue
            rows.append(f"{p.as_posix()}\t{text}")

    if args.limit:
        random.seed(42)
        random.shuffle(rows)
        rows = rows[: args.limit]

    write_lines(Path(args.out) / "label.txt", rows)
    print(f"[info] 이미지 매칭 실패 {miss}건")


# ---------------------------------------------------------------- CORD
# CORD category -> 우리 expenses 필드 매핑
CORD_FIELD_MAP = {
    "menu.nm": "item_name",
    "menu.cnt": "item_qty",
    "menu.price": "item_price",
    "total.total_price": "amount",
    "total.menutype_cnt": None,
    "sub_total.subtotal_price": "subtotal",
}


def cmd_cord(args):
    """
    CORD v2 (Indonesian receipts). 한국어는 없지만 '영수증 레이아웃/텍스트 박스'
    학습에는 그대로 쓸 수 있다. det 라벨 + rec crop + KIE jsonl을 동시에 생성.

    streaming=True로 받는다: 원래 방식(전체 parquet 4개, ~2.5GB)을 통째로
    로컬에 캐싱하면 디스크가 금방 찬다. 스트리밍은 필요한 개수만 그때그때
    내려받고 디스크에 큰 캐시를 남기지 않는다.
    """
    import itertools

    from datasets import load_dataset  # pip install datasets

    out = Path(args.out)
    img_dir = out / "images"
    crop_dir = out / "rec" / "crops"
    img_dir.mkdir(parents=True, exist_ok=True)
    crop_dir.mkdir(parents=True, exist_ok=True)

    splits = [
        ("train", "train", args.limit_train),
        ("validation", "val", args.limit_val),
        ("test", "test", args.limit_test),
    ]

    for split, split_name, limit in splits:
        try:
            ds = load_dataset("naver-clova-ix/cord-v2", split=split, streaming=True)
        except Exception as e:
            print(f"[skip] {split}: {e}")
            continue

        det_rows, rec_rows, kie_rows = [], [], []
        n = 0
        for i, ex in enumerate(itertools.islice(ds, limit)):
            img = ex["image"].convert("RGB")
            img_path = img_dir / f"{split_name}_{i:05d}.jpg"
            img.save(img_path, quality=95)
            n = i + 1
            if n % 50 == 0:
                print(f"[{split_name}] {n}/{limit}")

            gt = json.loads(ex["ground_truth"])
            boxes, kie = [], []
            for line in gt.get("valid_line", []):
                cat = line.get("category", "")
                for w in line.get("words", []):
                    q = w["quad"]
                    pts = [[q["x1"], q["y1"]], [q["x2"], q["y2"]],
                           [q["x3"], q["y3"]], [q["x4"], q["y4"]]]
                    text = norm_text(w.get("text", ""))
                    if not text:
                        continue
                    boxes.append({"transcription": text, "points": pts})

                    if CORD_FIELD_MAP.get(cat):
                        kie.append({"field": CORD_FIELD_MAP[cat], "text": text})

                    # rec crop
                    if args.make_crops:
                        xs = [p[0] for p in pts]
                        ys = [p[1] for p in pts]
                        x0, x1 = max(0, min(xs)), min(img.width, max(xs))
                        y0, y1 = max(0, min(ys)), min(img.height, max(ys))
                        if x1 - x0 < 4 or y1 - y0 < 4:
                            continue
                        cp = crop_dir / f"{split_name}_{i:05d}_{len(rec_rows):04d}.jpg"
                        img.crop((x0, y0, x1, y1)).save(cp, quality=95)
                        rec_rows.append(f"{cp.as_posix()}\t{text}")

            if boxes:
                det_rows.append(f"{img_path.as_posix()}\t{json.dumps(boxes, ensure_ascii=False)}")
            if kie:
                kie_rows.append(json.dumps(
                    {"image": img_path.as_posix(), "fields": kie}, ensure_ascii=False))

        write_lines(out / "det" / f"{split_name}_label.txt", det_rows)
        if rec_rows:
            write_lines(out / "rec" / f"{split_name}_label.txt", rec_rows)
        if kie_rows:
            write_lines(out / "kie" / f"{split_name}.jsonl", kie_rows)


# ---------------------------------------------------------------- 상표 lexicon
def cmd_brand(args):
    """
    상표 데이터는 OCR '학습'보다 인식 결과 후보정 사전으로 쓰는 게 효율적이다.
    (라벨에 있는 상표명 텍스트만 뽑아서 lexicon으로 저장)
    """
    root = Path(args.root)
    names = set()

    for jp in root.rglob("*.json"):
        try:
            data = json.loads(jp.read_text(encoding="utf-8"))
        except Exception:
            continue
        stack = [data]
        while stack:
            node = stack.pop()
            if isinstance(node, dict):
                for k, v in node.items():
                    if isinstance(v, str) and any(
                        key in k.lower() for key in ("brand", "name", "상표", "상품", "title")
                    ):
                        t = norm_text(v)
                        if 1 < len(t) <= 30:
                            names.add(t)
                    else:
                        stack.append(v)
            elif isinstance(node, list):
                stack.extend(node)

    # 폴더명이 상표명인 배포본 대응
    for d in root.rglob("*"):
        if d.is_dir() and 1 < len(d.name) <= 30 and not d.name.isdigit():
            names.add(norm_text(d.name))

    write_lines(Path(args.out) / "brands.txt", sorted(names))


# ---------------------------------------------------------------- dict / split
def cmd_dict(args):
    chars = set()
    for lp in args.labels:
        with open(lp, encoding="utf-8") as f:
            for line in f:
                if "\t" not in line:
                    continue
                chars.update(line.rstrip("\n").split("\t", 1)[1])
    chars.discard(" ")
    write_lines(args.out, sorted(chars))
    print("[info] use_space_char: true 를 config에 반드시 설정할 것")


def cmd_split(args):
    lines = [l.rstrip("\n") for l in open(args.label, encoding="utf-8") if l.strip()]
    random.seed(42)
    random.shuffle(lines)
    k = int(len(lines) * args.ratio)
    base = Path(args.label).with_suffix("")
    write_lines(f"{base}_train.txt", lines[:k])
    write_lines(f"{base}_val.txt", lines[k:])


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("aihub-rec")
    p.add_argument("--root", required=True)
    p.add_argument("--out", default="data/rec")
    p.add_argument("--limit", type=int, default=0)
    p.add_argument("--skip-syllable", action="store_true", default=True)
    p.set_defaults(func=cmd_aihub_rec)

    p = sub.add_parser("cord")
    p.add_argument("--out", default="data/cord")
    p.add_argument("--make-crops", action="store_true", default=True)
    p.add_argument("--limit-train", type=int, default=800,
                    help="train에서 받을 개수 (CORD train 전체는 800장 근처)")
    p.add_argument("--limit-val", type=int, default=100)
    p.add_argument("--limit-test", type=int, default=100)
    p.set_defaults(func=cmd_cord)

    p = sub.add_parser("brand")
    p.add_argument("--root", required=True)
    p.add_argument("--out", default="data/lexicon")
    p.set_defaults(func=cmd_brand)

    p = sub.add_parser("dict")
    p.add_argument("--labels", nargs="+", required=True)
    p.add_argument("--out", default="data/korean_receipt_dict.txt")
    p.set_defaults(func=cmd_dict)

    p = sub.add_parser("split")
    p.add_argument("--label", required=True)
    p.add_argument("--ratio", type=float, default=0.95)
    p.set_defaults(func=cmd_split)

    args = ap.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
