import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll, Plus, X, AlertTriangle } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { BindingVow } from '../types';

export default function BindingVowManager() {
  const { state, addBindingVow } = useGame();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [vowData, setVowData] = useState<Omit<BindingVow, 'id'>>({
    name: '',
    type: 'momentary',
    description: '',
    condition: '',
    benefit: { type: 'cost_reduction', value: 0 },
    active: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCharacter || !vowData.name) return;

    addBindingVow(selectedCharacter, vowData);
    setShowCreateForm(false);
    setVowData({
      name: '',
      type: 'momentary',
      description: '',
      condition: '',
      benefit: { type: 'cost_reduction', value: 0 },
      active: false,
    });
  };

  const isMaster = state.user?.role === 'master';

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Scroll className="w-6 h-6 text-red-400" />
          <h3 className="text-lg font-semibold text-white">Binding Vows</h3>
        </div>
        
        {isMaster && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Plus className="w-4 h-4" />
            <span>Create Vow</span>
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-gray-700 rounded-lg border border-red-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white">Create Binding Vow</h4>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Character
                  </label>
                  <select
                    value={selectedCharacter}
                    onChange={(e) => setSelectedCharacter(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="">Select Character</option>
                    {state.characters.map((char) => (
                      <option key={char.id} value={char.id}>
                        {char.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={vowData.type}
                    onChange={(e) => setVowData(prev => ({ ...prev, type: e.target.value as 'momentary' | 'permanent' }))}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="momentary">Momentary</option>
                    <option value="permanent">Permanent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Vow Name
                </label>
                <input
                  type="text"
                  value={vowData.name}
                  onChange={(e) => setVowData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter vow name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={vowData.description}
                  onChange={(e) => setVowData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 h-20 resize-none"
                  placeholder="Describe the vow's effects"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Condition
                </label>
                <input
                  type="text"
                  value={vowData.condition}
                  onChange={(e) => setVowData(prev => ({ ...prev, condition: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="When does this vow activate?"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Benefit Type
                  </label>
                  <select
                    value={vowData.benefit.type}
                    onChange={(e) => setVowData(prev => ({ 
                      ...prev, 
                      benefit: { ...prev.benefit, type: e.target.value as any }
                    }))}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="cost_reduction">Cost Reduction</option>
                    <option value="damage_multiplier">Damage Multiplier</option>
                    <option value="attribute_modifier">Attribute Modifier</option>
                    <option value="special">Special Effect</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Benefit Value
                  </label>
                  <input
                    type="number"
                    value={vowData.benefit.value}
                    onChange={(e) => setVowData(prev => ({ 
                      ...prev, 
                      benefit: { ...prev.benefit, value: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={vowData.active}
                  onChange={(e) => setVowData(prev => ({ ...prev, active: e.target.checked }))}
                  className="w-4 h-4 text-red-600 bg-gray-600 border-gray-500 rounded focus:ring-red-500"
                />
                <label htmlFor="active" className="text-sm text-gray-300">
                  Activate immediately
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Create Vow
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {state.characters.map((character) => {
          const activeVows = character.bindingVows.filter(vow => vow.active);
          const inactiveVows = character.bindingVows.filter(vow => !vow.active);

          if (character.bindingVows.length === 0) return null;

          return (
            <div key={character.id} className="space-y-3">
              <h4 className="font-medium text-white flex items-center">
                {character.name}
                {activeVows.length > 0 && (
                  <span className="ml-2 text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                    {activeVows.length} active
                  </span>
                )}
              </h4>

              {activeVows.map((vow) => (
                <motion.div
                  key={vow.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="font-medium text-white">{vow.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        vow.type === 'momentary'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {vow.type}
                      </span>
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                        Active
                      </span>
                    </div>
                  </div>
                  
                  {vow.description && (
                    <p className="text-sm text-gray-400 mb-2">{vow.description}</p>
                  )}
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Condition: {vow.condition}</div>
                    <div>Benefit: {vow.benefit.type.replace('_', ' ')} ({vow.benefit.value})</div>
                    {vow.penalty && (
                      <div className="text-red-400">
                        Penalty: {vow.penalty.type.replace('_', ' ')} ({vow.penalty.value})
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {inactiveVows.map((vow) => (
                <div
                  key={vow.id}
                  className="p-3 bg-gray-700 border border-gray-600 rounded-lg opacity-60"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">{vow.name}</span>
                    <span className="text-xs px-2 py-1 bg-gray-600 text-gray-400 rounded">
                      Inactive
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        {state.characters.every(char => char.bindingVows.length === 0) && (
          <div className="text-center py-8">
            <Scroll className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No binding vows created</p>
            {isMaster && (
              <p className="text-sm text-gray-500 mt-2">Create vows to enhance gameplay</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}