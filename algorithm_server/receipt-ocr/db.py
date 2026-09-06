#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""MySQL 8.0 (utf8mb4) expenses 저장. pip install pymysql python-dotenv"""
import os

import pymysql
from dotenv import load_dotenv

load_dotenv()  # 실행 위치와 무관하게 프로젝트 루트의 .env를 자동으로 읽음

DDL = """
CREATE TABLE IF NOT EXISTS expenses (
  id                BIGINT AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(100)   NOT NULL,
  amount            DECIMAL(12,0)  NOT NULL,
  spent_at          DATETIME       NOT NULL,
  category_code     ENUM('meal','ticket','cafe','shop','trans') NOT NULL,
  source            ENUM('ocr','manual','card_sync') NOT NULL DEFAULT 'manual',
  receipt_image_url VARCHAR(500)   NULL,
  payer_member_id   BIGINT         NULL,
  ocr_confidence    JSON           NULL,
  created_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_spent_at (spent_at),
  KEY idx_payer (payer_member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
"""

CONN = dict(
    host=os.getenv("DB_HOST", "127.0.0.1"),
    port=int(os.getenv("DB_PORT", 3306)),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", ""),
    database=os.getenv("DB_NAME", "travel_token"),
    charset="utf8mb4",
    autocommit=True,
)


def init_schema():
    with pymysql.connect(**CONN) as conn, conn.cursor() as cur:
        cur.execute(DDL)


def insert_expense(result, receipt_image_url=None, payer_member_id=None):
    """
    OCR 결과 dict -> expenses INSERT.
    필수 필드가 비면 저장하지 않고 None 반환 (UI에서 수동 보정 유도).
    """
    import json as _json

    missing = [k for k in ("name", "amount", "spent_at") if not result.get(k)]
    if missing:
        print(f"[skip] 인식 실패 필드: {missing} -> UI 수동 입력 필요")
        return None

    sql = """
    INSERT INTO expenses
      (name, amount, spent_at, category_code, source,
       receipt_image_url, payer_member_id, ocr_confidence)
    VALUES (%s, %s, %s, %s, 'ocr', %s, %s, %s)
    """
    with pymysql.connect(**CONN) as conn, conn.cursor() as cur:
        cur.execute(sql, (
            result["name"][:100],
            int(result["amount"]),
            result["spent_at"],
            result["category_code"],
            receipt_image_url,
            payer_member_id,
            _json.dumps(result.get("confidence", {}), ensure_ascii=False),
        ))
        return cur.lastrowid


if __name__ == "__main__":
    init_schema()
    print("schema ready")
