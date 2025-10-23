export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string | null
        }
        Update: {
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'backlog' | 'scheduled' | 'in_progress' | 'completed' | 'stopped'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          planned_start: string
          planned_duration: number
          tags: string[] | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'backlog' | 'scheduled' | 'in_progress' | 'completed' | 'stopped'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          planned_start: string
          planned_duration: number
          tags?: string[] | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          title?: string
          description?: string | null
          status?: 'backlog' | 'scheduled' | 'in_progress' | 'completed' | 'stopped'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          planned_start?: string
          planned_duration?: number
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string | null
          parent_id: string | null
          depth: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          color?: string | null
          parent_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          color?: string | null
          parent_id?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'tags_parent_id_fkey'
            columns: ['parent_id']
            referencedRelation: 'tags'
            referencedColumns: ['id']
          },
        ]
      }
    }
  }
}
