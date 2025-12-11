ALTER TABLE revisions.deltas
	ADD COLUMN IF NOT EXISTS change_notes TEXT NOT NULL;
