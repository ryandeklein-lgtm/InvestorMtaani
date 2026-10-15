ALTER TABLE matchmaking_requests
  ADD COLUMN IF NOT EXISTS fee_amount NUMERIC(16, 2),
  ADD COLUMN IF NOT EXISTS fee_status TEXT;
