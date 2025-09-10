export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          role: 'player' | 'master';
          characters_created: number;
          sessions_joined: any;
          last_active: string;
          preferences: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: 'player' | 'master';
          characters_created?: number;
          sessions_joined?: any;
          last_active?: string;
          preferences?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: 'player' | 'master';
          characters_created?: number;
          sessions_joined?: any;
          last_active?: string;
          preferences?: any;
          created_at?: string;
        };
      };
      game_sessions: {
        Row: {
          id: string;
          name: string;
          master_user_id: string;
          combat_state: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          master_user_id: string;
          combat_state?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          master_user_id?: string;
          combat_state?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      characters: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          name: string;
          level: number;
          attributes: any;
          resources: any;
          innate_ability: any;
          magic_proficiency: any;
          background: string;
          personality: any;
          states: any;
          equipment: any;
          spiritual_abilities: any;
          spells: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          name: string;
          level?: number;
          attributes: any;
          resources: any;
          innate_ability: any;
          magic_proficiency: any;
          background?: string;
          personality?: any;
          states?: any;
          equipment?: any;
          spiritual_abilities?: any;
          spells?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          name?: string;
          level?: number;
          attributes?: any;
          resources?: any;
          innate_ability?: any;
          magic_proficiency?: any;
          background?: string;
          personality?: any;
          states?: any;
          equipment?: any;
          spiritual_abilities?: any;
          spells?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      binding_vows: {
        Row: {
          id: string;
          character_id: string;
          session_id: string;
          name: string;
          type: 'momentary' | 'permanent';
          subtype: 'inhibitor' | 'subjugated' | null;
          description: string;
          condition: string;
          benefit: any;
          penalty: any;
          active: boolean;
          duration: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          character_id: string;
          session_id: string;
          name: string;
          type: 'momentary' | 'permanent';
          subtype?: 'inhibitor' | 'subjugated' | null;
          description?: string;
          condition: string;
          benefit: any;
          penalty?: any;
          active?: boolean;
          duration?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          character_id?: string;
          session_id?: string;
          name?: string;
          type?: 'momentary' | 'permanent';
          subtype?: 'inhibitor' | 'subjugated' | null;
          description?: string;
          condition?: string;
          benefit?: any;
          penalty?: any;
          active?: boolean;
          duration?: number;
          created_at?: string;
        };
      };
      dice_rolls: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          player_name: string;
          type: string;
          result: number;
          modifier: number;
          total: number;
          attribute: string | null;
          dc: number | null;
          success: boolean | null;
          is_black_flash: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          player_name: string;
          type: string;
          result: number;
          modifier?: number;
          total: number;
          attribute?: string | null;
          dc?: number | null;
          success?: boolean | null;
          is_black_flash?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          player_name?: string;
          type?: string;
          result?: number;
          modifier?: number;
          total?: number;
          attribute?: string | null;
          dc?: number | null;
          success?: boolean | null;
          is_black_flash?: boolean;
          created_at?: string;
        };
      };
    };
  };
}