// Network Context - Abstracts networking for both Expo Go and Development Builds

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { GameState, ClientMessage, ServerMessage, Player } from '../game/types';
import {
  createInitialState,
  addPlayer,
  removePlayer,
  processMessage,
  endPeekPhase,
  resolveBurns,
} from '../game/gameState';
import { createPlayerView } from './protocol';
import { generateRoomCode } from './roomCode';
import { PEEK_DURATION_MS, BURN_RACE_WINDOW_MS } from '../game/constants';

// Connection state
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'hosting';

interface NetworkContextType {
  // Connection state
  connectionState: ConnectionState;
  roomCode: string | null;
  myPlayerId: string | null;
  error: string | null;

  // Game state (filtered for current player)
  gameState: GameState | null;

  // Host actions
  hostGame: (playerName: string) => void;
  startGame: () => void;
  updateSettings: (totalRounds: 5 | 10 | 15) => void;

  // Client actions
  joinGame: (roomCode: string, playerName: string) => void;
  leaveGame: () => void;

  // Game actions (sent as messages)
  sendAction: (message: ClientMessage) => void;

  // For testing - add simulated player
  addSimulatedPlayer: (name: string) => void;
}

const NetworkContext = createContext<NetworkContextType | null>(null);

// Detect if we're in Expo Go (no TCP available) or development build
const IS_EXPO_GO = !global.TcpSocket;  // TcpSocket won't exist in Expo Go

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Server-side state (only used when hosting)
  const serverStateRef = useRef<GameState | null>(null);

  // Timers
  const peekTimerRef = useRef<NodeJS.Timeout | null>(null);
  const burnTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update game state and broadcast to clients (simulated in Expo Go)
  const broadcastState = useCallback((state: GameState) => {
    serverStateRef.current = state;

    // In Expo Go, just update local state with player's view
    if (IS_EXPO_GO && myPlayerId) {
      const playerView = createPlayerView(state, myPlayerId);
      setGameState(playerView);
    }
    // In development build, would broadcast via TCP here
  }, [myPlayerId]);

  // Handle timers for peek phase and burn resolution
  useEffect(() => {
    const state = serverStateRef.current;
    if (!state) return;

    // Peek phase timer
    if (state.phase === 'peek' && !peekTimerRef.current) {
      peekTimerRef.current = setTimeout(() => {
        const newState = endPeekPhase(serverStateRef.current!);
        broadcastState(newState);
        peekTimerRef.current = null;
      }, PEEK_DURATION_MS);
    }

    // Burn resolution timer
    if (state.pendingBurns.length > 0 && !burnTimerRef.current) {
      burnTimerRef.current = setTimeout(() => {
        const newState = resolveBurns(serverStateRef.current!);
        broadcastState(newState);
        burnTimerRef.current = null;
      }, BURN_RACE_WINDOW_MS);
    }

    return () => {
      if (peekTimerRef.current) {
        clearTimeout(peekTimerRef.current);
        peekTimerRef.current = null;
      }
    };
  }, [gameState, broadcastState]);

  // Host a new game
  const hostGame = useCallback((playerName: string) => {
    setError(null);

    const initialState = createInitialState(playerName);
    const hostId = initialState.players[0].id;

    serverStateRef.current = initialState;
    setMyPlayerId(hostId);
    setRoomCode(initialState.roomCode);
    setConnectionState('hosting');
    setGameState(createPlayerView(initialState, hostId));

    console.log(`Hosting game with code: ${initialState.roomCode}`);
  }, []);

  // Join an existing game
  const joinGame = useCallback((code: string, playerName: string) => {
    setError(null);
    setConnectionState('connecting');

    if (IS_EXPO_GO) {
      // In Expo Go, simulate joining by adding to local state
      // This is for testing - in real app, would connect via TCP

      // Check if we're "joining" our own hosted game (for testing)
      if (serverStateRef.current && serverStateRef.current.roomCode === code.toUpperCase()) {
        const result = addPlayer(serverStateRef.current, playerName);

        if (result.playerId) {
          setMyPlayerId(result.playerId);
          setRoomCode(code.toUpperCase());
          setConnectionState('connected');
          broadcastState(result.state);
        } else {
          setError('Failed to join game');
          setConnectionState('disconnected');
        }
      } else {
        setError('Game not found. In Expo Go, you can only test with simulated players.');
        setConnectionState('disconnected');
      }
    } else {
      // Development build - connect via TCP
      // TODO: Implement TCP client connection
      setError('TCP networking requires development build. See NETWORKING_GUIDE.md');
      setConnectionState('disconnected');
    }
  }, [broadcastState]);

  // Leave the game
  const leaveGame = useCallback(() => {
    if (peekTimerRef.current) {
      clearTimeout(peekTimerRef.current);
      peekTimerRef.current = null;
    }
    if (burnTimerRef.current) {
      clearTimeout(burnTimerRef.current);
      burnTimerRef.current = null;
    }

    setConnectionState('disconnected');
    setRoomCode(null);
    setMyPlayerId(null);
    setGameState(null);
    serverStateRef.current = null;
  }, []);

  // Start the game (host only)
  const startGame = useCallback(() => {
    if (connectionState !== 'hosting' || !serverStateRef.current) {
      return;
    }

    sendAction({ type: 'start-game' });
  }, [connectionState]);

  // Update game settings (host only)
  const updateSettings = useCallback((totalRounds: 5 | 10 | 15) => {
    if (connectionState !== 'hosting' || !serverStateRef.current) {
      return;
    }

    serverStateRef.current = {
      ...serverStateRef.current,
      settings: { ...serverStateRef.current.settings, totalRounds },
    };
    broadcastState(serverStateRef.current);
  }, [connectionState, broadcastState]);

  // Send a game action
  const sendAction = useCallback((message: ClientMessage) => {
    if (!myPlayerId) return;

    if (IS_EXPO_GO && serverStateRef.current) {
      // Process locally
      const newState = processMessage(serverStateRef.current, myPlayerId, message);
      broadcastState(newState);
    } else {
      // Send via TCP
      // TODO: Implement TCP message sending
    }
  }, [myPlayerId, broadcastState]);

  // Add a simulated player (for testing in Expo Go)
  const addSimulatedPlayer = useCallback((name: string) => {
    if (!serverStateRef.current || connectionState !== 'hosting') {
      return;
    }

    const result = addPlayer(serverStateRef.current, name);
    if (result.playerId) {
      broadcastState(result.state);
    }
  }, [connectionState, broadcastState]);

  return (
    <NetworkContext.Provider
      value={{
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
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return context;
};

// Hook for game actions (convenience wrapper)
export const useGameActions = () => {
  const { sendAction, gameState, myPlayerId } = useNetwork();

  const isMyTurn = gameState?.players[gameState.currentPlayerIndex]?.id === myPlayerId;

  return {
    isMyTurn,
    drawFromPile: () => sendAction({ type: 'draw-from-pile' }),
    takeFromDiscard: () => sendAction({ type: 'take-from-discard' }),
    discardCard: (usePower: boolean) => sendAction({ type: 'discard', usePower }),
    swapCard: (cardIndex: number) => sendAction({ type: 'swap', cardIndex }),
    peekCard: (targetPlayerId: string, cardIndex: number) =>
      sendAction({ type: 'peek-select', targetPlayerId, cardIndex }),
    completePeek: () => sendAction({ type: 'peek-complete' }),
    blindSwap: (myIndex: number, targetPlayerId: string, targetIndex: number) =>
      sendAction({ type: 'blind-swap-select', myIndex, targetPlayerId, targetIndex }),
    burnCard: (targetPlayerId: string, cardIndex: number) =>
      sendAction({ type: 'burn-attempt', targetPlayerId, cardIndex }),
    callCambio: () => sendAction({ type: 'call-cambio' }),
  };
};
