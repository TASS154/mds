import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Character, GameSession, User, DiceRoll, BindingVow } from '../types';
import { toast } from 'react-hot-toast';
import { supabase, createUser, getUserByName, updateUserActivity } from '../lib/supabase';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';

interface GameState {
  user: User | null;
  session: GameSession | null;
  characters: Character[];
  connected: boolean;
  loading: boolean;
  diceRolls: DiceRoll[];
}

type GameAction =
  | { type: 'SET_USER'; payload: User }
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
  login: (name: string, role: 'player' | 'master') => Promise<void>;
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

  // Set connected state
  useEffect(() => {
    dispatch({ type: 'SET_CONNECTED', payload: true });
  }, []);

  // Load session and characters when user is set
  useEffect(() => {
    if (state.user) {
      loadUserData();
    }
  }, [state.user]);

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
    if (!state.user) return;

    try {
      // Load user's characters and sessions
      const { data: characters } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', state.user.id);

      if (characters) {
        const transformedCharacters = characters.map(transformDbCharacter);
        dispatch({ type: 'SET_CHARACTERS', payload: transformedCharacters });

        // If user has characters, load their session
        if (characters.length > 0) {
          const sessionId = characters[0].session_id;
          const { data: session } = await supabase
            .from('game_sessions')
            .select('*')
            .eq('id', sessionId)
            .single();

          if (session) {
            const transformedSession = transformDbSession(session);
            dispatch({ type: 'SET_SESSION', payload: transformedSession });

            // Load all characters in the session
            const { data: allCharacters } = await supabase
              .from('characters')
              .select('*')
              .eq('session_id', sessionId);

            if (allCharacters) {
              const allTransformed = allCharacters.map(transformDbCharacter);
              dispatch({ type: 'SET_CHARACTERS', payload: allTransformed });
            }

            // Load dice rolls
            const { data: diceRolls } = await supabase
              .from('dice_rolls')
              .select('*')
              .eq('session_id', sessionId)
              .order('created_at', { ascending: false })
              .limit(50);

            if (diceRolls) {
              const transformedRolls = diceRolls.map(transformDbDiceRoll);
              dispatch({ type: 'SET_DICE_ROLLS', payload: transformedRolls });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const login = async (name: string, role: 'player' | 'master') => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Try to get existing user
      let { data: userData, error } = await getUserByName(name);

      // If user doesn't exist, create new one
      if (!userData && !error) {
        const createResult = await createUser(name, role);
        userData = createResult.data;
        error = createResult.error;
      }

      if (error || !userData) {
        throw new Error('Falha ao entrar no jogo');
      }

      const user: User = {
        id: userData.id,
        name: userData.name,
        role: userData.role as 'player' | 'master',
      };

      dispatch({ type: 'SET_USER', payload: user });
      toast.success(`Logado como ${role === 'player' ? 'Jogador' : 'Mestre'}`);
      
      // Update user activity
      await updateUserActivity(userData.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha no login');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async () => {
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_SESSION', payload: null });
    dispatch({ type: 'SET_CHARACTERS', payload: [] });
    dispatch({ type: 'SET_DICE_ROLLS', payload: [] });
  };

  const createCharacter = async (characterData: Omit<Character, 'id'>) => {
    if (!state.user || !state.session) {
      toast.error('Deve estar logado e em uma sessão para criar personagem');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('characters')
        .insert({
          session_id: state.session.id,
          user_id: state.user.id,
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

      // Update user's character count
      await supabase
        .from('users')
        .update({ characters_created: supabase.rpc('increment', { x: 1 }) })
        .eq('id', state.user.id);

      toast.success('Personagem criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar personagem:', error);
      toast.error('Falha ao criar personagem');
    }
  };

  const updateCharacter = (character: Character) => {
    if (!state.user) return;

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
          toast.error('Falha ao atualizar personagem');
        }
      });
  };

  const rollDice = async (
    type: DiceRoll['type'],
    modifier: number,
    attribute?: keyof Character['attributes'],
    dc?: number
  ): Promise<DiceRoll> => {
    if (!state.user || !state.session) {
      throw new Error('Deve estar logado e em uma sessão para rolar dados');
    }

    const sides = parseInt(type.substring(1));
    const result = Math.floor(Math.random() * sides) + 1;
    const total = result + modifier;
    
    const isBlackFlash = result === 20 && dc && total >= dc + 5;
    const success = dc ? total >= dc : undefined;

    const roll: DiceRoll = {
      id: '', // Will be set by database
      playerId: state.user.id,
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
          user_id: state.user.id,
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
    if (!state.user) return;

    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          name,
          master_user_id: state.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const session = transformDbSession(data);
      dispatch({ type: 'SET_SESSION', payload: session });
      toast.success('Sessão criada com sucesso!');
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Falha ao criar sessão');
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
    masterId: dbSession.master_user_id || dbSession.master_id,
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
    playerId: dbRoll.user_id || dbRoll.player_id,
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