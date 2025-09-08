import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Character, GameSession, User, DiceRoll, BindingVow } from '../types';
import { toast } from 'react-hot-toast';

interface GameState {
  user: User | null;
  session: GameSession | null;
  characters: Character[];
  connected: boolean;
  loading: boolean;
}

type GameAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_SESSION'; payload: GameSession }
  | { type: 'UPDATE_CHARACTER'; payload: Character }
  | { type: 'ADD_DICE_ROLL'; payload: DiceRoll }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_COMBAT'; payload: GameSession['combat'] }
  | { type: 'ADD_BINDING_VOW'; payload: { characterId: string; vow: BindingVow } };

const initialState: GameState = {
  user: null,
  session: null,
  characters: [],
  connected: false,
  loading: false,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_SESSION':
      return { ...state, session: action.payload, characters: action.payload.characters };
    case 'UPDATE_CHARACTER':
      return {
        ...state,
        characters: state.characters.map(char =>
          char.id === action.payload.id ? action.payload : char
        ),
        session: state.session ? {
          ...state.session,
          characters: state.session.characters.map(char =>
            char.id === action.payload.id ? action.payload : char
          )
        } : null
      };
    case 'ADD_DICE_ROLL':
      return {
        ...state,
        session: state.session ? {
          ...state.session,
          diceRolls: [...state.session.diceRolls, action.payload]
        } : null
      };
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
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  login: (name: string, role: 'player' | 'master', password?: string) => Promise<void>;
  createCharacter: (character: Omit<Character, 'id'>) => Promise<void>;
  updateCharacter: (character: Character) => void;
  rollDice: (type: DiceRoll['type'], modifier: number, attribute?: keyof Character['attributes'], dc?: number) => Promise<DiceRoll>;
  startCombat: () => void;
  endCombat: () => void;
  nextTurn: () => void;
  addBindingVow: (characterId: string, vow: Omit<BindingVow, 'id'>) => void;
  updateResource: (characterId: string, resource: keyof Character['resources'], value: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Simulate WebSocket connection
  useEffect(() => {
    // In a real app, this would connect to a WebSocket server
    dispatch({ type: 'SET_CONNECTED', payload: true });
  }, []);

  const login = async (name: string, role: 'player' | 'master', password?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Simulate authentication
      if (role === 'master' && password !== 'master123') {
        throw new Error('Invalid master password');
      }

      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        role,
      };

      dispatch({ type: 'SET_USER', payload: user });

      // Create or join session
      const session: GameSession = {
        id: 'session-1',
        name: 'Campaign Session',
        masterId: role === 'master' ? user.id : 'master-id',
        players: role === 'player' ? [user.id] : [],
        characters: [],
        combat: {
          active: false,
          participants: [],
          currentTurn: 0,
          round: 1,
        },
        diceRolls: [],
      };

      dispatch({ type: 'SET_SESSION', payload: session });
      toast.success(`Logged in as ${role}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createCharacter = async (characterData: Omit<Character, 'id'>) => {
    const character: Character = {
      ...characterData,
      id: Math.random().toString(36).substr(2, 9),
    };

    dispatch({ type: 'UPDATE_CHARACTER', payload: character });
    
    if (state.user?.role === 'player') {
      dispatch({ type: 'SET_USER', payload: { ...state.user, characterId: character.id } });
    }

    toast.success('Character created successfully!');
  };

  const updateCharacter = (character: Character) => {
    dispatch({ type: 'UPDATE_CHARACTER', payload: character });
  };

  const rollDice = async (
    type: DiceRoll['type'],
    modifier: number,
    attribute?: keyof Character['attributes'],
    dc?: number
  ): Promise<DiceRoll> => {
    const sides = parseInt(type.substring(1));
    const result = Math.floor(Math.random() * sides) + 1;
    const total = result + modifier;
    
    const isBlackFlash = result === 20 && dc && total >= dc + 5;
    const success = dc ? total >= dc : undefined;

    const roll: DiceRoll = {
      id: Math.random().toString(36).substr(2, 9),
      playerId: state.user?.id || '',
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

    dispatch({ type: 'ADD_DICE_ROLL', payload: roll });

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
        dispatch({ type: 'UPDATE_CHARACTER', payload: updatedCharacter });
        toast.success('BLACK FLASH! Resources restored!', { icon: '⚡' });
      }
    }

    return roll;
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

    dispatch({ type: 'UPDATE_COMBAT', payload: combat });
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

    dispatch({ type: 'UPDATE_COMBAT', payload: combat });
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

    dispatch({ type: 'UPDATE_COMBAT', payload: combat });
  };

  const addBindingVow = (characterId: string, vowData: Omit<BindingVow, 'id'>) => {
    const vow: BindingVow = {
      ...vowData,
      id: Math.random().toString(36).substr(2, 9),
    };

    dispatch({ type: 'ADD_BINDING_VOW', payload: { characterId, vow } });
    toast.success('Binding vow created!');
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

    dispatch({ type: 'UPDATE_CHARACTER', payload: updatedCharacter });
  };

  const contextValue: GameContextType = {
    state,
    login,
    createCharacter,
    updateCharacter,
    rollDice,
    startCombat,
    endCombat,
    nextTurn,
    addBindingVow,
    updateResource,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}