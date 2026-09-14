FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PADDLEOCR_HOME=/data/models
RUN apt-get update && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 libgomp1 curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY algorithm_server/receipt-ocr/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir paddlepaddle && pip install --no-cache-dir -r requirements.txt
COPY algorithm_server/receipt-ocr/ ./
RUN mkdir -p /data/models
EXPOSE 8001
CMD ["uvicorn", "service:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "1"]

