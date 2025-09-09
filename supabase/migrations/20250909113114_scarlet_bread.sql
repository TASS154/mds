/*
  # RPG Game Database Schema

  1. New Tables
    - `game_sessions`
      - `id` (uuid, primary key)
      - `name` (text)
      - `master_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `combat_state` (jsonb)
    
    - `characters`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references game_sessions)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `level` (integer)
      - `attributes` (jsonb)
      - `resources` (jsonb)
      - `innate_ability` (jsonb)
      - `magic_proficiency` (jsonb)
      - `background` (text)
      - `personality` (jsonb)
      - `states` (jsonb)
      - `equipment` (jsonb)
      - `spiritual_abilities` (jsonb)
      - `spells` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `binding_vows`
      - `id` (uuid, primary key)
      - `character_id` (uuid, references characters)
      - `session_id` (uuid, references game_sessions)
      - `name` (text)
      - `type` (text)
      - `subtype` (text)
      - `description` (text)
      - `condition` (text)
      - `benefit` (jsonb)
      - `penalty` (jsonb)
      - `active` (boolean)
      - `duration` (integer)
      - `created_at` (timestamp)
    
    - `dice_rolls`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references game_sessions)
      - `player_id` (uuid, references auth.users)
      - `player_name` (text)
      - `type` (text)
      - `result` (integer)
      - `modifier` (integer)
      - `total` (integer)
      - `attribute` (text)
      - `dc` (integer)
      - `success` (boolean)
      - `is_black_flash` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Masters can manage session data
*/

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  master_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  combat_state jsonb DEFAULT '{"active": false, "participants": [], "currentTurn": 0, "round": 1}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create characters table
CREATE TABLE IF NOT EXISTS characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  level integer DEFAULT 1,
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  resources jsonb NOT NULL DEFAULT '{}'::jsonb,
  innate_ability jsonb NOT NULL DEFAULT '{}'::jsonb,
  magic_proficiency jsonb NOT NULL DEFAULT '{}'::jsonb,
  background text DEFAULT '',
  personality jsonb DEFAULT '[]'::jsonb,
  states jsonb DEFAULT '[]'::jsonb,
  equipment jsonb DEFAULT '[]'::jsonb,
  spiritual_abilities jsonb DEFAULT '[]'::jsonb,
  spells jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create binding_vows table
CREATE TABLE IF NOT EXISTS binding_vows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id uuid REFERENCES characters(id) ON DELETE CASCADE,
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('momentary', 'permanent')),
  subtype text CHECK (subtype IN ('inhibitor', 'subjugated')),
  description text DEFAULT '',
  condition text NOT NULL,
  benefit jsonb NOT NULL DEFAULT '{}'::jsonb,
  penalty jsonb DEFAULT '{}'::jsonb,
  active boolean DEFAULT false,
  duration integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create dice_rolls table
CREATE TABLE IF NOT EXISTS dice_rolls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  player_name text NOT NULL,
  type text NOT NULL,
  result integer NOT NULL,
  modifier integer DEFAULT 0,
  total integer NOT NULL,
  attribute text,
  dc integer,
  success boolean,
  is_black_flash boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE binding_vows ENABLE ROW LEVEL SECURITY;
ALTER TABLE dice_rolls ENABLE ROW LEVEL SECURITY;

-- Create policies for game_sessions
CREATE POLICY "Users can view sessions they participate in"
  ON game_sessions
  FOR SELECT
  TO authenticated
  USING (
    master_id = auth.uid() OR
    id IN (
      SELECT session_id FROM characters WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Masters can manage their sessions"
  ON game_sessions
  FOR ALL
  TO authenticated
  USING (master_id = auth.uid())
  WITH CHECK (master_id = auth.uid());

-- Create policies for characters
CREATE POLICY "Users can view characters in their sessions"
  ON characters
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    session_id IN (
      SELECT id FROM game_sessions WHERE master_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own characters"
  ON characters
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Masters can manage characters in their sessions"
  ON characters
  FOR ALL
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM game_sessions WHERE master_id = auth.uid()
    )
  );

-- Create policies for binding_vows
CREATE POLICY "Users can view vows in their sessions"
  ON binding_vows
  FOR SELECT
  TO authenticated
  USING (
    character_id IN (
      SELECT id FROM characters WHERE user_id = auth.uid()
    ) OR
    session_id IN (
      SELECT id FROM game_sessions WHERE master_id = auth.uid()
    )
  );

CREATE POLICY "Masters can manage binding vows"
  ON binding_vows
  FOR ALL
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM game_sessions WHERE master_id = auth.uid()
    )
  );

-- Create policies for dice_rolls
CREATE POLICY "Users can view dice rolls in their sessions"
  ON dice_rolls
  FOR SELECT
  TO authenticated
  USING (
    player_id = auth.uid() OR
    session_id IN (
      SELECT id FROM game_sessions WHERE master_id = auth.uid()
    ) OR
    session_id IN (
      SELECT session_id FROM characters WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create dice rolls"
  ON dice_rolls
  FOR INSERT
  TO authenticated
  WITH CHECK (player_id = auth.uid());

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_game_sessions_updated_at
  BEFORE UPDATE ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON characters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_characters_session_id ON characters(session_id);
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_binding_vows_character_id ON binding_vows(character_id);
CREATE INDEX IF NOT EXISTS idx_binding_vows_session_id ON binding_vows(session_id);
CREATE INDEX IF NOT EXISTS idx_dice_rolls_session_id ON dice_rolls(session_id);
CREATE INDEX IF NOT EXISTS idx_dice_rolls_created_at ON dice_rolls(created_at DESC);