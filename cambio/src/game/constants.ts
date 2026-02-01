// Game constants and card value calculations

import { Card, Rank } from './types';

// Card point values
export const CARD_VALUES: Record<Rank, number> = {
  'joker': 0,
  'A': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13,  // Will be adjusted for red kings
};

// Get card point value (handles red king = -1)
export const getCardValue = (card: Card): number => {
  if (card.rank === 'K') {
    // Red kings are -1, black kings are 13
    return (card.suit === 'hearts' || card.suit === 'diamonds') ? -1 : 13;
  }
  return CARD_VALUES[card.rank];
};

// Special power cards
export const PEEK_SELF_RANKS: Rank[] = ['7', '8'];
export const PEEK_OTHER_RANKS: Rank[] = ['9', '10'];
export const BLIND_SWAP_RANKS: Rank[] = ['J', 'Q'];

// Black king has look-and-swap power
export const hasLookSwapPower = (card: Card): boolean => {
  return card.rank === 'K' && (card.suit === 'clubs' || card.suit === 'spades');
};

// Check if card has any power
export const hasPower = (card: Card): boolean => {
  return (
    PEEK_SELF_RANKS.includes(card.rank) ||
    PEEK_OTHER_RANKS.includes(card.rank) ||
    BLIND_SWAP_RANKS.includes(card.rank) ||
    hasLookSwapPower(card)
  );
};

// Get power type for a card
export const getPowerType = (card: Card): 'peek-self' | 'peek-other' | 'blind-swap' | 'look-swap' | null => {
  if (PEEK_SELF_RANKS.includes(card.rank)) return 'peek-self';
  if (PEEK_OTHER_RANKS.includes(card.rank)) return 'peek-other';
  if (BLIND_SWAP_RANKS.includes(card.rank)) return 'blind-swap';
  if (hasLookSwapPower(card)) return 'look-swap';
  return null;
};

// Timing constants
export const PEEK_DURATION_MS = 3000;        // Initial peek duration
export const POWER_PEEK_DURATION_MS = 3000;  // Power peek duration
export const BURN_WINDOW_MS = 2000;          // Time to complete burn tap sequence
export const BURN_RACE_WINDOW_MS = 500;      // Window to collect competing burns

// Display helpers
export const SUIT_SYMBOLS: Record<string, string> = {
  'hearts': '♥',
  'diamonds': '♦',
  'clubs': '♣',
  'spades': '♠',
};

export const getSuitSymbol = (suit: string | null): string => {
  if (!suit) return '★';  // Joker
  return SUIT_SYMBOLS[suit] || '?';
};

export const getSuitColor = (suit: string | null): string => {
  if (suit === 'hearts' || suit === 'diamonds') return '#DC2626';  // Red
  return '#1F2937';  // Black
};

// Format card for display
export const formatCard = (card: Card): string => {
  if (card.rank === 'joker') return 'Joker';
  return `${card.rank}${getSuitSymbol(card.suit)}`;
};

// Get power description
export const getPowerDescription = (card: Card): string | null => {
  const power = getPowerType(card);
  switch (power) {
    case 'peek-self': return 'Peek at one of your cards';
    case 'peek-other': return "Peek at an opponent's card";
    case 'blind-swap': return 'Blind swap with any opponent';
    case 'look-swap': return "Look at opponent's card and swap";
    default: return null;
  }
};
