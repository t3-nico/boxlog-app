export interface Database {
  public: {
    Tables: {
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
          }
        ]
      }
    }
  }
}
