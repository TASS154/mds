import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Dice6, Swords, Scroll, Settings, LogOut, Plus } from 'lucide-react';
import { useGame } from '../context/GameContext';
import CharacterSheet from './CharacterSheet';
import CharacterCreation from './CharacterCreation';
import DiceRoller from './DiceRoller';
import CombatTracker from './CombatTracker';
import BindingVowManager from './BindingVowManager';

type TabType = 'character' | 'dice' | 'combat' | 'vows' | 'settings';

export default function GameDashboard() {
  const { state, login } = useGame();
  const [activeTab, setActiveTab] = useState<TabType>('character');
  const [showCharacterCreation, setShowCharacterCreation] = useState(false);

  const userCharacter = state.characters.find(char => char.id === state.user?.characterId);
  const needsCharacter = state.user?.role === 'player' && !userCharacter;

  const handleLogout = () => {
    window.location.reload();
  };

  const tabs = [
    { id: 'character' as TabType, name: 'Character', icon: User },
    { id: 'dice' as TabType, name: 'Dice', icon: Dice6 },
    { id: 'combat' as TabType, name: 'Combat', icon: Swords },
    { id: 'vows' as TabType, name: 'Binding Vows', icon: Scroll },
    { id: 'settings' as TabType, name: 'Settings', icon: Settings },
  ];

  if (showCharacterCreation) {
    return <CharacterCreation />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">RPG Hybrid</h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">
                  {state.connected ? 'Connected' : 'Connecting...'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                Welcome, <span className="font-medium text-white">{state.user?.name}</span>
                <span className="ml-2 px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                  {state.user?.role}
                </span>
              </div>
              
              {needsCharacter && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCharacterCreation(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Character</span>
                </motion.button>
              )}
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <motion.button
                      key={tab.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.name}</span>
                    </motion.button>
                  );
                })}
              </nav>

              {/* Session Info */}
              {state.session && (
                <div className="mt-8 pt-6 border-t border-gray-700">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Session Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Players:</span>
                      <span className="text-white">{state.characters.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Combat:</span>
                      <span className={state.session.combat.active ? 'text-red-400' : 'text-gray-400'}>
                        {state.session.combat.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {state.session.combat.active && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Round:</span>
                        <span className="text-white">{state.session.combat.round}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20"
            >
              {activeTab === 'character' && (
                <div>
                  {needsCharacter ? (
                    <div className="text-center py-12">
                      <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Character Created</h3>
                      <p className="text-gray-400 mb-6">Create a character to start your adventure</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCharacterCreation(true)}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Create Character
                      </motion.button>
                    </div>
                  ) : userCharacter ? (
                    <CharacterSheet character={userCharacter} />
                  ) : state.user?.role === 'master' ? (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-white">All Characters</h2>
                      {state.characters.length === 0 ? (
                        <div className="text-center py-12">
                          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400">No characters in the session yet</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                          {state.characters.map((character) => (
                            <div key={character.id} className="bg-gray-800 rounded-lg p-4">
                              <CharacterSheet character={character} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}

              {activeTab === 'dice' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Dice Roller</h2>
                  <DiceRoller character={userCharacter} />
                </div>
              )}

              {activeTab === 'combat' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Combat Management</h2>
                  <CombatTracker />
                </div>
              )}

              {activeTab === 'vows' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Binding Vows</h2>
                  <BindingVowManager />
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
                  <div className="space-y-6">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-4">Game Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Auto-save</span>
                          <input type="checkbox" defaultChecked className="w-4 h-4" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Sound effects</span>
                          <input type="checkbox" defaultChecked className="w-4 h-4" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Animations</span>
                          <input type="checkbox" defaultChecked className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-4">Session Info</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Session ID:</span>
                          <span className="text-white font-mono">{state.session?.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Connected Players:</span>
                          <span className="text-white">{state.characters.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Server Status:</span>
                          <span className="text-green-400">Online</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}