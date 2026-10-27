-- Bring older installations up to the columns used by current registration
-- and business profile services. These additions are nullable or defaulted so
-- existing rows remain valid and are preserved.
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS monthly_gross NUMERIC(16, 2);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS monthly_net NUMERIC(16, 2);
