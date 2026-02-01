// Game state management - reducer pattern

import {
  GameState,
  GamePhase,
  TurnPhase,
  Player,
  Card,
  CardSlot,
  ClientMessage,
  GameSettings,
  BurnAttempt,
} from './types';
import {
  createGameDeck,
  dealHands,
  setupDiscardPile,
  cardsMatch,
  countPlayerCards,
  reshuffleDiscardIntoDraw,
} from './deck';
import { getCardValue, getPowerType, BURN_RACE_WINDOW_MS } from './constants';
import { generateRoomCode } from '../networking/roomCode';

// Generate unique player ID
const generatePlayerId = (): string => {
  return `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Create initial game state
export const createInitialState = (hostName: string): GameState => {
  const hostId = generatePlayerId();
  const roomCode = generateRoomCode();

  return {
    roomCode,
    settings: { totalRounds: 10, playerCount: 2 },
    players: [
      {
        id: hostId,
        name: hostName,
        isHost: true,
        isConnected: true,
        hand: [],
        penaltyCards: [],
        roundScore: 0,
        totalScore: 0,
      },
    ],
    hostId,
    phase: 'lobby',
    roundNumber: 0,
    currentPlayerIndex: 0,
    turnPhase: 'waiting',
    turnStartTime: 0,
    drawPile: [],
    discardPile: [],
    drawnCard: null,
    peekingCardIndex: null,
    peekingPlayerId: null,
    swapSourceIndex: null,
    swapSourcePlayerId: null,
    pendingBurns: [],
    lastBurnResult: null,
    cambioCallerId: null,
    finalTurnsRemaining: -1,
  };
};

// Add a player to the game
export const addPlayer = (state: GameState, playerName: string): { state: GameState; playerId: string } => {
  if (state.phase !== 'lobby') {
    return { state, playerId: '' };
  }

  if (state.players.length >= 8) {
    return { state, playerId: '' };
  }

  const playerId = generatePlayerId();
  const newPlayer: Player = {
    id: playerId,
    name: playerName,
    isHost: false,
    isConnected: true,
    hand: [],
    penaltyCards: [],
    roundScore: 0,
    totalScore: 0,
  };

  return {
    state: {
      ...state,
      players: [...state.players, newPlayer],
      settings: { ...state.settings, playerCount: state.players.length + 1 },
    },
    playerId,
  };
};

// Remove a player
export const removePlayer = (state: GameState, playerId: string): GameState => {
  // If in lobby, remove completely
  if (state.phase === 'lobby') {
    const newPlayers = state.players.filter(p => p.id !== playerId);

    // If host left, make next player host
    if (newPlayers.length > 0 && !newPlayers.some(p => p.isHost)) {
      newPlayers[0].isHost = true;
    }

    return {
      ...state,
      players: newPlayers,
      hostId: newPlayers[0]?.id || '',
    };
  }

  // During game, mark as disconnected
  return {
    ...state,
    players: state.players.map(p =>
      p.id === playerId ? { ...p, isConnected: false } : p
    ),
  };
};

// Start a new round
export const startRound = (state: GameState): GameState => {
  const playerCount = state.players.length;

  if (playerCount < 2) {
    return state;
  }

  // Create and shuffle deck
  const deck = createGameDeck(playerCount);

  // Deal hands
  const { hands, remainingDeck } = dealHands(deck, playerCount);

  // Setup discard pile
  const { discardPile, remainingDeck: drawPile } = setupDiscardPile(remainingDeck);

  // Assign hands to players
  const players = state.players.map((player, idx) => ({
    ...player,
    hand: hands[idx],
    penaltyCards: [],
    roundScore: 0,
  }));

  // Determine first player
  // Round 1: Draw cards to determine (simplified: random for now)
  // Other rounds: Previous winner goes first
  let firstPlayerIndex = 0;
  if (state.roundNumber === 0) {
    firstPlayerIndex = Math.floor(Math.random() * playerCount);
  } else {
    // Find player with lowest score from last round
    const lowestScore = Math.min(...state.players.map(p => p.roundScore));
    firstPlayerIndex = state.players.findIndex(p => p.roundScore === lowestScore);
  }

  return {
    ...state,
    phase: 'peek',
    roundNumber: state.roundNumber + 1,
    players,
    drawPile,
    discardPile,
    currentPlayerIndex: firstPlayerIndex,
    turnPhase: 'waiting',
    turnStartTime: Date.now(),
    drawnCard: null,
    cambioCallerId: null,
    finalTurnsRemaining: -1,
  };
};

// End peek phase, start playing
export const endPeekPhase = (state: GameState): GameState => {
  // Mark the two closest cards as "revealed to self"
  const players = state.players.map(player => ({
    ...player,
    hand: player.hand.map((slot, idx) => ({
      ...slot,
      // Cards at index 2 and 3 are "closest" (bottom row)
      revealedTo: idx >= 2 ? [player.id] : slot.revealedTo,
    })),
  }));

  return {
    ...state,
    phase: 'playing',
    players,
    turnPhase: 'draw',
    turnStartTime: Date.now(),
  };
};

// Draw from draw pile
export const drawFromPile = (state: GameState, playerId: string): GameState => {
  const playerIndex = state.players.findIndex(p => p.id === playerId);

  if (playerIndex !== state.currentPlayerIndex) {
    return state;  // Not their turn
  }

  if (state.turnPhase !== 'draw') {
    return state;  // Wrong phase
  }

  if (state.drawPile.length === 0) {
    // Reshuffle discard into draw
    const { newDrawPile, newDiscardPile } = reshuffleDiscardIntoDraw(
      state.drawPile,
      state.discardPile
    );
    state = { ...state, drawPile: newDrawPile, discardPile: newDiscardPile };
  }

  const drawnCard = state.drawPile[0];
  const newDrawPile = state.drawPile.slice(1);

  return {
    ...state,
    drawPile: newDrawPile,
    drawnCard: { card: drawnCard, source: 'draw-pile' },
    turnPhase: 'decide',
  };
};

// Take from discard pile
export const takeFromDiscard = (state: GameState, playerId: string): GameState => {
  const playerIndex = state.players.findIndex(p => p.id === playerId);

  if (playerIndex !== state.currentPlayerIndex) {
    return state;
  }

  if (state.turnPhase !== 'draw') {
    return state;
  }

  if (state.discardPile.length === 0) {
    return state;
  }

  const takenCard = state.discardPile[state.discardPile.length - 1];
  const newDiscardPile = state.discardPile.slice(0, -1);

  return {
    ...state,
    discardPile: newDiscardPile,
    drawnCard: { card: takenCard, source: 'discard-pile' },
    turnPhase: 'swap-select',  // Must swap when taking from discard
  };
};

// Discard drawn card (optionally use power)
export const discardDrawnCard = (state: GameState, playerId: string, usePower: boolean): GameState => {
  const playerIndex = state.players.findIndex(p => p.id === playerId);

  if (playerIndex !== state.currentPlayerIndex) {
    return state;
  }

  if (!state.drawnCard || state.drawnCard.source !== 'draw-pile') {
    return state;
  }

  if (state.turnPhase !== 'decide') {
    return state;
  }

  const card = state.drawnCard.card;
  const newDiscardPile = [...state.discardPile, card];

  if (usePower) {
    const powerType = getPowerType(card);
    if (powerType) {
      return {
        ...state,
        discardPile: newDiscardPile,
        drawnCard: null,
        turnPhase: powerType === 'peek-self' ? 'power-peek-self' :
                   powerType === 'peek-other' ? 'power-peek-other' :
                   powerType === 'blind-swap' ? 'power-blind-swap' : 'power-look-swap',
      };
    }
  }

  // No power or chose not to use - end turn
  return advanceToNextTurn({
    ...state,
    discardPile: newDiscardPile,
    drawnCard: null,
  });
};

// Swap drawn card with hand card
export const swapCard = (state: GameState, playerId: string, cardIndex: number): GameState => {
  const playerIndex = state.players.findIndex(p => p.id === playerId);

  if (playerIndex !== state.currentPlayerIndex) {
    return state;
  }

  if (!state.drawnCard) {
    return state;
  }

  if (state.turnPhase !== 'decide' && state.turnPhase !== 'swap-select') {
    return state;
  }

  const player = state.players[playerIndex];
  let oldCard: Card | null = null;

  // Handle main hand vs penalty cards
  const newPlayers = [...state.players];
  if (cardIndex < 4) {
    oldCard = player.hand[cardIndex]?.card || null;
    newPlayers[playerIndex] = {
      ...player,
      hand: player.hand.map((slot, idx) =>
        idx === cardIndex
          ? { card: state.drawnCard!.card, isRevealed: false, revealedTo: [] }
          : slot
      ),
    };
  } else {
    const penaltyIndex = cardIndex - 4;
    oldCard = player.penaltyCards[penaltyIndex] || null;
    newPlayers[playerIndex] = {
      ...player,
      penaltyCards: player.penaltyCards.map((c, idx) =>
        idx === penaltyIndex ? state.drawnCard!.card : c
      ),
    };
  }

  // Old card goes to discard
  const newDiscardPile = oldCard ? [...state.discardPile, oldCard] : state.discardPile;

  return advanceToNextTurn({
    ...state,
    players: newPlayers,
    discardPile: newDiscardPile,
    drawnCard: null,
  });
};

// Handle peek selection
export const handlePeekSelect = (
  state: GameState,
  playerId: string,
  targetPlayerId: string,
  cardIndex: number
): GameState => {
  const playerIndex = state.players.findIndex(p => p.id === playerId);

  if (playerIndex !== state.currentPlayerIndex) {
    return state;
  }

  const targetIndex = state.players.findIndex(p => p.id === targetPlayerId);
  if (targetIndex === -1) {
    return state;
  }

  // Validate peek type
  if (state.turnPhase === 'power-peek-self' && targetPlayerId !== playerId) {
    return state;  // Can only peek own cards
  }

  if (state.turnPhase === 'power-peek-other' && targetPlayerId === playerId) {
    return state;  // Must peek opponent's card
  }

  // Mark card as revealed to peeking player
  const newPlayers = [...state.players];
  const targetPlayer = newPlayers[targetIndex];

  if (cardIndex < 4 && targetPlayer.hand[cardIndex]) {
    targetPlayer.hand = targetPlayer.hand.map((slot, idx) =>
      idx === cardIndex
        ? {
            ...slot,
            isRevealed: true,
            revealedTo: [...new Set([...slot.revealedTo, playerId])],
          }
        : slot
    );
  }

  return {
    ...state,
    players: newPlayers,
    peekingCardIndex: cardIndex,
    peekingPlayerId: targetPlayerId,
    // Will advance turn after peek duration
  };
};

// Complete peek and advance turn
export const completePeek = (state: GameState): GameState => {
  // Clear peek state
  const newPlayers = state.players.map(player => ({
    ...player,
    hand: player.hand.map(slot => ({
      ...slot,
      isRevealed: false,
    })),
  }));

  return advanceToNextTurn({
    ...state,
    players: newPlayers,
    peekingCardIndex: null,
    peekingPlayerId: null,
  });
};

// Handle blind swap
export const handleBlindSwap = (
  state: GameState,
  playerId: string,
  myIndex: number,
  targetPlayerId: string,
  targetIndex: number
): GameState => {
  const playerIndex = state.players.findIndex(p => p.id === playerId);

  if (playerIndex !== state.currentPlayerIndex) {
    return state;
  }

  if (state.turnPhase !== 'power-blind-swap' && state.turnPhase !== 'power-look-swap') {
    return state;
  }

  const targetPlayerIndex = state.players.findIndex(p => p.id === targetPlayerId);
  if (targetPlayerIndex === -1 || targetPlayerIndex === playerIndex) {
    return state;
  }

  // Swap the cards
  const newPlayers = [...state.players];
  const myPlayer = { ...newPlayers[playerIndex] };
  const targetPlayer = { ...newPlayers[targetPlayerIndex] };

  const myCard = myPlayer.hand[myIndex]?.card;
  const theirCard = targetPlayer.hand[targetIndex]?.card;

  if (myCard && theirCard) {
    myPlayer.hand = myPlayer.hand.map((slot, idx) =>
      idx === myIndex
        ? { card: theirCard, isRevealed: false, revealedTo: [] }
        : slot
    );
    targetPlayer.hand = targetPlayer.hand.map((slot, idx) =>
      idx === targetIndex
        ? { card: myCard, isRevealed: false, revealedTo: [] }
        : slot
    );

    newPlayers[playerIndex] = myPlayer;
    newPlayers[targetPlayerIndex] = targetPlayer;
  }

  return advanceToNextTurn({
    ...state,
    players: newPlayers,
    peekingCardIndex: null,
    peekingPlayerId: null,
  });
};

// Handle burn attempt
export const handleBurnAttempt = (
  state: GameState,
  burnerId: string,
  targetPlayerId: string,
  targetCardIndex: number
): GameState => {
  if (state.phase !== 'playing') {
    return state;
  }

  if (state.discardPile.length === 0) {
    return state;
  }

  const burn: BurnAttempt = {
    burningPlayerId: burnerId,
    targetPlayerId,
    targetCardIndex,
    timestamp: Date.now(),
  };

  // Add to pending burns
  return {
    ...state,
    pendingBurns: [...state.pendingBurns, burn],
  };
};

// Resolve burn attempts (called after burn window)
export const resolveBurns = (state: GameState): GameState => {
  if (state.pendingBurns.length === 0) {
    return state;
  }

  // Sort by timestamp - fastest wins
  const sortedBurns = [...state.pendingBurns].sort((a, b) => a.timestamp - b.timestamp);
  const winningBurn = sortedBurns[0];

  const topDiscard = state.discardPile[state.discardPile.length - 1];
  if (!topDiscard) {
    return { ...state, pendingBurns: [] };
  }

  const targetPlayerIndex = state.players.findIndex(p => p.id === winningBurn.targetPlayerId);
  if (targetPlayerIndex === -1) {
    return { ...state, pendingBurns: [] };
  }

  const targetPlayer = state.players[targetPlayerIndex];
  const targetCard = targetPlayer.hand[winningBurn.targetCardIndex]?.card;

  if (!targetCard) {
    return { ...state, pendingBurns: [] };
  }

  const burnerIndex = state.players.findIndex(p => p.id === winningBurn.burningPlayerId);
  if (burnerIndex === -1) {
    return { ...state, pendingBurns: [] };
  }

  // Check if burn is successful
  const success = cardsMatch(topDiscard, targetCard);

  let newPlayers = [...state.players];
  let newDiscardPile = [...state.discardPile];
  let resultMessage = '';

  if (success) {
    // Remove burned card and add to discard
    newDiscardPile.push(targetCard);

    newPlayers[targetPlayerIndex] = {
      ...targetPlayer,
      hand: targetPlayer.hand.map((slot, idx) =>
        idx === winningBurn.targetCardIndex ? { card: null, isRevealed: false, revealedTo: [] } : slot
      ),
    };

    // If burning opponent's card, give them one of burner's cards (blind)
    if (winningBurn.burningPlayerId !== winningBurn.targetPlayerId) {
      const burner = newPlayers[burnerIndex];
      // Pick random card from burner's hand
      const burnerCards = burner.hand
        .map((slot, idx) => ({ slot, idx }))
        .filter(({ slot }) => slot.card !== null);

      if (burnerCards.length > 0) {
        const randomIdx = Math.floor(Math.random() * burnerCards.length);
        const cardToGive = burnerCards[randomIdx];

        // Give card to target (as penalty card)
        newPlayers[targetPlayerIndex] = {
          ...newPlayers[targetPlayerIndex],
          penaltyCards: [...newPlayers[targetPlayerIndex].penaltyCards, cardToGive.slot.card!],
        };

        // Remove from burner
        newPlayers[burnerIndex] = {
          ...burner,
          hand: burner.hand.map((slot, idx) =>
            idx === cardToGive.idx ? { card: null, isRevealed: false, revealedTo: [] } : slot
          ),
        };
      }

      resultMessage = `${newPlayers[burnerIndex].name} burned ${targetPlayer.name}'s card!`;
    } else {
      resultMessage = `${newPlayers[burnerIndex].name} burned their own card!`;
    }
  } else {
    // Failed burn - draw penalty card
    if (state.drawPile.length > 0) {
      const penaltyCard = state.drawPile[0];
      newPlayers[burnerIndex] = {
        ...newPlayers[burnerIndex],
        penaltyCards: [...newPlayers[burnerIndex].penaltyCards, penaltyCard],
      };

      return {
        ...state,
        players: newPlayers,
        drawPile: state.drawPile.slice(1),
        pendingBurns: [],
        lastBurnResult: {
          success: false,
          playerId: winningBurn.burningPlayerId,
          message: `${newPlayers[burnerIndex].name} failed the burn! +1 penalty card`,
        },
      };
    }
  }

  // Check for automatic Cambio (player reaches 0 cards)
  const zeroCardPlayer = newPlayers.find(p =>
    countPlayerCards(p) === 0 && p.id !== state.cambioCallerId
  );

  let newState: GameState = {
    ...state,
    players: newPlayers,
    discardPile: newDiscardPile,
    pendingBurns: [],
    lastBurnResult: {
      success,
      playerId: winningBurn.burningPlayerId,
      message: resultMessage,
    },
  };

  if (zeroCardPlayer && !state.cambioCallerId) {
    // Automatic Cambio will trigger on their turn
  }

  return newState;
};

// Call Cambio
export const callCambio = (state: GameState, playerId: string): GameState => {
  const playerIndex = state.players.findIndex(p => p.id === playerId);

  if (playerIndex !== state.currentPlayerIndex) {
    return state;  // Can only call on your turn
  }

  if (state.cambioCallerId) {
    return state;  // Already called
  }

  // Set up final turns
  return {
    ...state,
    cambioCallerId: playerId,
    finalTurnsRemaining: state.players.length,  // Everyone gets one more turn
  };
};

// Advance to next player's turn
const advanceToNextTurn = (state: GameState): GameState => {
  // Handle final turns after Cambio
  let finalTurnsRemaining = state.finalTurnsRemaining;
  if (finalTurnsRemaining > 0) {
    finalTurnsRemaining--;

    if (finalTurnsRemaining === 0) {
      // Round ends
      return calculateRoundScores(state);
    }
  }

  // Find next connected player
  let nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
  let attempts = 0;

  while (!state.players[nextIndex].isConnected && attempts < state.players.length) {
    nextIndex = (nextIndex + 1) % state.players.length;
    attempts++;
  }

  // Check if next player has 0 cards (automatic Cambio)
  const nextPlayer = state.players[nextIndex];
  if (countPlayerCards(nextPlayer) === 0 && !state.cambioCallerId) {
    return {
      ...state,
      currentPlayerIndex: nextIndex,
      turnPhase: 'draw',
      turnStartTime: Date.now(),
      cambioCallerId: nextPlayer.id,
      finalTurnsRemaining: state.players.length,
    };
  }

  return {
    ...state,
    currentPlayerIndex: nextIndex,
    turnPhase: 'draw',
    turnStartTime: Date.now(),
    finalTurnsRemaining,
  };
};

// Calculate round scores
const calculateRoundScores = (state: GameState): GameState => {
  const players = state.players.map(player => {
    let roundScore = 0;

    // Score hand cards
    for (const slot of player.hand) {
      if (slot.card) {
        roundScore += getCardValue(slot.card);
      }
    }

    // Score penalty cards
    for (const card of player.penaltyCards) {
      roundScore += getCardValue(card);
    }

    return {
      ...player,
      roundScore,
      totalScore: player.totalScore + roundScore,
      // Reveal all cards for scoring
      hand: player.hand.map(slot => ({
        ...slot,
        isRevealed: true,
      })),
    };
  });

  const isGameEnd = state.roundNumber >= state.settings.totalRounds;

  return {
    ...state,
    players,
    phase: isGameEnd ? 'game-end' : 'round-end',
  };
};

// Process a client message
export const processMessage = (
  state: GameState,
  playerId: string,
  message: ClientMessage
): GameState => {
  switch (message.type) {
    case 'start-game':
      if (playerId === state.hostId && state.phase === 'lobby') {
        return startRound(state);
      }
      return state;

    case 'draw-from-pile':
      return drawFromPile(state, playerId);

    case 'take-from-discard':
      return takeFromDiscard(state, playerId);

    case 'discard':
      return discardDrawnCard(state, playerId, message.usePower);

    case 'swap':
      return swapCard(state, playerId, message.cardIndex);

    case 'peek-select':
      return handlePeekSelect(state, playerId, message.targetPlayerId, message.cardIndex);

    case 'peek-complete':
      return completePeek(state);

    case 'blind-swap-select':
      return handleBlindSwap(
        state,
        playerId,
        message.myIndex,
        message.targetPlayerId,
        message.targetIndex
      );

    case 'burn-attempt':
      return handleBurnAttempt(state, playerId, message.targetPlayerId, message.cardIndex);

    case 'call-cambio':
      return callCambio(state, playerId);

    default:
      return state;
  }
};
