import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dice6, Zap, Target } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Character, DiceRoll } from '../types';

interface DiceRollerProps {
  character?: Character;
}

export default function DiceRoller({ character }: DiceRollerProps) {
  const { rollDice, state } = useGame();
  const [selectedAttribute, setSelectedAttribute] = useState<keyof Character['attributes']>('strength');
  const [dc, setDc] = useState<number>(15);
  const [isRolling, setIsRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<DiceRoll | null>(null);

  const handleRoll = async () => {
    if (!character) return;
    
    setIsRolling(true);
    const modifier = character.attributes[selectedAttribute];
    
    try {
      const roll = await rollDice('d20', modifier, selectedAttribute, dc);
      setLastRoll(roll);
    } finally {
      setTimeout(() => setIsRolling(false), 1000);
    }
  };

  const getResultColor = (roll: DiceRoll) => {
    if (roll.isBlackFlash) return 'text-yellow-400';
    if (roll.success === true) return 'text-green-400';
    if (roll.success === false) return 'text-red-400';
    return 'text-gray-300';
  };

  const getResultIcon = (roll: DiceRoll) => {
    if (roll.isBlackFlash) return <Zap className="w-5 h-5 text-yellow-400" />;
    if (roll.success === true) return <Target className="w-5 h-5 text-green-400" />;
    return null;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Dice6 className="w-6 h-6 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Dice Roller</h3>
      </div>

      {character && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Attribute
            </label>
            <select
              value={selectedAttribute}
              onChange={(e) => setSelectedAttribute(e.target.value as keyof Character['attributes'])}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {Object.entries(character.attributes).map(([attr, value]) => (
                <option key={attr} value={attr}>
                  {attr.charAt(0).toUpperCase() + attr.slice(1)} (+{value})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Difficulty Class
            </label>
            <input
              type="number"
              value={dc}
              onChange={(e) => setDc(parseInt(e.target.value) || 15)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              min="5"
              max="30"
            />
          </div>
        </div>
      )}

      <motion.button
        onClick={handleRoll}
        disabled={isRolling || !character}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isRolling ? 'Rolling...' : 'Roll d20'}
      </motion.button>

      <AnimatePresence>
        {lastRoll && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="bg-gray-700 rounded-lg p-4 border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getResultIcon(lastRoll)}
                <span className="font-medium text-white">
                  {lastRoll.attribute?.charAt(0).toUpperCase() + lastRoll.attribute?.slice(1)} Check
                </span>
              </div>
              <span className={`text-2xl font-bold ${getResultColor(lastRoll)}`}>
                {lastRoll.total}
              </span>
            </div>
            
            <div className="text-sm text-gray-400 space-y-1">
              <div>Roll: {lastRoll.result} + Modifier: {lastRoll.modifier}</div>
              {lastRoll.dc && (
                <div>
                  DC: {lastRoll.dc} - {lastRoll.success ? 'SUCCESS' : 'FAILURE'}
                  {lastRoll.isBlackFlash && ' - BLACK FLASH!'}
                </div>
              )}
            </div>

            {lastRoll.isBlackFlash && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 p-2 bg-yellow-500/20 rounded border border-yellow-500/50"
              >
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-medium text-sm">
                    Black Flash triggered! Resources restored!
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {state.session?.diceRolls.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Recent Rolls</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {state.diceRolls.slice(-5).reverse().map((roll) => (
              <div key={roll.id} className="text-xs text-gray-400 flex justify-between">
                <span>{roll.playerName}: {roll.attribute}</span>
                <span className={getResultColor(roll)}>
                  {roll.total} {roll.isBlackFlash && '⚡'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}