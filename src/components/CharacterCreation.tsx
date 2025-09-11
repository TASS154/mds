import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Sparkles, Wand2, Shield, Heart, ArrowLeft } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Character, InnateAbility, MagicProficiency, PersonalityTrait } from '../types';

const INNATE_ABILITIES: InnateAbility[] = [
  {
    id: 'fire-manipulation',
    name: 'Fire Manipulation',
    description: 'Control and create flames with your will',
    cost: 15,
    resourceType: 'pe',
    level: 1,
    maxLevel: 5,
    effects: [{ type: 'damage', value: 25, target: 'enemy' }]
  },
  {
    id: 'shadow-step',
    name: 'Shadow Step',
    description: 'Teleport through shadows instantly',
    cost: 20,
    resourceType: 'pe',
    level: 1,
    maxLevel: 5,
    effects: [{ type: 'utility', value: 30, target: 'self' }]
  },
  {
    id: 'mind-read',
    name: 'Mind Reading',
    description: 'Peer into the thoughts of others',
    cost: 25,
    resourceType: 'ether',
    level: 1,
    maxLevel: 5,
    effects: [{ type: 'utility', value: 0, target: 'enemy' }]
  },
  {
    id: 'time-dilation',
    name: 'Time Dilation',
    description: 'Slow down time around you',
    cost: 30,
    resourceType: 'vigor',
    level: 1,
    maxLevel: 5,
    effects: [{ type: 'buff', value: 50, target: 'self', duration: 3 }]
  }
];

const MAGIC_PROFICIENCIES: { type: MagicProficiency['type']; name: string; description: string }[] = [
  { type: 'invocation', name: 'Invocation', description: 'Call forth elemental forces and energy' },
  { type: 'conjuration', name: 'Conjuration', description: 'Summon creatures and objects from other planes' },
  { type: 'manipulation', name: 'Manipulation', description: 'Control matter and energy directly' },
  { type: 'enchantment', name: 'Enchantment', description: 'Influence minds and enhance abilities' },
  { type: 'divination', name: 'Divination', description: 'Reveal hidden knowledge and see the future' }
];

const PERSONALITY_CATEGORIES = [
  'heroic', 'impulsive', 'cautious', 'aggressive', 'diplomatic', 'mysterious'
] as const;

export default function CharacterCreation() {
  const { createCharacter, state } = useGame();
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [character, setCharacter] = useState<Omit<Character, 'id'>>({
    name: '',
    level: 1,
    attributes: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      charisma: 10,
      wisdom: 10,
      innate: 10,
      spiritual: 10,
      magic: 10,
    },
    resources: {
      health: { current: 100, max: 100 },
      pe: { current: 50, max: 50 },
      ether: { current: 30, max: 30 },
      vigor: { current: 40, max: 40 },
    },
    innateAbility: INNATE_ABILITIES[0],
    magicProficiency: { type: 'invocation', level: 1 },
    background: '',
    personality: [],
    states: [],
    equipment: [],
    bindingVows: [],
    spiritualAbilities: [],
    spells: [],
  });

  const [availablePoints, setAvailablePoints] = useState(27);

  const updateAttribute = (attr: keyof Character['attributes'], delta: number) => {
    const newValue = character.attributes[attr] + delta;
    if (newValue < 8 || newValue > 15) return;
    
    const pointCost = delta > 0 ? (newValue > 13 ? 2 : 1) : (character.attributes[attr] > 13 ? -2 : -1);
    if (availablePoints - pointCost < 0 && delta > 0) return;

    setCharacter(prev => ({
      ...prev,
      attributes: { ...prev.attributes, [attr]: newValue }
    }));
    setAvailablePoints(prev => prev - pointCost);
  };

  const updatePersonality = (category: PersonalityTrait['category'], intensity: number) => {
    setCharacter(prev => ({
      ...prev,
      personality: prev.personality.filter(p => p.category !== category).concat(
        intensity > 0 ? [{ category, intensity }] : []
      )
    }));
  };

  const handleSubmit = async () => {
    setIsCreating(true);
    // Calculate resources based on attributes
    const updatedCharacter = {
      ...character,
      resources: {
        health: { 
          current: 80 + (character.attributes.constitution * 4), 
          max: 80 + (character.attributes.constitution * 4) 
        },
        pe: { 
          current: 30 + (character.attributes.innate * 3), 
          max: 30 + (character.attributes.innate * 3) 
        },
        ether: { 
          current: 20 + (character.attributes.spiritual * 2), 
          max: 20 + (character.attributes.spiritual * 2) 
        },
        vigor: { 
          current: 25 + (character.attributes.magic * 2), 
          max: 25 + (character.attributes.magic * 2) 
        },
      }
    };

    await createCharacter(updatedCharacter);
    setIsCreating(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Character Name
              </label>
              <input
                type="text"
                value={character.name}
                onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter character name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Background
              </label>
              <textarea
                value={character.background}
                onChange={(e) => setCharacter(prev => ({ ...prev, background: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
                placeholder="Describe your character's background..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Distribute Attributes</h3>
              <p className="text-gray-400">Points remaining: {availablePoints}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(character.attributes).map(([attr, value]) => (
                <div key={attr} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-300 capitalize">
                      {attr}
                    </span>
                    <span className="text-lg font-bold text-white">{value}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateAttribute(attr as keyof Character['attributes'], -1)}
                      disabled={value <= 8}
                      className="w-8 h-8 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${((value - 8) / 7) * 100}%` }}
                      />
                    </div>
                    <button
                      onClick={() => updateAttribute(attr as keyof Character['attributes'], 1)}
                      disabled={value >= 15 || (availablePoints < (value > 12 ? 2 : 1))}
                      className="w-8 h-8 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Choose Innate Ability</h3>
              <p className="text-gray-400">Select your unique innate power</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INNATE_ABILITIES.map((ability) => (
                <motion.div
                  key={ability.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setCharacter(prev => ({ ...prev, innateAbility: ability }))}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    character.innateAbility.id === ability.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
                    <h4 className="font-semibold text-white">{ability.name}</h4>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{ability.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-400">Cost: {ability.cost} {ability.resourceType.toUpperCase()}</span>
                    <span className="text-green-400">Damage: {ability.effects[0]?.value || 0}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Magic Proficiency</h3>
              <p className="text-gray-400">Choose your magical specialization</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {MAGIC_PROFICIENCIES.map((prof) => (
                <motion.div
                  key={prof.type}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setCharacter(prev => ({ 
                    ...prev, 
                    magicProficiency: { type: prof.type, level: 1 } 
                  }))}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    character.magicProficiency.type === prof.type
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <Wand2 className="w-5 h-5 text-purple-400 mr-2" />
                    <h4 className="font-semibold text-white">{prof.name}</h4>
                  </div>
                  <p className="text-gray-400 text-sm">{prof.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Personality Traits</h3>
              <p className="text-gray-400">Define your character's personality</p>
            </div>

            <div className="space-y-4">
              {PERSONALITY_CATEGORIES.map((category) => {
                const trait = character.personality.find(p => p.category === category);
                const intensity = trait?.intensity || 0;

                return (
                  <div key={category} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300 capitalize">
                        {category}
                      </span>
                      <span className="text-sm text-gray-400">
                        {intensity === 0 ? 'None' : intensity === 1 ? 'Low' : intensity === 2 ? 'Medium' : 'High'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {[0, 1, 2, 3].map((level) => (
                        <button
                          key={level}
                          onClick={() => updatePersonality(category, level)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            intensity >= level && level > 0
                              ? 'bg-purple-500 border-purple-500'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20"
        >
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-white">Create Character</h1>
              <div className="text-sm text-gray-400">Step {step} of 5</div>
            </div>
            
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full ${
                    i <= step ? 'bg-purple-500' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {renderStep()}

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {step < 5 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !character.name}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Character
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}