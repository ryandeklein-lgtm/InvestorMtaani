-- Public registration has no separate email activation step in the current app.
-- New accounts must therefore use the active status the sign-in flow expects.
-- Existing pending or suspended accounts are intentionally left unchanged.
ALTER TABLE users ALTER COLUMN status SET DEFAULT 'active';
