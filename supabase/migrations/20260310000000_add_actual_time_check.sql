-- actual_end_time >= actual_start_time を強制
ALTER TABLE entries ADD CONSTRAINT entries_actual_time_order_check
  CHECK (
    actual_start_time IS NULL
    OR actual_end_time IS NULL
    OR actual_end_time >= actual_start_time
  );

-- scheduled time も同様
ALTER TABLE entries ADD CONSTRAINT entries_scheduled_time_order_check
  CHECK (
    start_time IS NULL
    OR end_time IS NULL
    OR end_time >= start_time
  );
