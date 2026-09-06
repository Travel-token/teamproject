# Python 3.11 고정 - 3.13+ 는 paddlepaddle 미지원
FROM python:3.11-slim

WORKDIR /app

# PaddleOCR/OpenCV가 런타임에 필요로 하는 시스템 라이브러리
# (없으면 "libGL.so.1: cannot open shared object file" 에러가 남)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# 의존성만 먼저 복사 -> 코드만 바뀌었을 때 이 레이어를 캐시에서 재사용(빌드 빨라짐)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir paddlepaddle==3.0.0

# 애플리케이션 코드
COPY pipeline.py service.py ./
COPY configs/ ./configs/

# 파인튜닝 모델이 준비되면 아래 주석을 풀고 inference/ 폴더를 함께 넣으세요.
# 없으면 첫 실행 시 PaddleOCR 사전학습 한국어 모델을 자동 다운로드합니다.
# COPY inference/ ./inference/

# 모델 캐시 위치 지정 (볼륨으로 마운트하면 재시작 시 재다운로드 방지)
ENV PADDLE_PDX_CACHE_HOME=/app/.paddlex

EXPOSE 8001

# 컨테이너 상태 확인용 (서비스의 /health 엔드포인트 사용)
HEALTHCHECK --interval=30s --timeout=10s --start-period=180s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/health')" || exit 1

CMD ["uvicorn", "service:app", "--host", "0.0.0.0", "--port", "8001"]
