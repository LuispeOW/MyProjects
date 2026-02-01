// Network protocol - message types and serialization

import { ClientMessage, ServerMessage, GameState, Player } from '../game/types';

// Message framing - each message is prefixed with 4-byte length
export const HEADER_SIZE = 4;

// Serialize a message to send over the network
export const serializeMessage = <T extends ClientMessage | ServerMessage>(message: T): string => {
  return JSON.stringify(message);
};

// Deserialize a received message
export const deserializeMessage = <T extends ClientMessage | ServerMessage>(data: string): T | null => {
  try {
    return JSON.parse(data) as T;
  } catch {
    console.error('Failed to deserialize message:', data);
    return null;
  }
};

// Frame a message with length prefix for TCP streaming
export const frameMessage = (message: string): Buffer => {
  const messageBuffer = Buffer.from(message, 'utf-8');
  const lengthBuffer = Buffer.alloc(HEADER_SIZE);
  lengthBuffer.writeUInt32BE(messageBuffer.length, 0);
  return Buffer.concat([lengthBuffer, messageBuffer]);
};

// Message buffer for handling TCP stream reassembly
export class MessageBuffer {
  private buffer: Buffer = Buffer.alloc(0);

  // Add data to buffer and extract complete messages
  addData(data: Buffer): string[] {
    this.buffer = Buffer.concat([this.buffer, data]);
    const messages: string[] = [];

    while (this.buffer.length >= HEADER_SIZE) {
      const messageLength = this.buffer.readUInt32BE(0);

      if (this.buffer.length < HEADER_SIZE + messageLength) {
        break;  // Wait for more data
      }

      const messageData = this.buffer.slice(HEADER_SIZE, HEADER_SIZE + messageLength);
      messages.push(messageData.toString('utf-8'));
      this.buffer = this.buffer.slice(HEADER_SIZE + messageLength);
    }

    return messages;
  }

  clear(): void {
    this.buffer = Buffer.alloc(0);
  }
}

// Create sanitized game state for sending to a specific player
// (Hides other players' cards except what they've seen)
export const createPlayerView = (state: GameState, playerId: string): GameState => {
  // Deep clone the state
  const view = JSON.parse(JSON.stringify(state)) as GameState;

  // Find this player's index
  const playerIndex = view.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return view;

  // Sanitize other players' hands
  view.players = view.players.map((player, idx) => {
    if (idx === playerIndex) {
      // This is the viewing player - they see their own cards
      return player;
    }

    // For other players, hide cards except those revealed to this player
    return {
      ...player,
      hand: player.hand.map(slot => ({
        ...slot,
        card: slot.revealedTo.includes(playerId) ? slot.card : null,
      })),
      penaltyCards: [],  // Don't reveal penalty cards
    };
  });

  // Hide draw pile cards
  view.drawPile = view.drawPile.map(() => ({
    id: 'hidden',
    suit: null,
    rank: 'joker' as const,  // Placeholder
  }));

  // Only show drawn card if it belongs to this player
  if (view.drawnCard && view.currentPlayerIndex !== playerIndex) {
    view.drawnCard = null;
  }

  return view;
};

// Validate client message structure
export const validateClientMessage = (message: unknown): message is ClientMessage => {
  if (!message || typeof message !== 'object') return false;
  const msg = message as Record<string, unknown>;
  if (typeof msg.type !== 'string') return false;

  // Validate specific message types
  switch (msg.type) {
    case 'join':
      return typeof msg.playerName === 'string' && msg.playerName.length > 0;
    case 'start-game':
    case 'draw-from-pile':
    case 'take-from-discard':
    case 'call-cambio':
    case 'peek-complete':
      return true;
    case 'discard':
      return typeof msg.usePower === 'boolean';
    case 'swap':
      return typeof msg.cardIndex === 'number';
    case 'peek-select':
      return (
        typeof msg.targetPlayerId === 'string' &&
        typeof msg.cardIndex === 'number'
      );
    case 'blind-swap-select':
      return (
        typeof msg.myIndex === 'number' &&
        typeof msg.targetPlayerId === 'string' &&
        typeof msg.targetIndex === 'number'
      );
    case 'burn-attempt':
      return (
        typeof msg.targetPlayerId === 'string' &&
        typeof msg.cardIndex === 'number'
      );
    default:
      return false;
  }
};

// Server response helpers
export const createErrorMessage = (message: string): ServerMessage => ({
  type: 'error',
  message,
});

export const createGameStateMessage = (state: GameState): ServerMessage => ({
  type: 'game-state',
  state,
});

export const createPlayerJoinedMessage = (player: Player): ServerMessage => ({
  type: 'player-joined',
  player,
});

export const createPlayerLeftMessage = (playerId: string): ServerMessage => ({
  type: 'player-left',
  playerId,
});
