import React from 'react';
import { motion } from 'framer-motion';
import { Swords, Play, Square, SkipForward, Users, Clock } from 'lucide-react';
import { useGame } from '../context/GameContext';

export default function CombatTracker() {
  const { state, startCombat, endCombat, nextTurn } = useGame();
  const combat = state.session?.combat;

  if (!combat) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Swords className="w-6 h-6 text-red-400" />
          <h3 className="text-lg font-semibold text-white">Combat Tracker</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {!combat.active ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startCombat}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Play className="w-4 h-4" />
              <span>Start Combat</span>
            </motion.button>
          ) : (
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextTurn}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <SkipForward className="w-4 h-4" />
                <span>Next Turn</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={endCombat}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Square className="w-4 h-4" />
                <span>End Combat</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {combat.active && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Round {combat.round}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>{combat.participants.length} participants</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Initiative Order</h4>
            {combat.participants.map((participant, index) => (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  participant.currentTurn
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-gray-600 bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    participant.currentTurn ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                  <span className="font-medium text-white">{participant.name}</span>
                  {participant.isPlayer && (
                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                      Player
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-400">
                    Initiative: {participant.initiative}
                  </span>
                  {participant.character && (
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-red-400">
                        HP: {participant.character.resources.health.current}/{participant.character.resources.health.max}
                      </span>
                      <span className="text-blue-400">
                        PE: {participant.character.resources.pe.current}/{participant.character.resources.pe.max}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {!combat.active && state.characters.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No characters available for combat</p>
          <p className="text-sm text-gray-500 mt-2">Create characters to start combat</p>
        </div>
      )}
    </div>
  );
}