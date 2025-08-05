-- 一時的にイベント履歴記録トリガーを無効化
DROP TRIGGER IF EXISTS record_event_history_trigger ON events;