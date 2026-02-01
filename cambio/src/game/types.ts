// Core type definitions for Cambio

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'joker';

export interface Card {
  id: string;
  suit: Suit | null;  // null for jokers
  rank: Rank;
}

// Card slot in a player's hand (can be empty after burning)
export interface CardSlot {
  card: Card | null;
  isRevealed: boolean;  // For peek effects
  revealedTo: string[]; // Player IDs who have seen this card
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isConnected: boolean;
  hand: CardSlot[];      // 4 main card positions
  penaltyCards: Card[];  // Extra cards from failed burns
  roundScore: number;    // Score for current round
  totalScore: number;    // Cumulative score
}

export type GamePhase =
  | 'lobby'           // Waiting for players
  | 'starting'        // Determining first player
  | 'peek'            // Initial 3-second peek
  | 'playing'         // Normal gameplay
  | 'round-end'       // Showing scores
  | 'game-end';       // Final results

export type TurnPhase =
  | 'waiting'         // Not this player's turn
  | 'draw'            // Must draw a card
  | 'decide'          // Chose what to do with drawn card
  | 'swap-select'     // Selecting card to swap
  | 'power-peek-self' // Using 7/8 power
  | 'power-peek-other'// Using 9/10 power
  | 'power-blind-swap'// Using J/Q power
  | 'power-look-swap' // Using Black King power
  | 'burning';        // Attempting a burn

export interface DrawnCard {
  card: Card;
  source: 'draw-pile' | 'discard-pile';
}

export interface BurnAttempt {
  burningPlayerId: string;
  targetPlayerId: string;
  targetCardIndex: number;
  timestamp: number;
}

export interface GameSettings {
  totalRounds: 5 | 10 | 15;
  playerCount: number;
}

export interface GameState {
  // Game setup
  roomCode: string;
  settings: GameSettings;
  players: Player[];
  hostId: string;

  // Game progress
  phase: GamePhase;
  roundNumber: number;

  // Turn management
  currentPlayerIndex: number;
  turnPhase: TurnPhase;
  turnStartTime: number;

  // Card state
  drawPile: Card[];
  discardPile: Card[];
  drawnCard: DrawnCard | null;

  // Special states
  peekingCardIndex: number | null;     // Card being peeked
  peekingPlayerId: string | null;      // Who's peeking
  swapSourceIndex: number | null;      // For blind swap
  swapSourcePlayerId: string | null;

  // Burning
  pendingBurns: BurnAttempt[];
  lastBurnResult: {
    success: boolean;
    playerId: string;
    message: string;
  } | null;

  // Round ending
  cambioCallerId: string | null;
  finalTurnsRemaining: number;
}

// Network message types
export type ClientMessage =
  | { type: 'join'; playerName: string }
  | { type: 'start-game' }
  | { type: 'draw-from-pile' }
  | { type: 'take-from-discard' }
  | { type: 'discard'; usePower: boolean }
  | { type: 'swap'; cardIndex: number }
  | { type: 'peek-select'; targetPlayerId: string; cardIndex: number }
  | { type: 'blind-swap-select'; myIndex: number; targetPlayerId: string; targetIndex: number }
  | { type: 'burn-attempt'; targetPlayerId: string; cardIndex: number }
  | { type: 'call-cambio' }
  | { type: 'peek-complete' };

export type ServerMessage =
  | { type: 'game-state'; state: GameState }
  | { type: 'player-joined'; player: Player }
  | { type: 'player-left'; playerId: string }
  | { type: 'error'; message: string }
  | { type: 'card-revealed'; playerId: string; cardIndex: number; card: Card }
  | { type: 'burn-race'; burns: BurnAttempt[] }
  | { type: 'burn-result'; success: boolean; burnerId: string; targetId: string; cardIndex: number };

// View of game state from a specific player's perspective
export interface PlayerGameView {
  myId: string;
  myHand: CardSlot[];
  myPenaltyCards: Card[];
  opponents: {
    id: string;
    name: string;
    cardCount: number;        // How many cards they have
    penaltyCount: number;     // Penalty cards
    knownCards: { index: number; card: Card }[];  // Cards I've seen
  }[];
  drawPileCount: number;
  topDiscard: Card | null;
  currentPlayerId: string;
  isMyTurn: boolean;
  turnPhase: TurnPhase;
  drawnCard: Card | null;     // Only if I drew it
  phase: GamePhase;
  roundNumber: number;
  totalRounds: number;
  cambioCallerId: string | null;
  scores: { id: string; name: string; roundScore: number; totalScore: number }[];
}
