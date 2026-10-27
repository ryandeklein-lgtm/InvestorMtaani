CREATE TABLE IF NOT EXISTS user_drafts (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  draft_type TEXT NOT NULL CHECK (
    draft_type IN (
      'business_profile',
      'investor_profile',
      'business_kyc',
      'investor_kyc'
    )
  ),
  payload_ciphertext BYTEA NOT NULL,
  payload_iv BYTEA NOT NULL,
  payload_auth_tag BYTEA NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, draft_type)
);

CREATE INDEX IF NOT EXISTS user_drafts_updated_idx
  ON user_drafts (updated_at DESC);
