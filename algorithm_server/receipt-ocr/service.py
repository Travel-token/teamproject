#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
pipeline.py를 HTTP API로 감싼 서비스.
Spring Boot 백엔드가 영수증 이미지를 여기로 보내면, OCR 결과를
{name, amount, spent_at, category_code, confidence} JSON으로 돌려준다.

DB 저장은 하지 않는다 — 이미 Spring Boot(MyBatis)가 실제 스키마를
갖고 있으니, 이 서비스는 "읽기 전용 OCR 엔진" 역할만 한다.

실행)
  pip install fastapi uvicorn python-multipart
  uvicorn service:app --host 0.0.0.0 --port 8001 --reload

테스트)
  curl -F "image=@samples/01.jpg" http://localhost:8001/ocr
"""
import shutil
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from pipeline import parse_receipt, run_ocr

app = FastAPI(title="Receipt OCR Service")

# 상표 lexicon은 준비되면 이 경로에 두면 자동으로 로드됨 (없어도 동작함)
_LEXICON_PATH = Path("data/lexicon/brands.txt")
_LEXICON = None
if _LEXICON_PATH.is_file():
    _LEXICON = set(
        line.strip() for line in _LEXICON_PATH.read_text(encoding="utf-8").splitlines() if line.strip()
    )


@app.get("/health")
def health():
    """백엔드가 기동 확인용으로 부를 수 있는 엔드포인트."""
    return {"status": "ok"}


@app.post("/ocr")
async def ocr_receipt(image: UploadFile = File(...)):
    """
    영수증 이미지를 받아 OCR 결과 JSON을 반환한다.
    raw_lines는 디버깅용이라 응답에서 제외한다 (백엔드가 저장할 대상이 아님).
    """
    suffix = Path(image.filename or "receipt.jpg").suffix or ".jpg"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        shutil.copyfileobj(image.file, tmp)
        tmp_path = tmp.name

    try:
        lines = run_ocr(tmp_path, use_gpu=False)
        result = parse_receipt(lines, _LEXICON)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR 처리 실패: {e}")
    finally:
        Path(tmp_path).unlink(missing_ok=True)

    # 백엔드가 실제로 쓸 필드만 응답 (raw_lines는 디버깅용이라 제외)
    return JSONResponse({
        "name": result["name"],
        "amount": result["amount"],
        "spentAt": result["spent_at"],
        "categoryCode": result["category_code"],
        "confidence": result["confidence"],
    })
