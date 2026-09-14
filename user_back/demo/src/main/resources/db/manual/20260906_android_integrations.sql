-- MySQL: 개발 DB 백업 후 수동 적용. 애플리케이션은 이 파일을 자동 실행하지 않는다.
CREATE TABLE IF NOT EXISTS payment_candidates (
  user_id BIGINT NOT NULL,
  event_id CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  source_package VARCHAR(200) NOT NULL,
  amount DECIMAL(15,0) NOT NULL,
  observed_at BIGINT NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'pending',
  expense_id BIGINT NULL,
  trip_id BIGINT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id,event_id),
  INDEX ix_candidate_status (user_id,status,created_at)
);
CREATE TABLE IF NOT EXISTS push_devices (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  expo_token VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  session_version BIGINT NOT NULL DEFAULT 1,
  min_notification_id BIGINT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_push_user (user_id,enabled)
);
CREATE TABLE IF NOT EXISTS push_outbox (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  notification_id BIGINT NOT NULL,
  device_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  session_version BIGINT NOT NULL,
  state VARCHAR(16) NOT NULL DEFAULT 'pending',
  ticket_id VARCHAR(200) NULL,
  send_attempts INT NOT NULL DEFAULT 0,
  last_error VARCHAR(100) NULL,
  available_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_push_delivery (notification_id,device_id),
  INDEX ix_push_due (state,available_at)
);
