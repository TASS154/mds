/*
  # Add Users Table

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `role` (text, player or master)
      - `characters_created` (integer, count of characters created)
      - `sessions_joined` (jsonb, array of session IDs)
      - `last_active` (timestamp)
      - `preferences` (jsonb, user settings)
      - `created_at` (timestamp)

  2. Security
    - No RLS needed since you disabled it
    - Simple table structure for easy access

  3. Updates
    - Update foreign keys in existing tables to reference users table
    - Add indexes for performance
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('player', 'master')),
  characters_created integer DEFAULT 0,
  sessions_joined jsonb DEFAULT '[]'::jsonb,
  last_active timestamptz DEFAULT now(),
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);

-- Update existing tables to use users table
DO $$
BEGIN
  -- Add user_id to game_sessions if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_sessions' AND column_name = 'master_user_id'
  ) THEN
    ALTER TABLE game_sessions ADD COLUMN master_user_id uuid REFERENCES users(id) ON DELETE CASCADE;
  END IF;

  -- Add user_id to characters if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'characters' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE characters ADD COLUMN user_id uuid REFERENCES users(id) ON DELETE CASCADE;
  END IF;

  -- Add user_id to dice_rolls if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dice_rolls' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE dice_rolls ADD COLUMN user_id uuid REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create trigger to update last_active
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users SET last_active = now() WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update last_active when user interacts
DROP TRIGGER IF EXISTS update_user_activity_characters ON characters;
CREATE TRIGGER update_user_activity_characters
  AFTER INSERT OR UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION update_user_last_active();

DROP TRIGGER IF EXISTS update_user_activity_dice_rolls ON dice_rolls;
CREATE TRIGGER update_user_activity_dice_rolls
  AFTER INSERT ON dice_rolls
  FOR EACH ROW EXECUTE FUNCTION update_user_last_active();