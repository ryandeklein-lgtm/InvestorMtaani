CREATE TABLE IF NOT EXISTS business_follows (
  follower_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_user_id, business_id)
);

CREATE INDEX IF NOT EXISTS business_follows_business_idx
  ON business_follows (business_id, created_at DESC);

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS sender_id BIGINT REFERENCES users(id) ON DELETE SET NULL;
