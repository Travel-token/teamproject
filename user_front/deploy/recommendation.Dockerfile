FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY algorithm_server/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY algorithm_server/app.py algorithm_server/recommendation_service.py ./
RUN mkdir -p /data/recommendation
EXPOSE 5050
CMD ["python", "app.py"]

