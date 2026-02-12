export type TriggerType =
  | 'plan.status_changed'
  | 'plan.created'
  | 'record.created'
  | 'record.updated';

export type ConditionField =
  | 'status'
  | 'tagIds'
  | 'fulfillment'
  | 'duration'
  | 'timeRange'
  | 'title'
  | 'recurrence';

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'in'
  | 'not_in'
  | 'gte'
  | 'lte'
  | 'between';

export interface AutomationCondition {
  field: ConditionField;
  operator: ConditionOperator;
  value: string | string[];
}

export type ActionType = 'create_record' | 'send_notification' | 'add_tags';

export interface CreateRecordConfig {
  copy_time: boolean;
  copy_tags: boolean;
  default_fulfillment_score?: 1 | 2 | 3 | 4 | 5;
}

export interface SendNotificationConfig {
  title: string;
  message: string;
}

export interface AddTagsConfig {
  tag_ids: string[];
}

export type ActionConfig = CreateRecordConfig | SendNotificationConfig | AddTagsConfig;

export interface Automation {
  id: string;
  name: string;
  description?: string;
  is_enabled: boolean;
  trigger_type: TriggerType;
  conditions: AutomationCondition[];
  action_type: ActionType;
  action_config: ActionConfig;
  trigger_count: number;
  last_triggered_at?: string;
  created_at: string;
}
