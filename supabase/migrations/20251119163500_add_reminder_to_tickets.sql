-- Add reminder_minutes column to tickets table
-- For notification functionality (e.g., 10 minutes before, 1 day before)

ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS reminder_minutes INTEGER;

COMMENT ON COLUMN tickets.reminder_minutes IS 'Number of minutes before start_time to send reminder notification (NULL = no reminder)';
