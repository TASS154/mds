export interface Character {
  id: string;
  name: string;
  level: number;
  attributes: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    charisma: number;
    wisdom: number;
    innate: number;
    spiritual: number;
    magic: number;
  };
  resources: {
    health: { current: number; max: number };
    pe: { current: number; max: number };
    ether: { current: number; max: number };
    vigor: { current: number; max: number };
  };
  innateAbility: InnateAbility;
  magicProficiency: MagicProficiency;
  background: string;
  personality: PersonalityTrait[];
  states: CharacterState[];
  equipment: Equipment[];
  bindingVows: BindingVow[];
  spiritualAbilities: SpiritualAbility[];
  spells: Spell[];
}

export interface InnateAbility {
  id: string;
  name: string;
  description: string;
  cost: number;
  resourceType: 'pe' | 'ether' | 'vigor';
  level: number;
  maxLevel: number;
  effects: AbilityEffect[];
}

export interface AbilityEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'utility';
  value: number;
  duration?: number;
  target: 'self' | 'ally' | 'enemy' | 'area';
}

export interface MagicProficiency {
  type: 'invocation' | 'conjuration' | 'manipulation' | 'enchantment' | 'divination';
  level: number;
}

export interface PersonalityTrait {
  category: 'heroic' | 'impulsive' | 'cautious' | 'aggressive' | 'diplomatic' | 'mysterious';
  intensity: number;
}

export interface CharacterState {
  id: string;
  name: string;
  type: 'buff' | 'debuff' | 'condition';
  description: string;
  duration: number;
  effects: StateEffect[];
}

export interface StateEffect {
  attribute?: keyof Character['attributes'];
  resource?: keyof Character['resources'];
  modifier: number;
  type: 'add' | 'multiply' | 'set';
}

export interface Equipment {
  id: string;
  name: string;
  type: 'spiritual_weapon' | 'ritual_item' | 'demonic_relic';
  description: string;
  effects: EquipmentEffect[];
  corruption?: number;
  equipped: boolean;
}

export interface EquipmentEffect {
  type: 'attribute_bonus' | 'resource_cost_reduction' | 'damage_bonus' | 'special';
  target: string;
  value: number;
}

export interface BindingVow {
  id: string;
  name: string;
  type: 'momentary' | 'permanent';
  subtype?: 'inhibitor' | 'subjugated';
  description: string;
  condition: string;
  benefit: VowEffect;
  penalty?: VowEffect;
  active: boolean;
  duration?: number;
}

export interface VowEffect {
  type: 'cost_reduction' | 'damage_multiplier' | 'attribute_modifier' | 'special';
  value: number;
  target?: string;
}

export interface SpiritualAbility {
  id: string;
  name: string;
  description: string;
  spiritName: string;
  cost: number;
  unlocked: boolean;
  effects: AbilityEffect[];
}

export interface Spell {
  id: string;
  name: string;
  school: MagicProficiency['type'];
  level: number;
  cost: number;
  description: string;
  effects: AbilityEffect[];
  isProficient: boolean;
}

export interface CombatAction {
  id: string;
  name: string;
  type: 'complete' | 'bonus' | 'free' | 'reaction';
  description: string;
  cost: number;
  resourceType: 'pe' | 'ether' | 'vigor';
  effects: AbilityEffect[];
}

export interface CombatParticipant {
  id: string;
  name: string;
  initiative: number;
  isPlayer: boolean;
  character?: Character;
  currentTurn: boolean;
}

export interface DiceRoll {
  id: string;
  playerId: string;
  playerName: string;
  type: 'd20' | 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd100';
  result: number;
  modifier: number;
  total: number;
  attribute?: keyof Character['attributes'];
  dc?: number;
  success?: boolean;
  isBlackFlash?: boolean;
  timestamp: Date;
}

export interface GameSession {
  id: string;
  name: string;
  masterId: string;
  players: string[];
  characters: Character[];
  combat: {
    active: boolean;
    participants: CombatParticipant[];
    currentTurn: number;
    round: number;
  };
  diceRolls: DiceRoll[];
  map?: CombatMap;
}

export interface CombatMap {
  id: string;
  name: string;
  imageUrl?: string;
  grid: {
    width: number;
    height: number;
    cellSize: number;
  };
  objects: MapObject[];
}

export interface MapObject {
  id: string;
  type: 'character' | 'npc' | 'obstacle' | 'effect';
  position: { x: number; y: number };
  size: { width: number; height: number };
  name: string;
  color?: string;
}

export interface User {
  id: string;
  name: string;
  role: 'player' | 'master';
  characterId?: string;
  sessions_joined?: string[];
  characters_created?: number;
  last_active?: string;
  preferences?: any;
}