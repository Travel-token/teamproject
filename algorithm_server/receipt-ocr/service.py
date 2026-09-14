import asyncio
import logging
import time
from starlette.concurrency import run_in_threadpool
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
  uvicorn service:app --host 127.0.0.1 --port 8001 --reload

테스트)
  curl -F "image=@samples/01.jpg" http://localhost:8001/ocr
"""
import hmac
import os
import shutil
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, Header, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from pipeline import _get_ocr_engine, parse_receipt, run_ocr

app = FastAPI(title="Receipt OCR Service")

_model_ready = False
_model_error = None

@app.on_event("startup")
async def warm_ocr_model():
    """모델 탐색/로딩을 첫 영수증 요청보다 먼저 한 번만 수행한다."""
    global _model_ready, _model_error
    try:
        await run_in_threadpool(_get_ocr_engine, False)
        _model_ready = True
    except Exception as exc:
        _model_error = str(exc)
        logging.getLogger('uvicorn.error').exception('OCR model warmup failed')

_API_KEY = os.environ.get("OCR_API_KEY", "")

def require_internal_key(authorization: str | None) -> None:
    if not _API_KEY:
        return
    expected = "Bearer " + _API_KEY
    if not authorization or not hmac.compare_digest(expected, authorization):
        raise HTTPException(status_code=401, detail="unauthorized")


# 상표 lexicon은 준비되면 이 경로에 두면 자동으로 로드됨 (없어도 동작함)
_LEXICON_PATH = Path("data/lexicon/brands.txt")
_LEXICON = None
if _LEXICON_PATH.is_file():
    _LEXICON = set(
        line.strip() for line in _LEXICON_PATH.read_text(encoding="utf-8").splitlines() if line.strip()
    )


@app.get("/health")
def health(authorization: str | None = Header(default=None)):
    """Spring 백엔드가 내부 서비스 상태를 확인한다."""
    require_internal_key(authorization)
    return {"status": "ok", "modelReady": _model_ready, "modelError": _model_error}


_ocr_lock = asyncio.Lock()

def recognize(path):
    started = time.perf_counter()
    try:
        return parse_receipt(run_ocr(path, use_gpu=False), _LEXICON)
    finally:
        logging.getLogger('uvicorn.error').info('OCR processing completed in %.2fs', time.perf_counter() - started)

@app.post("/ocr")
async def ocr_receipt(image: UploadFile = File(...), authorization: str | None = Header(default=None)):
    """
    영수증 이미지를 받아 OCR 결과 JSON을 반환한다.
    raw_lines는 디버깅용이라 응답에서 제외한다 (백엔드가 저장할 대상이 아님).
    """
    require_internal_key(authorization)
    suffix = Path(image.filename or "receipt.jpg").suffix or ".jpg"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        shutil.copyfileobj(image.file, tmp)
        tmp_path = tmp.name

    try:
        if _ocr_lock.locked():
            raise HTTPException(status_code=503, detail='OCR is busy. Please retry shortly.')
        async with _ocr_lock:
            result = await run_in_threadpool(recognize, tmp_path)
    except HTTPException:
        raise
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


