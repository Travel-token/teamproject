"""Check request scheduling with a fake recognizer; does not load OCR models."""
import asyncio
import importlib.util
import io
import sys
import time
import types
from pathlib import Path

ocr_dir = Path(__file__).resolve().parents[2] / 'algorithm_server' / 'receipt-ocr'
stub = types.ModuleType('pipeline')
stub.run_ocr = lambda *args, **kwargs: []
stub.parse_receipt = lambda *args: {}
sys.modules['pipeline'] = stub
spec = importlib.util.spec_from_file_location('ocr_service_test', ocr_dir / 'service.py')
service = importlib.util.module_from_spec(spec)
spec.loader.exec_module(service)
service._API_KEY = 'test'

def slow_recognizer(path):
    time.sleep(0.3)
    return dict(name='test', amount=100, spent_at=None, category_code=None, confidence={})

async def check():
    service.recognize = slow_recognizer
    upload = lambda: service.UploadFile(filename='test.jpg', file=io.BytesIO(b'test'))
    first = asyncio.create_task(service.ocr_receipt(upload(), 'Bearer test'))
    await asyncio.sleep(0.05)
    assert not first.done(), 'Recognition must not block the event loop'
    assert service.health('Bearer test')['status'] == 'ok'
    try:
        await service.ocr_receipt(upload(), 'Bearer test')
        raise AssertionError('Concurrent OCR request should be rejected')
    except service.HTTPException as error:
        assert error.status_code == 503
    assert (await first).status_code == 200
    assert not service._ocr_lock.locked()
    assert (await service.ocr_receipt(upload(), 'Bearer test')).status_code == 200
    print('PASS: OCR responsiveness, busy response, lock release, next request')

asyncio.run(check())
