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
      audit_logs: {
        Row: {
          id: string;
          timestamp: string;
          event_type: string;
          severity: string;
          user_id: string | null;
          session_id: string | null;
          ip_address: string | null;
          user_agent: string | null;
          resource: string | null;
          action: string | null;
          metadata: Json;
          success: boolean;
          error_message: string | null;
          created_at: string;
          geo_country: string | null;
          geo_country_name: string | null;
          geo_region: string | null;
          geo_city: string | null;
          geo_timezone: string | null;
          geo_source: string | null;
        };
        Insert: {
          id?: string;
          timestamp?: string;
          event_type: string;
          severity: string;
          user_id?: string | null;
          session_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          resource?: string | null;
          action?: string | null;
          metadata?: Json;
          success?: boolean;
          error_message?: string | null;
          created_at?: string;
          geo_country?: string | null;
          geo_country_name?: string | null;
          geo_region?: string | null;
          geo_city?: string | null;
          geo_timezone?: string | null;
          geo_source?: string | null;
        };
        Update: {
          id?: string;
          timestamp?: string;
          event_type?: string;
          severity?: string;
          user_id?: string | null;
          session_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          resource?: string | null;
          action?: string | null;
          metadata?: Json;
          success?: boolean;
          error_message?: string | null;
          created_at?: string;
          geo_country?: string | null;
          geo_country_name?: string | null;
          geo_region?: string | null;
          geo_city?: string | null;
          geo_timezone?: string | null;
          geo_source?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      mfa_recovery_codes: {
        Row: {
          id: string;
          user_id: string;
          code_hash: string;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          code_hash: string;
          used_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          code_hash?: string;
          used_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'mfa_recovery_codes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      password_history: {
        Row: {
          id: string;
          user_id: string;
          password_hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          password_hash: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          password_hash?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'password_history_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
      notification_preferences: {
        Row: {
          created_at: string;
          default_reminder_minutes: number | null;
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
          exception_type: string | null;
          id: string;
          instance_date: string;
          instance_end: string | null;
          instance_start: string | null;
          is_exception: boolean;
          original_date: string | null;
          overrides: Json | null;
          plan_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          exception_type?: string | null;
          id?: string;
          instance_date: string;
          instance_end?: string | null;
          instance_start?: string | null;
          is_exception?: boolean;
          original_date?: string | null;
          overrides?: Json | null;
          plan_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          exception_type?: string | null;
          id?: string;
          instance_date?: string;
          instance_end?: string | null;
          instance_start?: string | null;
          is_exception?: boolean;
          original_date?: string | null;
          overrides?: Json | null;
          plan_id?: string;
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
      plans: {
        Row: {
          created_at: string | null;
          description: string | null;
          due_date: string | null;
          end_time: string | null;
          id: string;
          plan_number: string;
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
          created_at?: string | null;
          description?: string | null;
          due_date?: string | null;
          end_time?: string | null;
          id?: string;
          plan_number: string;
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
          created_at?: string | null;
          description?: string | null;
          due_date?: string | null;
          end_time?: string | null;
          id?: string;
          plan_number?: string;
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
      tag_groups: {
        Row: {
          color: string | null;
          created_at: string | null;
          description: string | null;
          group_number: number;
          id: string;
          name: string;
          slug: string;
          sort_order: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          group_number?: number;
          id?: string;
          name: string;
          slug: string;
          sort_order?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          group_number?: number;
          id?: string;
          name?: string;
          slug?: string;
          sort_order?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          timezone: string;
          show_utc_offset: boolean;
          time_format: string;
          date_format: string;
          week_starts_on: number;
          show_weekends: boolean;
          show_week_numbers: boolean;
          default_duration: number;
          snap_interval: number;
          business_hours_start: number;
          business_hours_end: number;
          show_declined_events: boolean;
          chronotype_enabled: boolean;
          chronotype_type: string;
          chronotype_custom_zones: Json | null;
          chronotype_display_mode: string;
          chronotype_opacity: number;
          plan_record_mode: string;
          theme: string;
          color_scheme: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          timezone?: string;
          show_utc_offset?: boolean;
          time_format?: string;
          date_format?: string;
          week_starts_on?: number;
          show_weekends?: boolean;
          show_week_numbers?: boolean;
          default_duration?: number;
          snap_interval?: number;
          business_hours_start?: number;
          business_hours_end?: number;
          show_declined_events?: boolean;
          chronotype_enabled?: boolean;
          chronotype_type?: string;
          chronotype_custom_zones?: Json | null;
          chronotype_display_mode?: string;
          chronotype_opacity?: number;
          plan_record_mode?: string;
          theme?: string;
          color_scheme?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          timezone?: string;
          show_utc_offset?: boolean;
          time_format?: string;
          date_format?: string;
          week_starts_on?: number;
          show_weekends?: boolean;
          show_week_numbers?: boolean;
          default_duration?: number;
          snap_interval?: number;
          business_hours_start?: number;
          business_hours_end?: number;
          show_declined_events?: boolean;
          chronotype_enabled?: boolean;
          chronotype_type?: string;
          chronotype_custom_zones?: Json | null;
          chronotype_display_mode?: string;
          chronotype_opacity?: number;
          plan_record_mode?: string;
          theme?: string;
          color_scheme?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_settings_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      tags: {
        Row: {
          color: string | null;
          created_at: string | null;
          description: string | null;
          group_id: string | null;
          icon: string | null;
          id: string;
          is_active: boolean;
          name: string;
          tag_number: number;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          group_id?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          tag_number?: number;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          group_id?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          tag_number?: number;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'tags_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'tag_groups';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      cleanup_old_login_attempts: { Args: never; Returns: undefined };
      delete_old_notifications: { Args: never; Returns: undefined };
      get_next_tag_number: { Args: { p_user_id: string }; Returns: number };
      get_tag_stats: {
        Args: { p_user_id: string };
        Returns: Array<{ tag_id: string; plan_count: number; last_used: string | null }>;
      };
      // MFA Recovery Codes
      count_unused_recovery_codes: { Args: { p_user_id: string }; Returns: number };
      use_recovery_code: { Args: { p_user_id: string; p_code_hash: string }; Returns: boolean };
      // Password History
      check_password_reuse: {
        Args: { p_user_id: string; p_new_password: string };
        Returns: boolean;
      };
      add_password_to_history: {
        Args: { p_user_id: string; p_new_password: string };
        Returns: undefined;
      };
      get_password_history_count: { Args: { p_user_id: string }; Returns: number };
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
