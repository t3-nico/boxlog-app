export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      ai_usage: {
        Row: {
          created_at: string;
          id: string;
          month: string;
          request_count: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          month: string;
          request_count?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          month?: string;
          request_count?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      auth_audit_logs: {
        Row: {
          created_at: string;
          event_type: string;
          geo_city: string | null;
          geo_country: string | null;
          id: string;
          ip_address: string | null;
          metadata: Json | null;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          event_type: string;
          geo_city?: string | null;
          geo_country?: string | null;
          id?: string;
          ip_address?: string | null;
          metadata?: Json | null;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          event_type?: string;
          geo_city?: string | null;
          geo_country?: string | null;
          id?: string;
          ip_address?: string | null;
          metadata?: Json | null;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      chat_conversations: {
        Row: {
          created_at: string;
          id: string;
          message_count: number;
          messages: Json;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          message_count?: number;
          messages?: Json;
          title?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          message_count?: number;
          messages?: Json;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      login_attempts: {
        Row: {
          attempt_time: string;
          created_at: string;
          email: string;
          id: string;
          ip_address: string | null;
          is_successful: boolean;
          user_agent: string | null;
        };
        Insert: {
          attempt_time?: string;
          created_at?: string;
          email: string;
          id?: string;
          ip_address?: string | null;
          is_successful?: boolean;
          user_agent?: string | null;
        };
        Update: {
          attempt_time?: string;
          created_at?: string;
          email?: string;
          id?: string;
          ip_address?: string | null;
          is_successful?: boolean;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      mfa_recovery_codes: {
        Row: {
          code_hash: string;
          created_at: string;
          id: string;
          used_at: string | null;
          user_id: string;
        };
        Insert: {
          code_hash: string;
          created_at?: string;
          id?: string;
          used_at?: string | null;
          user_id: string;
        };
        Update: {
          code_hash?: string;
          created_at?: string;
          id?: string;
          used_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          created_at: string;
          default_reminder_minutes: number | null;
          delivery_settings: Json | null;
          enable_browser_notifications: boolean;
          enable_email_notifications: boolean;
          enable_plan_updates: boolean;
          enable_push_notifications: boolean;
          enable_reminders: boolean;
          enable_system_notifications: boolean;
          enable_trash_warnings: boolean;
          id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          default_reminder_minutes?: number | null;
          delivery_settings?: Json | null;
          enable_browser_notifications?: boolean;
          enable_email_notifications?: boolean;
          enable_plan_updates?: boolean;
          enable_push_notifications?: boolean;
          enable_reminders?: boolean;
          enable_system_notifications?: boolean;
          enable_trash_warnings?: boolean;
          id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          default_reminder_minutes?: number | null;
          delivery_settings?: Json | null;
          enable_browser_notifications?: boolean;
          enable_email_notifications?: boolean;
          enable_plan_updates?: boolean;
          enable_push_notifications?: boolean;
          enable_reminders?: boolean;
          enable_system_notifications?: boolean;
          enable_trash_warnings?: boolean;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          action_url: string | null;
          created_at: string;
          data: Json | null;
          expires_at: string | null;
          icon: string | null;
          id: string;
          is_read: boolean;
          message: string | null;
          priority: string;
          read_at: string | null;
          related_plan_id: string | null;
          related_tag_id: string | null;
          title: string;
          type: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          action_url?: string | null;
          created_at?: string;
          data?: Json | null;
          expires_at?: string | null;
          icon?: string | null;
          id?: string;
          is_read?: boolean;
          message?: string | null;
          priority?: string;
          read_at?: string | null;
          related_plan_id?: string | null;
          related_tag_id?: string | null;
          title: string;
          type: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          action_url?: string | null;
          created_at?: string;
          data?: Json | null;
          expires_at?: string | null;
          icon?: string | null;
          id?: string;
          is_read?: boolean;
          message?: string | null;
          priority?: string;
          read_at?: string | null;
          related_plan_id?: string | null;
          related_tag_id?: string | null;
          title?: string;
          type?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_related_plan_id_fkey';
            columns: ['related_plan_id'];
            isOneToOne: false;
            referencedRelation: 'plans';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_related_tag_id_fkey';
            columns: ['related_tag_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id'];
          },
        ];
      };
      plan_activities: {
        Row: {
          action_type: string;
          created_at: string;
          field_name: string | null;
          id: string;
          metadata: Json | null;
          new_value: string | null;
          old_value: string | null;
          plan_id: string | null;
          user_id: string;
        };
        Insert: {
          action_type: string;
          created_at?: string;
          field_name?: string | null;
          id?: string;
          metadata?: Json | null;
          new_value?: string | null;
          old_value?: string | null;
          plan_id?: string | null;
          user_id: string;
        };
        Update: {
          action_type?: string;
          created_at?: string;
          field_name?: string | null;
          id?: string;
          metadata?: Json | null;
          new_value?: string | null;
          old_value?: string | null;
          plan_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'plan_activities_plan_id_fkey';
            columns: ['plan_id'];
            isOneToOne: false;
            referencedRelation: 'plans';
            referencedColumns: ['id'];
          },
        ];
      };
      plan_instances: {
        Row: {
          created_at: string;
          description: string | null;
          exception_type: string | null;
          id: string;
          instance_date: string;
          instance_end: string | null;
          instance_start: string | null;
          original_date: string | null;
          plan_id: string;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          exception_type?: string | null;
          id?: string;
          instance_date: string;
          instance_end?: string | null;
          instance_start?: string | null;
          original_date?: string | null;
          plan_id: string;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          exception_type?: string | null;
          id?: string;
          instance_date?: string;
          instance_end?: string | null;
          instance_start?: string | null;
          original_date?: string | null;
          plan_id?: string;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'plan_instances_plan_id_fkey';
            columns: ['plan_id'];
            isOneToOne: false;
            referencedRelation: 'plans';
            referencedColumns: ['id'];
          },
        ];
      };
      plan_tags: {
        Row: {
          created_at: string | null;
          id: string;
          plan_id: string;
          tag_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          plan_id: string;
          tag_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          plan_id?: string;
          tag_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'plan_tags_plan_id_fkey';
            columns: ['plan_id'];
            isOneToOne: false;
            referencedRelation: 'plans';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'plan_tags_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id'];
          },
        ];
      };
      plan_template_tags: {
        Row: {
          created_at: string;
          id: string;
          tag_id: string;
          template_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          tag_id: string;
          template_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          tag_id?: string;
          template_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'plan_template_tags_template_id_fkey';
            columns: ['template_id'];
            isOneToOne: false;
            referencedRelation: 'plan_templates';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'plan_template_tags_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id'];
          },
        ];
      };
      plan_templates: {
        Row: {
          created_at: string;
          description: string | null;
          duration_minutes: number | null;
          id: string;
          name: string;
          plan_description: string | null;
          reminder_minutes: number | null;
          title_pattern: string;
          updated_at: string;
          use_count: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          duration_minutes?: number | null;
          id?: string;
          name: string;
          plan_description?: string | null;
          reminder_minutes?: number | null;
          title_pattern: string;
          updated_at?: string;
          use_count?: number;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          duration_minutes?: number | null;
          id?: string;
          name?: string;
          plan_description?: string | null;
          reminder_minutes?: number | null;
          title_pattern?: string;
          updated_at?: string;
          use_count?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      plans: {
        Row: {
          completed_at: string | null;
          created_at: string | null;
          description: string | null;
          end_time: string | null;
          id: string;
          recurrence_end_date: string | null;
          recurrence_rule: string | null;
          recurrence_type: string | null;
          reminder_at: string | null;
          reminder_minutes: number | null;
          reminder_sent: boolean;
          start_time: string | null;
          status: string;
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string | null;
          description?: string | null;
          end_time?: string | null;
          id?: string;
          recurrence_end_date?: string | null;
          recurrence_rule?: string | null;
          recurrence_type?: string | null;
          reminder_at?: string | null;
          reminder_minutes?: number | null;
          reminder_sent?: boolean;
          start_time?: string | null;
          status?: string;
          title: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string | null;
          description?: string | null;
          end_time?: string | null;
          id?: string;
          recurrence_end_date?: string | null;
          recurrence_rule?: string | null;
          recurrence_type?: string | null;
          reminder_at?: string | null;
          reminder_minutes?: number | null;
          reminder_sent?: boolean;
          start_time?: string | null;
          status?: string;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          updated_at: string;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      record_activities: {
        Row: {
          action_type: string;
          created_at: string;
          field_name: string | null;
          id: string;
          metadata: Json | null;
          new_value: string | null;
          old_value: string | null;
          record_id: string | null;
          user_id: string;
        };
        Insert: {
          action_type: string;
          created_at?: string;
          field_name?: string | null;
          id?: string;
          metadata?: Json | null;
          new_value?: string | null;
          old_value?: string | null;
          record_id?: string | null;
          user_id: string;
        };
        Update: {
          action_type?: string;
          created_at?: string;
          field_name?: string | null;
          id?: string;
          metadata?: Json | null;
          new_value?: string | null;
          old_value?: string | null;
          record_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'record_activities_record_id_fkey';
            columns: ['record_id'];
            isOneToOne: false;
            referencedRelation: 'records';
            referencedColumns: ['id'];
          },
        ];
      };
      record_tags: {
        Row: {
          created_at: string;
          id: string;
          record_id: string;
          tag_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          record_id: string;
          tag_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          record_id?: string;
          tag_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'record_tags_record_id_fkey';
            columns: ['record_id'];
            isOneToOne: false;
            referencedRelation: 'records';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'record_tags_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id'];
          },
        ];
      };
      records: {
        Row: {
          created_at: string;
          duration_minutes: number;
          end_time: string | null;
          fulfillment_score: number | null;
          id: string;
          note: string | null;
          plan_id: string | null;
          start_time: string | null;
          title: string | null;
          updated_at: string;
          user_id: string;
          worked_at: string;
        };
        Insert: {
          created_at?: string;
          duration_minutes: number;
          end_time?: string | null;
          fulfillment_score?: number | null;
          id?: string;
          note?: string | null;
          plan_id?: string | null;
          start_time?: string | null;
          title?: string | null;
          updated_at?: string;
          user_id: string;
          worked_at: string;
        };
        Update: {
          created_at?: string;
          duration_minutes?: number;
          end_time?: string | null;
          fulfillment_score?: number | null;
          id?: string;
          note?: string | null;
          plan_id?: string | null;
          start_time?: string | null;
          title?: string | null;
          updated_at?: string;
          user_id?: string;
          worked_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'records_plan_id_fkey';
            columns: ['plan_id'];
            isOneToOne: false;
            referencedRelation: 'plans';
            referencedColumns: ['id'];
          },
        ];
      };
      tags: {
        Row: {
          color: string | null;
          created_at: string | null;
          description: string | null;
          icon: string | null;
          id: string;
          is_active: boolean;
          name: string;
          parent_id: string | null;
          sort_order: number;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          parent_id?: string | null;
          sort_order?: number;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          parent_id?: string | null;
          sort_order?: number;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'tags_parent_id_fkey';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id'];
          },
        ];
      };
      user_settings: {
        Row: {
          ai_communication_style: string | null;
          ai_custom_style_prompt: string | null;
          business_hours_end: number;
          business_hours_start: number;
          chronotype_custom_zones: Json | null;
          chronotype_display_mode: string;
          chronotype_enabled: boolean;
          chronotype_opacity: number;
          chronotype_type: string;
          color_scheme: string;
          created_at: string;
          date_format: string;
          default_duration: number;
          id: string;
          personalization_ranked_values: Json | null;
          personalization_values: Json | null;
          plan_record_mode: string;
          show_declined_events: boolean;
          show_utc_offset: boolean;
          show_week_numbers: boolean;
          show_weekends: boolean;
          snap_interval: number;
          theme: string;
          time_format: string;
          timezone: string;
          updated_at: string;
          user_id: string;
          week_starts_on: number;
        };
        Insert: {
          ai_communication_style?: string | null;
          ai_custom_style_prompt?: string | null;
          business_hours_end?: number;
          business_hours_start?: number;
          chronotype_custom_zones?: Json | null;
          chronotype_display_mode?: string;
          chronotype_enabled?: boolean;
          chronotype_opacity?: number;
          chronotype_type?: string;
          color_scheme?: string;
          created_at?: string;
          date_format?: string;
          default_duration?: number;
          id?: string;
          personalization_ranked_values?: Json | null;
          personalization_values?: Json | null;
          plan_record_mode?: string;
          show_declined_events?: boolean;
          show_utc_offset?: boolean;
          show_week_numbers?: boolean;
          show_weekends?: boolean;
          snap_interval?: number;
          theme?: string;
          time_format?: string;
          timezone?: string;
          updated_at?: string;
          user_id: string;
          week_starts_on?: number;
        };
        Update: {
          ai_communication_style?: string | null;
          ai_custom_style_prompt?: string | null;
          business_hours_end?: number;
          business_hours_start?: number;
          chronotype_custom_zones?: Json | null;
          chronotype_display_mode?: string;
          chronotype_enabled?: boolean;
          chronotype_opacity?: number;
          chronotype_type?: string;
          color_scheme?: string;
          created_at?: string;
          date_format?: string;
          default_duration?: number;
          id?: string;
          personalization_ranked_values?: Json | null;
          personalization_values?: Json | null;
          plan_record_mode?: string;
          show_declined_events?: boolean;
          show_utc_offset?: boolean;
          show_week_numbers?: boolean;
          show_weekends?: boolean;
          snap_interval?: number;
          theme?: string;
          time_format?: string;
          timezone?: string;
          updated_at?: string;
          user_id?: string;
          week_starts_on?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      user_recent_logins: {
        Row: {
          created_at: string | null;
          ip_address: string | null;
          location: string | null;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          ip_address?: string | null;
          location?: never;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          ip_address?: string | null;
          location?: never;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      cleanup_old_auth_audit_logs: { Args: never; Returns: undefined };
      cleanup_old_login_attempts: { Args: never; Returns: undefined };
      count_unused_recovery_codes: {
        Args: { p_user_id: string };
        Returns: number;
      };
      create_plan_with_tags: {
        Args: {
          p_description?: string;
          p_scheduled_date?: string;
          p_tag_ids?: string[];
          p_title: string;
          p_user_id: string;
        };
        Returns: Json;
      };
      delete_old_notifications: { Args: never; Returns: undefined };
      delete_plan_with_cleanup: {
        Args: { p_plan_id: string; p_user_id: string };
        Returns: Json;
      };
      get_tag_stats: {
        Args: { p_user_id: string };
        Returns: {
          last_used: string;
          plan_count: number;
          tag_id: string;
        }[];
      };
      increment_ai_usage: {
        Args: { p_month: string; p_user_id: string };
        Returns: undefined;
      };
      merge_tags: {
        Args: {
          p_source_tag_ids: string[];
          p_target_tag_id: string;
          p_user_id: string;
        };
        Returns: Json;
      };
      update_plan_with_tags: {
        Args: {
          p_description?: string;
          p_plan_id: string;
          p_scheduled_date?: string;
          p_tag_ids?: string[];
          p_title?: string;
          p_user_id: string;
        };
        Returns: Json;
      };
      use_recovery_code: {
        Args: { p_code_hash: string; p_user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
