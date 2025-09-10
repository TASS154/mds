/*
  # Add Sample Data to All Tables

  This migration adds sample data to all tables to ensure the application has initial data to work with.

  1. Sample Data Added
     - Sample users (player and master)
     - Sample game session
     - Sample characters with full attributes
     - Sample dice rolls
     - Sample binding vows

  2. Data Structure
     - All tables will have at least one record
     - Realistic game data for testing
     - Proper relationships between tables
*/

-- Insert sample users
INSERT INTO users (id, name, role, characters_created, sessions_joined, last_active, preferences) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Mestre Principal', 'master', 0, '[]'::jsonb, now(), '{}'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440002', 'Jogador Exemplo', 'player', 1, '["550e8400-e29b-41d4-a716-446655440010"]'::jsonb, now(), '{}'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440003', 'Sakura', 'player', 1, '["550e8400-e29b-41d4-a716-446655440010"]'::jsonb, now(), '{}'::jsonb);

-- Insert sample game session
INSERT INTO game_sessions (id, name, master_user_id, combat_state, created_at, updated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', 'Sessão de Exemplo - Jujutsu Kaisen RPG', '550e8400-e29b-41d4-a716-446655440001', 
   '{"round": 1, "active": false, "currentTurn": 0, "participants": []}'::jsonb, now(), now());

-- Insert sample characters
INSERT INTO characters (id, session_id, user_id, name, level, attributes, resources, innate_ability, magic_proficiency, background, personality, states, equipment, spiritual_abilities, spells, created_at, updated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 
   'Yuji Itadori', 2, 
   '{"strength": 18, "dexterity": 14, "constitution": 16, "intelligence": 12, "wisdom": 13, "charisma": 15}'::jsonb,
   '{"hp": {"current": 85, "max": 85}, "pe": {"current": 45, "max": 45}, "ether": {"current": 30, "max": 30}, "vigor": {"current": 40, "max": 40}}'::jsonb,
   '{"name": "Superhuman Strength", "description": "Incredible physical power even without cursed energy", "effects": {"strength": 3, "constitution": 2}}'::jsonb,
   '{"level": 2, "specialization": "Close Combat", "techniques": ["Black Flash", "Divergent Fist"]}'::jsonb,
   'Um estudante do ensino médio que se tornou um feiticeiro após engolir um dedo de Sukuna.',
   '["Determinado", "Corajoso", "Protetor"]'::jsonb,
   '[]'::jsonb,
   '["Uniforme da Escola de Feitiçaria", "Sapatos de corrida especiais"]'::jsonb,
   '["Punho Divergente", "Lampejo Negro"]'::jsonb,
   '[]'::jsonb,
   now(), now()),
  ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003',
   'Nobara Kugisaki', 2,
   '{"strength": 12, "dexterity": 16, "constitution": 14, "intelligence": 15, "wisdom": 14, "charisma": 13}'::jsonb,
   '{"hp": {"current": 70, "max": 70}, "pe": {"current": 55, "max": 55}, "ether": {"current": 50, "max": 50}, "vigor": {"current": 35, "max": 35}}'::jsonb,
   '{"name": "Straw Doll Technique", "description": "Manipulates cursed energy through straw dolls and nails", "effects": {"intelligence": 2, "dexterity": 1}}'::jsonb,
   '{"level": 2, "specialization": "Ranged Combat", "techniques": ["Hairpin", "Resonance"]}'::jsonb,
   'Uma feiticeira confiante de Tóquio que usa a Técnica do Boneco de Palha.',
   '["Confiante", "Determinada", "Fashionista"]'::jsonb,
   '[]'::jsonb,
   '["Martelo", "Pregos", "Bonecos de Palha", "Uniforme da Escola"]'::jsonb,
   '["Grampo", "Ressonância"]'::jsonb,
   '[]'::jsonb,
   now(), now());

-- Insert sample dice rolls
INSERT INTO dice_rolls (id, session_id, user_id, player_name, type, result, modifier, total, attribute, dc, success, is_black_flash, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 
   'Jogador Exemplo', 'd20', 18, 4, 22, 'strength', 15, true, false, now() - interval '5 minutes'),
  ('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003',
   'Sakura', 'd20', 20, 3, 23, 'dexterity', 18, true, true, now() - interval '2 minutes'),
  ('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002',
   'Jogador Exemplo', 'd6', 4, 2, 6, null, null, null, false, now() - interval '1 minute');

-- Insert sample binding vows
INSERT INTO binding_vows (id, character_id, session_id, name, type, subtype, description, condition, benefit, penalty, active, duration, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440010',
   'Voto de Proteção', 'momentary', 'inhibitor', 'Um voto para proteger aliados em combate',
   'Não pode atacar diretamente por 3 turnos', 
   '{"defense": 5, "ally_protection": true}'::jsonb,
   '{"attack_restriction": true, "duration": 3}'::jsonb,
   true, 3, now() - interval '10 minutes'),
  ('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440010',
   'Voto de Precisão', 'permanent', 'subjugated', 'Sacrifica poder bruto por precisão extrema',
   'Reduz força permanentemente em troca de precisão aprimorada',
   '{"accuracy": 10, "critical_chance": 0.15}'::jsonb,
   '{"strength": -2, "permanent": true}'::jsonb,
   true, 0, now() - interval '1 day');