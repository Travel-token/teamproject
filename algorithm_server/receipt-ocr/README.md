# 영수증 OCR 서비스

영수증 이미지를 받아 지출 정보(상호명/금액/일시/카테고리)를 JSON으로 돌려주는 서비스입니다.

## 현재 상태

- OCR 엔진: **PaddleOCR 사전학습 한국어 모델** 사용 중
- CORD(영수증 레이아웃) + AI Hub(한국어 글자체) 데이터로 **파인튜닝 진행 중**
- 파인튜닝 완료 시 `inference/` 폴더에 모델 파일만 넣으면 자동 전환됩니다 (코드 수정 불필요)

## 실행 방법

### Docker (배포 권장)

```bash
cd algorithm_server/receipt-ocr

docker compose up -d          # 빌드 + 실행
docker compose logs -f        # 로그 확인
```

또는 compose 없이:
```bash
docker build -t receipt-ocr .
docker run -d -p 127.0.0.1:8001:8001 -v paddle-cache:/app/.paddlex receipt-ocr
```

> **첫 실행 시 주의**: 컨테이너가 뜬 뒤 OCR 모델(수십 MB)을 자동 다운로드합니다.
> 첫 요청은 1~3분 걸릴 수 있고, 이후부터는 정상 속도입니다.
> 볼륨(`paddle-cache`)을 지우지 않으면 재시작해도 다시 받지 않습니다.

> **메모리**: PaddleOCR이 메모리를 꽤 사용합니다. **최소 2GB, 권장 4GB** 확보해주세요.
> 부족하면 컨테이너가 OOM으로 죽습니다.

### 로컬 개발 (Python 직접 실행)

```bash
cd algorithm_server/receipt-ocr

python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
pip install paddlepaddle        # CPU 버전 (GPU면 paddlepaddle-gpu)

uvicorn service:app --host 127.0.0.1 --port 8001
```

> Python 3.11 권장 (3.13+ 에서는 paddlepaddle 미지원)
> 첫 실행 시 한국어 OCR 모델(수십 MB)을 자동 다운로드합니다.

## API

### `GET /health`
서버 기동 확인용.
```json
{ "status": "ok" }
```

### `POST /ocr`
영수증 이미지(multipart/form-data, 필드명 `image`)를 보내면 인식 결과를 반환합니다.

**요청 예시**
```bash
curl -F "image=@receipt.jpg" http://localhost:8001/ocr
```

**응답 예시**
```json
{
  "name": "GSTHEFRESH",
  "amount": 31290,
  "spentAt": "2026-04-06 15:15:00",
  "categoryCode": "shop",
  "confidence": {
    "name": 0.322,
    "amount": 0.673,
    "spent_at": 0.998,
    "category_code": 0.8
  }
}
```

| 필드 | 설명 |
|---|---|
| `name` | 상호명 |
| `amount` | 결제 총액 (원 단위 정수) |
| `spentAt` | 결제 일시 (`yyyy-MM-dd HH:mm:ss`) |
| `categoryCode` | `meal` / `ticket` / `cafe` / `shop` / `trans` 중 하나 |
| `confidence` | 필드별 신뢰도 (0~1). 낮으면 UI에서 사용자 확인 유도 권장 |

인식 실패한 필드는 `null`로 옵니다. `payer_member_id`, `trip_id`, `receipt_image_url`은
OCR이 알 수 없는 값이라 백엔드에서 채워주셔야 합니다.

## Spring Boot 연동 예시

```java
@Service
public class OcrClient {
    private final RestTemplate restTemplate = new RestTemplate();
    private final String ocrUrl = "http://localhost:8001/ocr";

    public OcrResult extract(MultipartFile image) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("image", image.getResource());

        return restTemplate.postForEntity(
            ocrUrl, new HttpEntity<>(body, headers), OcrResult.class
        ).getBody();
    }
}

public record OcrResult(
    String name,
    BigDecimal amount,
    String spentAt,
    String categoryCode,
    Map<String, Double> confidence
) {}
```

## 파일 구성

| 파일 | 역할 |
|---|---|
| `service.py` | FastAPI 서버 (백엔드가 호출하는 진입점) |
| `pipeline.py` | OCR 실행 + 텍스트에서 4개 필드 추출하는 후처리 로직 |
| `Dockerfile` | 배포용 컨테이너 정의 (Python 3.11 + 의존성 고정) |
| `docker-compose.yml` | 로컬/서버에서 한 줄로 띄우기 |
| `prepare_data.py` | 학습 데이터 변환 (CORD / AI Hub → PaddleOCR 포맷) |
| `db.py` | 로컬 테스트용 MySQL 저장 (실제 저장은 백엔드에서 처리) |
| `configs/` | 파인튜닝용 학습 설정 파일 |

## 참고

카테고리 분류와 필드 추출은 `pipeline.py`의 키워드/정규식 규칙 기반입니다.
오인식되는 영수증이 있으면 알려주시면 규칙을 보완하겠습니다.
