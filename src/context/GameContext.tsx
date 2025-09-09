import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Character, GameSession, User, DiceRoll, BindingVow } from '../types';
import { toast } from 'react-hot-toast';
import { supabase, signIn, signUp, signOut, getCurrentUser } from '../lib/supabase';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';

interface GameState {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: GameSession | null;
  characters: Character[];
  connected: boolean;
  loading: boolean;
  diceRolls: DiceRoll[];
}

type GameAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_SUPABASE_USER'; payload: SupabaseUser | null }
  | { type: 'SET_SESSION'; payload: GameSession }
  | { type: 'SET_CHARACTERS'; payload: Character[] }
  | { type: 'UPDATE_CHARACTER'; payload: Character }
  | { type: 'ADD_DICE_ROLL'; payload: DiceRoll }
  | { type: 'SET_DICE_ROLLS'; payload: DiceRoll[] }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_COMBAT'; payload: GameSession['combat'] }
  | { type: 'ADD_BINDING_VOW'; payload: { characterId: string; vow: BindingVow } }
  | { type: 'UPDATE_BINDING_VOWS'; payload: BindingVow[] };

const initialState: GameState = {
  user: null,
  supabaseUser: null,
  session: null,
  characters: [],
  connected: false,
  loading: false,
  diceRolls: [],
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_SUPABASE_USER':
      return { ...state, supabaseUser: action.payload };
    case 'SET_SESSION':
      return { ...state, session: action.payload };
    case 'SET_CHARACTERS':
      return { ...state, characters: action.payload };
    case 'UPDATE_CHARACTER':
      return {
        ...state,
        characters: state.characters.map(char =>
          char.id === action.payload.id ? action.payload : char
        )
      };
    case 'ADD_DICE_ROLL':
      return {
        ...state,
        diceRolls: [...state.diceRolls, action.payload]
      };
    case 'SET_DICE_ROLLS':
      return { ...state, diceRolls: action.payload };
    case 'SET_CONNECTED':
      return { ...state, connected: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'UPDATE_COMBAT':
      return {
        ...state,
        session: state.session ? {
          ...state.session,
          combat: action.payload
        } : null
      };
    case 'ADD_BINDING_VOW':
      return {
        ...state,
        characters: state.characters.map(char =>
          char.id === action.payload.characterId
            ? { ...char, bindingVows: [...char.bindingVows, action.payload.vow] }
            : char
        )
      };
    case 'UPDATE_BINDING_VOWS':
      // This will be handled by character updates from realtime
      return state;
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  login: (email: string, password: string, name: string, role: 'player' | 'master') => Promise<void>;
  logout: () => Promise<void>;
  createCharacter: (character: Omit<Character, 'id'>) => Promise<void>;
  updateCharacter: (character: Character) => void;
  rollDice: (type: DiceRoll['type'], modifier: number, attribute?: keyof Character['attributes'], dc?: number) => Promise<DiceRoll>;
  startCombat: () => void;
  endCombat: () => void;
  nextTurn: () => void;
  addBindingVow: (characterId: string, vow: Omit<BindingVow, 'id'>) => void;
  updateResource: (characterId: string, resource: keyof Character['resources'], value: number) => void;
  joinSession: (sessionId: string) => Promise<void>;
  createSession: (name: string) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { user: supabaseUser, loading: authLoading } = useSupabaseAuth();

  // Set Supabase user
  useEffect(() => {
    dispatch({ type: 'SET_SUPABASE_USER', payload: supabaseUser });
    dispatch({ type: 'SET_CONNECTED', payload: true });
  }, [supabaseUser]);

  // Load session and characters when user is authenticated
  useEffect(() => {
    if (supabaseUser && state.user) {
      loadUserData();
    }
  }, [supabaseUser, state.user]);

  // Realtime subscriptions
  useRealtimeSubscription({
    table: 'characters',
    filter: state.session ? `session_id=eq.${state.session.id}` : undefined,
    onInsert: (payload) => {
      const character = transformDbCharacter(payload.new);
      dispatch({ type: 'SET_CHARACTERS', payload: [...state.characters, character] });
    },
    onUpdate: (payload) => {
      const character = transformDbCharacter(payload.new);
      dispatch({ type: 'UPDATE_CHARACTER', payload: character });
    },
    onDelete: (payload) => {
      dispatch({ 
        type: 'SET_CHARACTERS', 
        payload: state.characters.filter(c => c.id !== payload.old.id) 
      });
    },
  });

  useRealtimeSubscription({
    table: 'dice_rolls',
    filter: state.session ? `session_id=eq.${state.session.id}` : undefined,
    onInsert: (payload) => {
      const roll = transformDbDiceRoll(payload.new);
      dispatch({ type: 'ADD_DICE_ROLL', payload: roll });
    },
  });

  useRealtimeSubscription({
    table: 'game_sessions',
    filter: state.session ? `id=eq.${state.session.id}` : undefined,
    onUpdate: (payload) => {
      if (state.session) {
        const updatedSession = {
          ...state.session,
          combat: payload.new.combat_state,
        };
        dispatch({ type: 'SET_SESSION', payload: updatedSession });
      }
    },
  });

  const loadUserData = async () => {
    if (!supabaseUser) return;

    try {
      // Load user's character and session
      const { data: characters } = await supabase
        .from('characters')
        .select('*, game_sessions(*)')
        .eq('user_id', supabaseUser.id)
        .single();

      if (characters) {
        const character = transformDbCharacter(characters);
        const session = transformDbSession(characters.game_sessions);
        
        dispatch({ type: 'SET_SESSION', payload: session });
        dispatch({ type: 'SET_CHARACTERS', payload: [character] });
        
        // Load all characters in the session
        const { data: allCharacters } = await supabase
          .from('characters')
          .select('*')
          .eq('session_id', session.id);

        if (allCharacters) {
          const transformedCharacters = allCharacters.map(transformDbCharacter);
          dispatch({ type: 'SET_CHARACTERS', payload: transformedCharacters });
        }

        // Load dice rolls
        const { data: diceRolls } = await supabase
          .from('dice_rolls')
          .select('*')
          .eq('session_id', session.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (diceRolls) {
          const transformedRolls = diceRolls.map(transformDbDiceRoll);
          dispatch({ type: 'SET_DICE_ROLLS', payload: transformedRolls });
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const login = async (email: string, password: string, name: string, role: 'player' | 'master') => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Try to sign in first
      let { data, error } = await signIn(email, password);
      
      // If sign in fails, try to sign up
      if (error && error.message.includes('Invalid login credentials')) {
        const signUpResult = await signUp(email, password, name);
        data = signUpResult.data;
        error = signUpResult.error;
      }

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('Authentication failed');
      }

      const user: User = {
        id: data.user.id,
        name,
        role,
      };

      dispatch({ type: 'SET_USER', payload: user });
      toast.success(`Logged in as ${role}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async () => {
    await signOut();
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_SESSION', payload: null });
    dispatch({ type: 'SET_CHARACTERS', payload: [] });
  };

  const createCharacter = async (characterData: Omit<Character, 'id'>) => {
    if (!supabaseUser || !state.session) {
      toast.error('Must be logged in and in a session to create character');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('characters')
        .insert({
          session_id: state.session.id,
          user_id: supabaseUser.id,
          name: characterData.name,
          level: characterData.level,
          attributes: characterData.attributes,
          resources: characterData.resources,
          innate_ability: characterData.innateAbility,
          magic_proficiency: characterData.magicProficiency,
          background: characterData.background,
          personality: characterData.personality,
          states: characterData.states,
          equipment: characterData.equipment,
          spiritual_abilities: characterData.spiritualAbilities,
          spells: characterData.spells,
        })
        .select()
        .single();

      if (error) throw error;

      const character = transformDbCharacter(data);
      
      if (state.user?.role === 'player') {
        dispatch({ type: 'SET_USER', payload: { ...state.user, characterId: character.id } });
      }

      toast.success('Character created successfully!');
    } catch (error) {
      console.error('Error creating character:', error);
      toast.error('Failed to create character');
    }
  };

  const updateCharacter = (character: Character) => {
    if (!supabaseUser) return;

    // Update in Supabase
    supabase
      .from('characters')
      .update({
        name: character.name,
        level: character.level,
        attributes: character.attributes,
        resources: character.resources,
        innate_ability: character.innateAbility,
        magic_proficiency: character.magicProficiency,
        background: character.background,
        personality: character.personality,
        states: character.states,
        equipment: character.equipment,
        spiritual_abilities: character.spiritualAbilities,
        spells: character.spells,
      })
      .eq('id', character.id)
      .then(({ error }) => {
        if (error) {
          console.error('Error updating character:', error);
          toast.error('Failed to update character');
        }
      });
  };

  const rollDice = async (
    type: DiceRoll['type'],
    modifier: number,
    attribute?: keyof Character['attributes'],
    dc?: number
  ): Promise<DiceRoll> => {
    if (!supabaseUser || !state.session) {
      throw new Error('Must be logged in and in a session to roll dice');
    }

    const sides = parseInt(type.substring(1));
    const result = Math.floor(Math.random() * sides) + 1;
    const total = result + modifier;
    
    const isBlackFlash = result === 20 && dc && total >= dc + 5;
    const success = dc ? total >= dc : undefined;

    const roll: DiceRoll = {
      id: '', // Will be set by database
      playerId: supabaseUser.id,
      playerName: state.user?.name || '',
      type,
      result,
      modifier,
      total,
      attribute,
      dc,
      success,
      isBlackFlash,
      timestamp: new Date(),
    };

    try {
      const { data, error } = await supabase
        .from('dice_rolls')
        .insert({
          session_id: state.session.id,
          player_id: supabaseUser.id,
          player_name: state.user?.name || '',
          type,
          result,
          modifier,
          total,
          attribute,
          dc,
          success,
          is_black_flash: isBlackFlash,
        })
        .select()
        .single();

      if (error) throw error;

    if (isBlackFlash && state.user?.characterId) {
      const character = state.characters.find(c => c.id === state.user?.characterId);
      if (character) {
        const updatedCharacter = {
          ...character,
          resources: {
            ...character.resources,
            pe: { ...character.resources.pe, current: Math.min(character.resources.pe.max, character.resources.pe.current + Math.floor(character.resources.pe.max * 0.5)) },
            ether: { ...character.resources.ether, current: Math.min(character.resources.ether.max, character.resources.ether.current + Math.floor(character.resources.ether.max * 0.5)) },
            vigor: { ...character.resources.vigor, current: Math.min(character.resources.vigor.max, character.resources.vigor.current + Math.floor(character.resources.vigor.max * 0.5)) },
          }
        };
        updateCharacter(updatedCharacter);
        toast.success('BLACK FLASH! Resources restored!', { icon: '⚡' });
      }
    }

      return transformDbDiceRoll(data);
    } catch (error) {
      console.error('Error rolling dice:', error);
      throw error;
    }
  };

  const startCombat = () => {
    if (!state.session) return;

    const participants: any[] = state.characters.map(char => ({
      id: char.id,
      name: char.name,
      initiative: Math.floor(Math.random() * 20) + 1 + char.attributes.dexterity,
      isPlayer: true,
      character: char,
      currentTurn: false,
    }));

    participants.sort((a, b) => b.initiative - a.initiative);
    participants[0].currentTurn = true;

    const combat = {
      active: true,
      participants,
      currentTurn: 0,
      round: 1,
    };

    updateCombatState(combat);
    toast.success('Combat started!');
  };

  const endCombat = () => {
    if (!state.session) return;

    const combat = {
      active: false,
      participants: [],
      currentTurn: 0,
      round: 1,
    };

    updateCombatState(combat);
    toast.success('Combat ended!');
  };

  const nextTurn = () => {
    if (!state.session?.combat.active) return;

    const participants = [...state.session.combat.participants];
    participants[state.session.combat.currentTurn].currentTurn = false;
    
    const nextTurnIndex = (state.session.combat.currentTurn + 1) % participants.length;
    participants[nextTurnIndex].currentTurn = true;

    const combat = {
      ...state.session.combat,
      participants,
      currentTurn: nextTurnIndex,
      round: nextTurnIndex === 0 ? state.session.combat.round + 1 : state.session.combat.round,
    };

    updateCombatState(combat);
  };

  const addBindingVow = (characterId: string, vowData: Omit<BindingVow, 'id'>) => {
    if (!state.session) return;

    supabase
      .from('binding_vows')
      .insert({
        character_id: characterId,
        session_id: state.session.id,
        name: vowData.name,
        type: vowData.type,
        subtype: vowData.subtype,
        description: vowData.description,
        condition: vowData.condition,
        benefit: vowData.benefit,
        penalty: vowData.penalty,
        active: vowData.active,
        duration: vowData.duration,
      })
      .then(({ error }) => {
        if (error) {
          console.error('Error creating binding vow:', error);
          toast.error('Failed to create binding vow');
        } else {
          toast.success('Binding vow created!');
        }
      });
  };

  const updateResource = (characterId: string, resource: keyof Character['resources'], value: number) => {
    const character = state.characters.find(c => c.id === characterId);
    if (!character) return;

    const updatedCharacter = {
      ...character,
      resources: {
        ...character.resources,
        [resource]: {
          ...character.resources[resource],
          current: Math.max(0, Math.min(character.resources[resource].max, value))
        }
      }
    };

    updateCharacter(updatedCharacter);
  };

  const updateCombatState = (combat: GameSession['combat']) => {
    if (!state.session) return;

    supabase
      .from('game_sessions')
      .update({ combat_state: combat })
      .eq('id', state.session.id)
      .then(({ error }) => {
        if (error) {
          console.error('Error updating combat state:', error);
        }
      });
  };

  const joinSession = async (sessionId: string) => {
    if (!supabaseUser) return;

    try {
      const { data: session, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;

      const transformedSession = transformDbSession(session);
      dispatch({ type: 'SET_SESSION', payload: transformedSession });
      toast.success('Joined session successfully!');
    } catch (error) {
      console.error('Error joining session:', error);
      toast.error('Failed to join session');
    }
  };

  const createSession = async (name: string) => {
    if (!supabaseUser) return;

    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          name,
          master_id: supabaseUser.id,
        })
        .select()
        .single();

      if (error) throw error;

      const session = transformDbSession(data);
      dispatch({ type: 'SET_SESSION', payload: session });
      toast.success('Session created successfully!');
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session');
    }
  };

  const contextValue: GameContextType = {
    state,
    login,
    logout,
    createCharacter,
    updateCharacter,
    rollDice,
    startCombat,
    endCombat,
    nextTurn,
    addBindingVow,
    updateResource,
    joinSession,
    createSession,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

// Helper functions to transform database objects to app types
function transformDbCharacter(dbChar: any): Character {
  return {
    id: dbChar.id,
    name: dbChar.name,
    level: dbChar.level,
    attributes: dbChar.attributes,
    resources: dbChar.resources,
    innateAbility: dbChar.innate_ability,
    magicProficiency: dbChar.magic_proficiency,
    background: dbChar.background,
    personality: dbChar.personality,
    states: dbChar.states,
    equipment: dbChar.equipment,
    bindingVows: [], // Will be loaded separately
    spiritualAbilities: dbChar.spiritual_abilities,
    spells: dbChar.spells,
  };
}

function transformDbSession(dbSession: any): GameSession {
  return {
    id: dbSession.id,
    name: dbSession.name,
    masterId: dbSession.master_id,
    players: [], // Will be populated from characters
    characters: [], // Will be loaded separately
    combat: dbSession.combat_state || {
      active: false,
      participants: [],
      currentTurn: 0,
      round: 1,
    },
    diceRolls: [], // Will be loaded separately
  };
}

function transformDbDiceRoll(dbRoll: any): DiceRoll {
  return {
    id: dbRoll.id,
    playerId: dbRoll.player_id,
    playerName: dbRoll.player_name,
    type: dbRoll.type as DiceRoll['type'],
    result: dbRoll.result,
    modifier: dbRoll.modifier,
    total: dbRoll.total,
    attribute: dbRoll.attribute as keyof Character['attributes'],
    dc: dbRoll.dc,
    success: dbRoll.success,
    isBlackFlash: dbRoll.is_black_flash,
    timestamp: new Date(dbRoll.created_at),
  };
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}