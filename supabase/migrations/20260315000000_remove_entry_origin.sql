-- Migration: Remove entry origin column
--
-- originフィールド（planned/unplanned）を廃止し、
-- 全エントリを統一的に扱う。
-- actual_start_time/actual_end_time が NULL のエントリは
-- start_time/end_time と同値で埋める。

-- 1. 既存エントリの actual_* を埋める（null → start_time/end_time と同値）
UPDATE entries
SET actual_start_time = start_time,
    actual_end_time = end_time
WHERE actual_start_time IS NULL
  AND actual_end_time IS NULL
  AND start_time IS NOT NULL;

-- 2. origin カラムを削除（CHECK制約も自動削除）
ALTER TABLE entries DROP COLUMN IF EXISTS origin;
