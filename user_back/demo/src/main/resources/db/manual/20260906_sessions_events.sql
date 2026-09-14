-- Run 20260906_android_integrations.sql first, with the target schema selected.
CREATE TABLE IF NOT EXISTS auth_sessions (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  user_id BIGINT NOT NULL,
  refresh_version BIGINT NOT NULL,
  refresh_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  retry_until TIMESTAMP(3) NULL,
  expires_at TIMESTAMP(3) NOT NULL,
  revoked_at TIMESTAMP(3) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_session_user(user_id,revoked_at,expires_at)
);
-- Compatible with the current partially installed push schema. Existing registrations must register again.
SET @push_session_sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='push_devices' AND column_name='auth_session_id')=0,
  'ALTER TABLE push_devices ADD COLUMN auth_session_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL', 'SELECT 1');
PREPARE push_session_stmt FROM @push_session_sql;
EXECUTE push_session_stmt;
DEALLOCATE PREPARE push_session_stmt;
CREATE TABLE IF NOT EXISTS trip_invitations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  trip_id BIGINT NOT NULL,
  inviter_id BIGINT NOT NULL,
  invitee_id BIGINT NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'pending',
  version INT NOT NULL DEFAULT 1,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_trip_invitee(trip_id,invitee_id),
  INDEX ix_invitee_pending(invitee_id,status,expires_at)
);
CREATE TABLE IF NOT EXISTS notification_events (
  user_id BIGINT NOT NULL,
  event_key VARCHAR(180) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(user_id,event_key)
);
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  campaign_key VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  content_hash CHAR(64) NOT NULL,
  created_by BIGINT NOT NULL,
  recipient_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
