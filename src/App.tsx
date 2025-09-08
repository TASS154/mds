import React from 'react';
import { Toaster } from 'react-hot-toast';
import { GameProvider, useGame } from './context/GameContext';
import Login from './components/Login';
import GameDashboard from './components/GameDashboard';

function AppContent() {
  const { state } = useGame();

  if (!state.user) {
    return <Login />;
  }

  return <GameDashboard />;
}

function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gray-900">
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f3f4f6',
              border: '1px solid #374151',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#f3f4f6',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f3f4f6',
              },
            },
          }}
        />
      </div>
    </GameProvider>
  );
}

export default App;