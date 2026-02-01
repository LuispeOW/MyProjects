// Main App - Navigation and state management

import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { NetworkProvider, useNetwork, useGameActions } from './networking/NetworkContext';
import { HomeScreen } from './screens/HomeScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { GameScreen } from './screens/GameScreen';
import { ScoreScreen } from './screens/ScoreScreen';
import { startRound } from './game/gameState';

// Main app content (uses network context)
const AppContent: React.FC = () => {
  const {
    connectionState,
    roomCode,
    myPlayerId,
    error,
    gameState,
    hostGame,
    startGame,
    updateSettings,
    joinGame,
    leaveGame,
    sendAction,
    addSimulatedPlayer,
  } = useNetwork();

  const gameActions = useGameActions();
  const [testPlayerCount, setTestPlayerCount] = useState(1);

  // Find if current user is host
  const isHost = gameState?.players.find(p => p.id === myPlayerId)?.isHost ?? false;

  // Handle adding simulated players for testing
  const handleAddSimulatedPlayer = () => {
    const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace'];
    addSimulatedPlayer(names[testPlayerCount % names.length]);
    setTestPlayerCount(c => c + 1);
  };

  // Handle next round
  const handleNextRound = () => {
    sendAction({ type: 'start-game' });
  };

  // Handle new game (back to lobby)
  const handleNewGame = () => {
    leaveGame();
  };

  // Disconnected - show home screen
  if (connectionState === 'disconnected') {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        <HomeScreen
          onHost={hostGame}
          onJoin={joinGame}
        />
      </>
    );
  }

  // Connecting - show loading (could add a proper loading screen)
  if (connectionState === 'connecting') {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        <HomeScreen
          onHost={hostGame}
          onJoin={joinGame}
        />
      </>
    );
  }

  // In lobby
  if (gameState?.phase === 'lobby') {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        <LobbyScreen
          roomCode={roomCode || ''}
          players={gameState.players}
          isHost={isHost}
          settings={gameState.settings}
          onUpdateSettings={updateSettings}
          onStartGame={startGame}
          onLeave={leaveGame}
          onAddSimulatedPlayer={handleAddSimulatedPlayer}
        />
      </>
    );
  }

  // Score screens
  if (gameState?.phase === 'round-end' || gameState?.phase === 'game-end') {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        <ScoreScreen
          players={gameState.players}
          roundNumber={gameState.roundNumber}
          totalRounds={gameState.settings.totalRounds}
          phase={gameState.phase}
          onNextRound={handleNextRound}
          onNewGame={handleNewGame}
        />
      </>
    );
  }

  // In game
  if (gameState && myPlayerId) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#166534" />
        <GameScreen
          gameState={gameState}
          myPlayerId={myPlayerId}
          onDrawFromPile={gameActions.drawFromPile}
          onTakeFromDiscard={gameActions.takeFromDiscard}
          onDiscard={gameActions.discardCard}
          onSwap={gameActions.swapCard}
          onPeek={gameActions.peekCard}
          onCompletePeek={gameActions.completePeek}
          onBlindSwap={gameActions.blindSwap}
          onBurn={gameActions.burnCard}
          onCallCambio={gameActions.callCambio}
        />
      </>
    );
  }

  // Fallback
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <HomeScreen
        onHost={hostGame}
        onJoin={joinGame}
      />
    </>
  );
};

// Root component with providers
const App: React.FC = () => {
  return (
    <NetworkProvider>
      <AppContent />
    </NetworkProvider>
  );
};

export default App;
