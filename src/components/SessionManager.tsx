import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Crown, Calendar } from 'lucide-react';
import { useGame } from '../context/GameContext';

export default function SessionManager() {
  const { state, createSession, joinSession } = useGame();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [sessionId, setSessionId] = useState('');

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionName.trim()) return;
    
    await createSession(sessionName);
    setShowCreateForm(false);
    setSessionName('');
  };

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId.trim()) return;
    
    await joinSession(sessionId);
    if (state.session) {
      setShowJoinForm(false);
      setSessionId('');
    }
  };

  if (state.session) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Crown className="w-6 h-6 text-yellow-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">{state.session.name}</h3>
            <p className="text-sm text-gray-400">Session ID: {state.session.id}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300">Players</span>
            </div>
            <span className="text-white font-medium">{state.characters.length}</span>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Calendar className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">Status</span>
            </div>
            <span className={`font-medium ${state.session.combat.active ? 'text-red-400' : 'text-green-400'}`}>
              {state.session.combat.active ? 'In Combat' : 'Active'}
            </span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-700 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Share this Session ID with other players:</p>
          <div className="flex items-center space-x-2">
            <code className="flex-1 px-2 py-1 bg-gray-800 rounded text-sm text-white font-mono">
              {state.session.id}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(state.session.id)}
              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Session Management</h3>
      
      {!showCreateForm && !showJoinForm && (
        <div className="space-y-3">
          {state.user?.role === 'master' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateForm(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Session</span>
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowJoinForm(true)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Users className="w-5 h-5" />
            <span>Join Session</span>
          </motion.button>
        </div>
      )}

      {showCreateForm && (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCreateSession}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Session Name
            </label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter session name"
              required
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Create
            </button>
          </div>
        </motion.form>
      )}

      {showJoinForm && (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleJoinSession}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Session ID
            </label>
            <input
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter session ID"
              required
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowJoinForm(false)}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Join
            </button>
          </div>
        </motion.form>
      )}
    </div>
  );
}