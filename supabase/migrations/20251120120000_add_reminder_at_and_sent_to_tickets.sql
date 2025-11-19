-- Add reminder_at and reminder_sent columns to tickets table
-- For automatic notification generation via Edge Function

ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS reminder_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE NOT NULL;

COMMENT ON COLUMN tickets.reminder_at IS 'Calculated timestamp when reminder should be sent (start_time - reminder_minutes)';
COMMENT ON COLUMN tickets.reminder_sent IS 'Flag to prevent duplicate reminder notifications';

-- Create index for efficient querying by Edge Function
CREATE INDEX IF NOT EXISTS idx_tickets_reminder_at_sent
ON tickets(reminder_at, reminder_sent)
WHERE reminder_at IS NOT NULL AND reminder_sent = FALSE;
