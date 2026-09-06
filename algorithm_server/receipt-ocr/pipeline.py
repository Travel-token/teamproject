#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
파인튜닝된 det/rec 모델로 영수증 이미지 -> expenses 4필드 JSON

출력:
{
  "name": "교동쌈밥",
  "amount": 34000,
  "spent_at": "2026-05-03 12:41:00",
  "category_code": "meal",
  "source": "ocr",
  "confidence": {"name": 0.82, "amount": 0.95, "spent_at": 0.9, "category_code": 0.7},
  "raw_lines": [...]
}

사용) python pipeline.py --image receipt.jpg --lexicon data/lexicon/brands.txt
"""
import argparse
import json
import os
import re
import tempfile
from datetime import datetime

DET_DIR = "./inference/ko_receipt_det"
REC_DIR = "./inference/ko_receipt_rec"
DICT_PATH = "./data/korean_receipt_dict.txt"
MAX_SIDE = 1600  # CPU 추론 속도를 위해 리사이즈할 최대 변 길이(px). 영수증 텍스트엔 충분함

# 파인튜닝 결과물이 아직 없으면(서버 학습 전) PaddleOCR 내장
# 한국어 사전학습 모델을 자동 다운로드해서 씁니다. (5090 없이도 바로 테스트 가능)
_HAS_FINETUNED = os.path.isdir(DET_DIR) and os.path.isdir(REC_DIR)

# ------------------------------------------------------------------ 카테고리
CATEGORY_KEYWORDS = {
    "meal": ["식당", "쌈밥", "국밥", "김밥", "분식", "삼겹", "고기", "곱창", "횟집", "회관",
             "칼국수", "냉면", "짜장", "중화", "china", "돈까스", "돈가스", "초밥", "스시",
             "라멘", "우동", "파스타", "피자", "치킨", "버거", "맥도날드", "롯데리아",
             "김치찌개", "백반", "food", "restaurant", "주점", "포차", "호프", "술집", "이자카야"],
    "cafe": ["카페", "커피", "coffee", "cafe", "스타벅스", "투썸", "이디야", "메가커피",
             "빽다방", "컴포즈", "할리스", "파스쿠찌", "베이커리", "빵", "제과", "디저트",
             "케이크", "아이스크림", "배스킨", "설빙", "공차", "차"],
    "ticket": ["입장", "매표", "티켓", "ticket", "관람", "미술관", "박물관", "전시", "공연",
               "영화", "cgv", "메가박스", "롯데시네마", "놀이공원", "테마파크", "水族",
               "아쿠아리움", "케이블카", "리조트", "입장료", "관광"],
    "trans": ["주유", "충전", "gs칼텍스", "sk에너지", "s-oil", "현대오일", "택시", "taxi",
              "고속", "톨게이트", "통행료", "하이패스", "주차", "parking", "렌터카", "rent",
              "코레일", "ktx", "srt", "버스", "터미널", "항공", "air", "지하철", "교통"],
    "shop": ["마트", "편의점", "gs25", "cu", "세븐일레븐", "이마트", "emart", "홈플러스",
             "롯데마트", "다이소", "올리브영", "백화점", "아울렛", "면세", "기념품", "샵",
             "shop", "store", "약국", "문구", "서점",
             "gsthefresh", "gs the fresh", "gs프레시", "노브랜드", "nobrand",
             "코스트코", "costco", "이마트24", "미니스톱", "씨스페이스"],
}
CATEGORY_FALLBACK = "shop"

# ------------------------------------------------------------------ 정규식
RE_MONEY = re.compile(r"(-?\d{1,3}(?:,\d{3})+|-?\d{3,9})\s*(?:원)?")
RE_DATE = re.compile(
    r"(20\d{2}|\d{2})\s*[./년-]\s*(\d{1,2})\s*[./월-]\s*(\d{1,2})\s*일?")
RE_TIME = re.compile(r"(\d{1,2})\s*[:시]\s*(\d{2})(?:\s*[:분]\s*(\d{2}))?")

AMOUNT_KEYS = ["합계", "합 계", "총액", "총 액", "결제금액", "승인금액", "받을금액",
               "판매총액", "총결제", "결제 금액", "합계금액", "total"]
NEGATIVE_KEYS = ["부가세", "과세", "면세", "봉사료", "거스름", "받은금액", "잔액",
                 "할인", "포인트", "적립", "잔여"]
NAME_NOISE = ["사업자", "대표", "주소", "전화", "tel", "번호", "영수증", "감사", "no.",
              "카드", "승인", "일시", "매장", "point", "http", "www"]


# ------------------------------------------------------------------ OCR
def _resize_for_speed(image_path):
    """
    휴대폰 사진은 화면엔 똑바로 보여도 실제 픽셀은 90/180도 돌아간 채
    저장되고 EXIF Orientation 태그로만 "이렇게 돌려서 보여줘"라고 표시하는
    경우가 많음. PIL은 이 태그를 무시하고 원본 픽셀을 그대로 읽기 때문에,
    그대로 넘기면 OCR이 뒤집힌 글자를 읽어서 결과가 전부 깨짐.
    -> exif_transpose로 실제 픽셀을 바로 세운 뒤 저장(+ 필요시 리사이즈).
    항상 정규화된 임시 파일을 만들어 반환한다(작은 이미지도 방향 보정은 필요).
    """
    from PIL import Image, ImageOps

    with Image.open(image_path) as img:
        img = ImageOps.exif_transpose(img)  # 실제 픽셀을 올바른 방향으로 회전
        w, h = img.size
        long_side = max(w, h)

        if long_side > MAX_SIDE:
            scale = MAX_SIDE / long_side
            new_size = (int(w * scale), int(h * scale))
            img = img.resize(new_size, Image.LANCZOS)
            print(f"[info] 이미지 리사이즈: {w}x{h} -> {new_size[0]}x{new_size[1]} (CPU 속도 개선용)")

        fd, tmp_path = tempfile.mkstemp(suffix=".jpg")
        os.close(fd)
        img.convert("RGB").save(tmp_path, quality=92)
        return tmp_path


import functools


@functools.lru_cache(maxsize=2)
def _get_ocr_engine(use_gpu: bool):
    """
    PaddleOCR 인스턴스 생성은 몇 초~십몇 초 걸린다(모델 로딩).
    CLI(pipeline.py 단발 실행)에서는 어차피 한 번만 쓰니 상관없지만,
    service.py처럼 요청마다 이 함수를 호출하는 경우 캐싱이 필수.
    lru_cache가 (use_gpu) 조합별로 인스턴스를 재사용해준다.

    PaddleOCR 3.x API 기준.
    - 파라미터명이 2.x에서 전부 바뀜: det_model_dir -> text_detection_model_dir,
      use_angle_cls -> use_textline_orientation, use_gpu -> device
    - 문자 사전(rec_char_dict_path)은 더 이상 따로 안 줌.
      export된 모델 폴더의 inference.yml 안에 내장되어 자동으로 읽힘.
    """
    from paddleocr import PaddleOCR

    device = "gpu" if use_gpu else "cpu"

    if _HAS_FINETUNED:
        print("[info] 파인튜닝된 모델 사용")
        return PaddleOCR(
            text_detection_model_dir=DET_DIR,
            text_recognition_model_dir=REC_DIR,
            use_textline_orientation=True,
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
            lang="korean",
            device=device,
            enable_mkldnn=False,  # PaddlePaddle 3.3.x Windows CPU 버그 회피
        )

    # lang="korean" 만 지정하면 첫 실행 시 PP-OCRv5(또는 v4) 한국어
    # 사전학습 det/rec 가중치를 ~/.paddlex 에 자동 다운로드합니다.
    print("[info] 파인튜닝 모델 없음 -> PaddleOCR 내장 한국어 사전학습 모델 사용 "
          "(첫 실행 시 자동 다운로드, 수 분 소요)")
    # 검출 모델을 따로 지정하지 않음: lang="korean"이 자동으로 고르는
    # det/rec 짝이 서로 맞춰 학습된 조합이라, 임의로 바꾸면 crop 좌표가
    # 어긋나서 엉뚱한 글자가 나옴(경험함). 속도는 이미지 리사이즈로 확보.
    return PaddleOCR(
        use_textline_orientation=True,
        use_doc_orientation_classify=False,
        use_doc_unwarping=False,
        lang="korean",
        device=device,
        enable_mkldnn=False,  # PaddlePaddle 3.3.x Windows CPU 버그 회피
    )


def run_ocr(image_path, use_gpu=False):
    ocr = _get_ocr_engine(use_gpu)

    resized_path = _resize_for_speed(image_path)
    try:
        outputs = ocr.predict(resized_path)
    finally:
        if resized_path != image_path:
            os.unlink(resized_path)

    lines = []
    for res in outputs:
        texts = res.get("rec_texts", [])
        scores = res.get("rec_scores", [])
        polys = res.get("rec_polys", res.get("dt_polys", []))
        for text, score, box in zip(texts, scores, polys):
            text = (text or "").strip()
            if not text:
                continue
            ys = [float(p[1]) for p in box]
            xs = [float(p[0]) for p in box]
            lines.append({
                "text": text,
                "score": float(score),
                "y": sum(ys) / len(ys),
                "x": min(xs),
            })
    # 위 -> 아래, 같은 줄이면 왼쪽 -> 오른쪽
    lines.sort(key=lambda d: (round(d["y"] / 12), d["x"]))
    return lines


def merge_rows(lines, tol=12):
    """y좌표가 비슷한 박스를 한 줄로 합침 (영수증은 '항목 ... 금액' 구조라 중요)."""
    rows, cur, cur_y = [], [], None
    for l in lines:
        if cur_y is None or abs(l["y"] - cur_y) <= tol:
            cur.append(l)
            cur_y = l["y"] if cur_y is None else cur_y
        else:
            rows.append(cur)
            cur, cur_y = [l], l["y"]
    if cur:
        rows.append(cur)
    return [{"text": " ".join(c["text"] for c in r),
             "score": min(c["score"] for c in r),
             "y": r[0]["y"]} for r in rows]


# ------------------------------------------------------------------ 필드 추출
def to_int(s):
    try:
        return int(s.replace(",", "").replace("원", "").strip())
    except ValueError:
        return None


def extract_amount(rows):
    cands = []
    for i, r in enumerate(rows):
        t = r["text"]
        low = t.lower()
        if any(k in low for k in NEGATIVE_KEYS):
            continue
        hit = any(k in low for k in AMOUNT_KEYS)
        nums = [to_int(m.group(1)) for m in RE_MONEY.finditer(t)]
        nums = [n for n in nums if n and 100 <= n <= 100_000_000]
        if hit and nums:
            cands.append((3.0, max(nums), r["score"]))
        elif hit and i + 1 < len(rows):
            nxt = [to_int(m.group(1)) for m in RE_MONEY.finditer(rows[i + 1]["text"])]
            nxt = [n for n in nxt if n and 100 <= n <= 100_000_000]
            if nxt:
                cands.append((2.0, max(nxt), r["score"]))
        elif nums:
            cands.append((1.0, max(nums), r["score"]))

    if not cands:
        return None, 0.0
    cands.sort(key=lambda c: (c[0], c[1]), reverse=True)
    w, amount, score = cands[0]
    return amount, round(min(1.0, score * (0.6 + 0.13 * w)), 3)


def extract_spent_at(rows):
    date, time, score = None, None, 0.0
    for r in rows:
        if not date:
            m = RE_DATE.search(r["text"])
            if m:
                y, mo, d = m.groups()
                y = int(y) if len(y) == 4 else 2000 + int(y)
                if 2000 <= y <= 2100 and 1 <= int(mo) <= 12 and 1 <= int(d) <= 31:
                    date = (y, int(mo), int(d))
                    score = r["score"]
        if date and not time:
            m = RE_TIME.search(r["text"])
            if m:
                h, mi, se = m.group(1), m.group(2), m.group(3) or "0"
                if int(h) < 24 and int(mi) < 60:
                    time = (int(h), int(mi), int(se))
        if date and time:
            break

    if not date:
        return None, 0.0
    h, mi, se = time or (0, 0, 0)
    dt = datetime(date[0], date[1], date[2], h, mi, se)
    return dt.strftime("%Y-%m-%d %H:%M:%S"), round(score, 3)


# 상호명 끝에 계산원/대표자 이름이 공백으로 붙어 한 줄로 인식되는 경우가 많음
# (예: "GSTHEFRESH 김진", "교동쌈밥 박*은"). 아래 접미사로 끝나면 실제 상호의
# 일부일 가능성이 높으니 그런 경우만 보존하고, 그 외 짧은 한글 토큰은 사람 이름으로
# 보고 잘라낸다.
_STORE_SUFFIXES = ("점", "관", "집", "샵", "마트", "카페", "식당", "센터", "타운")
_RE_TRAILING_PERSON = re.compile(r"\s+[가-힣*]{2,4}$")


def _strip_trailing_person_name(t: str) -> str:
    m = _RE_TRAILING_PERSON.search(t)
    if not m:
        return t
    tail = m.group(0).strip()
    if tail.endswith(_STORE_SUFFIXES):
        return t
    head = t[: m.start()].strip()
    if len(head) < 2:  # 잘라내고 남는 게 너무 짧으면 원본이 더 안전
        return t
    return head


def extract_name(rows, lexicon=None):
    """상호명은 보통 상단 1~5줄. 노이즈 줄 제외 + 상표 사전 매칭 가산점."""
    best, best_w, best_score = None, -1, 0.0
    for i, r in enumerate(rows[:8]):
        t = r["text"].strip()
        low = t.lower()
        if len(t) < 2 or len(t) > 25:
            continue
        if any(k in low for k in NAME_NOISE):
            continue
        if RE_DATE.search(t) or sum(c.isdigit() for c in t) > len(t) * 0.5:
            continue
        w = 3.0 - i * 0.3
        if lexicon and t in lexicon:
            w += 5.0
        elif lexicon and any(b in t for b in lexicon if len(b) >= 3):
            w += 2.0
        if any(k in t for k in ["점", "식당", "카페", "마트"]):
            w += 0.5
        if w > best_w:
            best, best_w, best_score = t, w, r["score"]

    # '상호:' 라벨이 명시된 경우 우선
    for r in rows[:15]:
        m = re.search(r"(?:상\s*호|가맹점\s*명?)\s*[:：]?\s*(.+)", r["text"])
        if m and len(m.group(1).strip()) >= 2:
            return _strip_trailing_person_name(m.group(1).strip()[:25]), round(r["score"], 3)

    if best:
        best = _strip_trailing_person_name(best)
    return best, round(best_score, 3)


def classify(name, rows):
    text = " ".join([name or ""] + [r["text"] for r in rows]).lower()
    scores = {c: 0 for c in CATEGORY_KEYWORDS}
    for code, kws in CATEGORY_KEYWORDS.items():
        for kw in kws:
            if kw in text:
                # 상호명에서 걸리면 가중치 3배
                scores[code] += 3 if name and kw in name.lower() else 1
    code, hit = max(scores.items(), key=lambda kv: kv[1])
    if hit == 0:
        return CATEGORY_FALLBACK, 0.3
    return code, round(min(0.95, 0.5 + 0.1 * hit), 3)


# ------------------------------------------------------------------ main
def parse_receipt(lines, lexicon=None):
    rows = merge_rows(lines)
    name, s_name = extract_name(rows, lexicon)
    amount, s_amt = extract_amount(rows)
    spent_at, s_dt = extract_spent_at(rows)
    code, s_cat = classify(name, rows)
    return {
        "name": name,
        "amount": amount,
        "spent_at": spent_at,
        "category_code": code,
        "source": "ocr",
        "confidence": {"name": s_name, "amount": s_amt,
                       "spent_at": s_dt, "category_code": s_cat},
        "raw_lines": [r["text"] for r in rows],
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--image", required=True)
    ap.add_argument("--lexicon")
    ap.add_argument("--gpu", action="store_true")
    ap.add_argument("--save-db", action="store_true")
    args = ap.parse_args()

    lex = None
    if args.lexicon:
        lex = set(l.strip() for l in open(args.lexicon, encoding="utf-8") if l.strip())

    result = parse_receipt(run_ocr(args.image, args.gpu), lex)
    print(json.dumps(result, ensure_ascii=False, indent=2))

    if args.save_db:
        from db import insert_expense
        insert_expense(result, receipt_image_url=args.image, payer_member_id=None)


if __name__ == "__main__":
    main()
