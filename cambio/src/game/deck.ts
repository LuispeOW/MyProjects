// Deck creation and manipulation

import { Card, Suit, Rank, CardSlot, Player } from './types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Fisher-Yates shuffle - cryptographically fair
export const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// Create a single 54-card deck (52 + 2 jokers)
export const createDeck = (deckNumber: number = 1): Card[] => {
  const cards: Card[] = [];

  // Standard 52 cards
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({
        id: `${suit}-${rank}-${deckNumber}`,
        suit,
        rank,
      });
    }
  }

  // 2 jokers per deck
  cards.push({
    id: `joker-1-${deckNumber}`,
    suit: null,
    rank: 'joker',
  });
  cards.push({
    id: `joker-2-${deckNumber}`,
    suit: null,
    rank: 'joker',
  });

  return cards;
};

// Create game deck (1 deck for 2-4 players, 2 decks for 5-8)
export const createGameDeck = (playerCount: number): Card[] => {
  if (playerCount <= 4) {
    return shuffle(createDeck(1));
  } else {
    return shuffle([...createDeck(1), ...createDeck(2)]);
  }
};

// Deal initial hands to players
export const dealHands = (
  deck: Card[],
  playerCount: number
): { hands: CardSlot[][]; remainingDeck: Card[] } => {
  const hands: CardSlot[][] = [];
  let currentDeck = [...deck];

  for (let p = 0; p < playerCount; p++) {
    const hand: CardSlot[] = [];
    for (let c = 0; c < 4; c++) {
      hand.push({
        card: currentDeck[0],
        isRevealed: false,
        revealedTo: [],
      });
      currentDeck = currentDeck.slice(1);
    }
    hands.push(hand);
  }

  return { hands, remainingDeck: currentDeck };
};

// Setup initial discard pile (first card face-up)
export const setupDiscardPile = (
  deck: Card[]
): { discardPile: Card[]; remainingDeck: Card[] } => {
  return {
    discardPile: [deck[0]],
    remainingDeck: deck.slice(1),
  };
};

// Check if two cards match (for burning)
export const cardsMatch = (card1: Card, card2: Card): boolean => {
  // Jokers match jokers, ranks match ranks
  return card1.rank === card2.rank;
};

// Get card at position in player's hand (including penalty cards)
export const getCardAtPosition = (
  player: Player,
  index: number
): Card | null => {
  if (index < 4) {
    return player.hand[index]?.card || null;
  } else {
    const penaltyIndex = index - 4;
    return player.penaltyCards[penaltyIndex] || null;
  }
};

// Count total cards a player has
export const countPlayerCards = (player: Player): number => {
  const handCards = player.hand.filter(slot => slot.card !== null).length;
  return handCards + player.penaltyCards.length;
};

// Draw a card from the pile
export const drawFromPile = (pile: Card[]): { card: Card; remainingPile: Card[] } | null => {
  if (pile.length === 0) return null;
  return {
    card: pile[0],
    remainingPile: pile.slice(1),
  };
};

// Reshuffle discard into draw pile (keeping top card)
export const reshuffleDiscardIntoDraw = (
  drawPile: Card[],
  discardPile: Card[]
): { newDrawPile: Card[]; newDiscardPile: Card[] } => {
  if (discardPile.length <= 1) {
    return { newDrawPile: drawPile, newDiscardPile: discardPile };
  }

  const topDiscard = discardPile[discardPile.length - 1];
  const cardsToShuffle = discardPile.slice(0, -1);

  return {
    newDrawPile: [...drawPile, ...shuffle(cardsToShuffle)],
    newDiscardPile: [topDiscard],
  };
};
