import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sword, Shield, Eye, Lock } from 'lucide-react';
import { useGame } from '../context/GameContext';

const MASTER_PASSWORD = "1234"; // Simple password for master access

export default function Login() {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'player' | 'master'>('player');
  const [password, setPassword] = useState('');
  const { login, state } = useGame();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    // Check master password if role is master
    if (role === 'master' && password !== MASTER_PASSWORD) {
      alert('Senha incorreta para acesso de Mestre!');
      return;
    }
    
    await login(name, role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md border border-purple-500/20"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Sword className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">RPG Hybrid</h1>
          <p className="text-gray-400">Enter the realm of adventure</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Digite seu nome"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Função
            </label>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRole('player')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  role === 'player'
                    ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                <Shield className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Jogador</span>
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRole('master')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  role === 'master'
                    ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                <Eye className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Mestre</span>
              </motion.button>
            </div>
          </div>

          {role === 'master' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Lock className="w-4 h-4 inline mr-1" />
                Senha do Mestre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Digite a senha do mestre"
                required
              />
            </div>
          )}

          <motion.button
            type="submit"
            disabled={state.loading || !name.trim() || (role === 'master' && !password.trim())}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {state.loading ? 'Entrando...' : 'Entrar no Jogo'}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <div className="text-xs text-gray-500 space-y-1">
            {role === 'player' ? (
              <p>Como jogador, apenas digite seu nome para entrar</p>
            ) : (
              <p>Como mestre, você precisa da senha especial</p>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm">
              {state.connected ? 'Conectado ao servidor' : 'Conectando...'}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>

          <motion.button
            type="submit"
            disabled={state.loading || !email.trim() || !name.trim() || !password.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {state.loading ? 'Entering...' : 'Enter Game'}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm">
              {state.connected ? 'Connected to server' : 'Connecting...'}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}