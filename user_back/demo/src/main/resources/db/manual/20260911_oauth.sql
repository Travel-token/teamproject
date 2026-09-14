CREATE TABLE IF NOT EXISTS oauth_login_attempts (
  state CHAR(36) CHARACTER SET ascii PRIMARY KEY,
  provider VARCHAR(16) NOT NULL,
  app_redirect_uri VARCHAR(255) NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  ticket_hash CHAR(64) CHARACTER SET ascii NULL UNIQUE,
  expires_at DATETIME(3) NOT NULL,
  used_at DATETIME(3) NULL,
  exchanged_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX ix_oauth_expiry (expires_at),
  CONSTRAINT fk_oauth_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

SET @has_place_external_unique := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema=DATABASE() AND table_name='places' AND column_name='external_api_id' AND non_unique=0
);
SET @place_unique_sql := IF(@has_place_external_unique=0,
  'ALTER TABLE places ADD UNIQUE KEY uq_places_external_api_id (external_api_id)',
  'SELECT 1');
PREPARE place_unique_stmt FROM @place_unique_sql;
EXECUTE place_unique_stmt;
DEALLOCATE PREPARE place_unique_stmt;
