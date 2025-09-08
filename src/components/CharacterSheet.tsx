import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Zap, Sparkles, Wand2, User, Scroll, Sword, Shield } from 'lucide-react';
import { Character } from '../types';
import { useGame } from '../context/GameContext';
import ResourceBar from './ResourceBar';

interface CharacterSheetProps {
  character: Character;
}

export default function CharacterSheet({ character }: CharacterSheetProps) {
  const { updateResource } = useGame();

  const handleResourceUpdate = (resource: keyof Character['resources'], value: number) => {
    updateResource(character.id, resource, value);
  };

  return (
    <div className="space-y-6">
      {/* Character Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-800 to-blue-800 rounded-lg p-6"
      >
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-gray-300" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{character.name}</h2>
            <p className="text-purple-200">Level {character.level}</p>
            <p className="text-sm text-purple-300">{character.innateAbility.name}</p>
          </div>
        </div>
      </motion.div>

      {/* Resources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800 rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Heart className="w-5 h-5 mr-2 text-red-400" />
          Resources
        </h3>
        <div className="space-y-4">
          <ResourceBar
            label="Health"
            current={character.resources.health.current}
            max={character.resources.health.max}
            color="bg-gradient-to-r from-red-500 to-red-600"
            icon={<Heart className="w-4 h-4 text-red-400" />}
            onClick={(value) => handleResourceUpdate('health', value)}
          />
          <ResourceBar
            label="PE (Energy Points)"
            current={character.resources.pe.current}
            max={character.resources.pe.max}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            icon={<Zap className="w-4 h-4 text-blue-400" />}
            onClick={(value) => handleResourceUpdate('pe', value)}
          />
          <ResourceBar
            label="Ether (Spiritual)"
            current={character.resources.ether.current}
            max={character.resources.ether.max}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            icon={<Sparkles className="w-4 h-4 text-purple-400" />}
            onClick={(value) => handleResourceUpdate('ether', value)}
          />
          <ResourceBar
            label="Vigor (Magic)"
            current={character.resources.vigor.current}
            max={character.resources.vigor.max}
            color="bg-gradient-to-r from-green-500 to-green-600"
            icon={<Wand2 className="w-4 h-4 text-green-400" />}
            onClick={(value) => handleResourceUpdate('vigor', value)}
          />
        </div>
      </motion.div>

      {/* Attributes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800 rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Attributes</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(character.attributes).map(([attr, value]) => (
            <div key={attr} className="text-center">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-gray-400 capitalize">{attr}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Innate Ability */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800 rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
          Innate Ability
        </h3>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-white">{character.innateAbility.name}</h4>
            <span className="text-sm text-purple-400">
              Level {character.innateAbility.level}/{character.innateAbility.maxLevel}
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-2">{character.innateAbility.description}</p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-400">
              Cost: {character.innateAbility.cost} {character.innateAbility.resourceType.toUpperCase()}
            </span>
            <span className="text-green-400">
              Effect: {character.innateAbility.effects[0]?.value || 0} {character.innateAbility.effects[0]?.type}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Magic Proficiency */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800 rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Wand2 className="w-5 h-5 mr-2 text-green-400" />
          Magic Proficiency
        </h3>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white capitalize">
              {character.magicProficiency.type}
            </span>
            <span className="text-sm text-green-400">
              Level {character.magicProficiency.level}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Personality */}
      {character.personality.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-yellow-400" />
            Personality
          </h3>
          <div className="flex flex-wrap gap-2">
            {character.personality.map((trait) => (
              <span
                key={trait.category}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  trait.intensity === 1
                    ? 'bg-blue-500/20 text-blue-400'
                    : trait.intensity === 2
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {trait.category} ({trait.intensity === 1 ? 'Low' : trait.intensity === 2 ? 'Medium' : 'High'})
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Background */}
      {character.background && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Scroll className="w-5 h-5 mr-2 text-amber-400" />
            Background
          </h3>
          <p className="text-gray-400">{character.background}</p>
        </motion.div>
      )}

      {/* States */}
      {character.states.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-800 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-orange-400" />
            Active States
          </h3>
          <div className="space-y-2">
            {character.states.map((state) => (
              <div
                key={state.id}
                className={`p-3 rounded-lg border-l-4 ${
                  state.type === 'buff'
                    ? 'bg-green-500/10 border-green-500'
                    : state.type === 'debuff'
                    ? 'bg-red-500/10 border-red-500'
                    : 'bg-yellow-500/10 border-yellow-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{state.name}</span>
                  <span className="text-sm text-gray-400">
                    {state.duration > 0 ? `${state.duration} rounds` : 'Permanent'}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">{state.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Binding Vows */}
      {character.bindingVows.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-800 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Scroll className="w-5 h-5 mr-2 text-red-400" />
            Binding Vows
          </h3>
          <div className="space-y-3">
            {character.bindingVows.map((vow) => (
              <div
                key={vow.id}
                className={`p-4 rounded-lg border ${
                  vow.active
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-gray-600 bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{vow.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      vow.type === 'momentary'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {vow.type}
                    </span>
                    {vow.active && (
                      <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">
                        Active
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-2">{vow.description}</p>
                <div className="text-xs text-gray-500">
                  <div>Condition: {vow.condition}</div>
                  <div>Benefit: {vow.benefit.type} ({vow.benefit.value})</div>
                  {vow.penalty && (
                    <div>Penalty: {vow.penalty.type} ({vow.penalty.value})</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}