# Cambio - Project Architecture & Development Plan

This document answers your development questions and provides the technical blueprint for building Cambio.

---

## Table of Contents
1. [Project Structure](#1-project-structure)
2. [First Milestone: Basic Prototype](#2-first-milestone-basic-prototype)
3. [Card Assets Strategy](#3-card-assets-strategy)
4. [State Management Approach](#4-state-management-approach)
5. [Testing on Windows](#5-testing-on-windows)
6. [Development Phases](#6-development-phases)

---

## 1. Project Structure

After running `npx react-native init Cambio`, create this folder structure:

```
Cambio/
├── android/                    # Auto-generated Android files
├── ios/                        # Auto-generated iOS files
├── src/                        # ALL YOUR CODE GOES HERE
│   ├── components/             # Reusable UI pieces
│   │   ├── Card/
│   │   │   ├── Card.tsx              # Single card component
│   │   │   ├── CardBack.tsx          # Face-down card design
│   │   │   └── styles.ts             # Card styling
│   │   ├── PlayerHand/
│   │   │   ├── PlayerHand.tsx        # 4-card hand layout
│   │   │   └── styles.ts
│   │   ├── Deck/
│   │   │   ├── DrawPile.tsx          # Face-down draw pile
│   │   │   ├── DiscardPile.tsx       # Face-up discard pile
│   │   │   └── styles.ts
│   │   ├── GameTable/
│   │   │   ├── GameTable.tsx         # Main game layout
│   │   │   └── styles.ts
│   │   └── UI/
│   │       ├── Button.tsx            # Custom buttons
│   │       ├── ScoreBoard.tsx        # Score display
│   │       ├── TurnIndicator.tsx     # Whose turn it is
│   │       └── RoundCounter.tsx      # "Round 3 of 10"
│   │
│   ├── screens/                # Full-screen views
│   │   ├── HomeScreen.tsx            # Main menu
│   │   ├── GameScreen.tsx            # The actual game
│   │   ├── SetupScreen.tsx           # Player names, rounds selection
│   │   ├── ScoreScreen.tsx           # End-of-round scores
│   │   └── RulesScreen.tsx           # How to play
│   │
│   ├── game/                   # Core game logic (NO UI CODE)
│   │   ├── types.ts                  # TypeScript types/interfaces
│   │   ├── constants.ts              # Card values, game rules
│   │   ├── deck.ts                   # Deck creation, shuffling
│   │   ├── scoring.ts                # Point calculation
│   │   ├── turns.ts                  # Turn logic, valid actions
│   │   ├── powers.ts                 # Special card power logic
│   │   └── burning.ts                # Burning mechanic logic
│   │
│   ├── state/                  # State management
│   │   ├── GameContext.tsx           # React Context for game state
│   │   ├── gameReducer.ts            # State update logic
│   │   └── actions.ts                # Action types and creators
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useGameState.ts           # Access game state
│   │   ├── useBurning.ts             # Burning touch detection
│   │   ├── useAnimation.ts           # Card animation helpers
│   │   └── usePeek.ts                # Peek timing logic
│   │
│   ├── animations/             # Animation configurations
│   │   ├── cardAnimations.ts         # Card movement animations
│   │   └── transitions.ts            # Screen transitions
│   │
│   ├── assets/                 # Static files
│   │   ├── images/
│   │   │   ├── card-back.png         # Card back design
│   │   │   └── icons/                # UI icons
│   │   └── sounds/                   # Future: sound effects
│   │
│   └── utils/                  # Helper functions
│       ├── shuffle.ts                # Fisher-Yates shuffle
│       └── helpers.ts                # Misc utilities
│
├── App.tsx                     # App entry point
├── package.json
└── tsconfig.json
```

### Why This Structure?

**Separation of Concerns:**
- `game/` contains pure logic - no React, no UI. This makes it easy to test and reuse.
- `components/` are reusable building blocks
- `screens/` are full pages that compose components
- `state/` handles all data flow

**Scalability:**
- When you add multiplayer later, you'll only need to modify `state/` and add networking
- The game logic in `game/` stays the same

---

## 2. First Milestone: Basic Prototype

Here's the code for your first working prototype.

### Create src/game/types.ts
```typescript
// Core types for the game

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'joker';

export interface Card {
  id: string;           // Unique identifier (e.g., "hearts-7-1")
  suit: Suit | null;    // null for jokers
  rank: Rank;
  faceUp: boolean;      // Is the card visible?
}

export interface Player {
  id: string;
  name: string;
  hand: (Card | null)[];  // 4 positions, null if card was burned away
  penaltyCards: Card[];   // Cards beyond the original 4
  score: number;          // Cumulative score across rounds
}

export interface GameState {
  // Game setup
  players: Player[];
  currentPlayerIndex: number;
  roundNumber: number;
  totalRounds: number;

  // Decks
  drawPile: Card[];
  discardPile: Card[];

  // Turn state
  phase: GamePhase;
  drawnCard: Card | null;        // Card currently drawn (before decision)
  selectedCardIndex: number | null;  // For swapping

  // Burning state
  burnAttemptInProgress: boolean;
  burnSourcePlayer: string | null;
  burnSourceIndex: number | null;
}

export type GamePhase =
  | 'waiting'           // Between turns
  | 'peek'              // Initial 3-second peek
  | 'drawing'           // Player must draw
  | 'deciding'          // Player drew from pile, must choose action
  | 'swapping'          // Player selecting card to swap
  | 'power-active'      // Using a special power
  | 'round-end'         // Showing scores
  | 'game-end';         // Final results
```

### Create src/game/constants.ts
```typescript
// Card values for scoring
export const CARD_VALUES: Record<string, number> = {
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
  // Kings handled specially based on color
};

// Red kings = -1, Black kings = 13
export const getCardValue = (card: { suit: string | null; rank: string }): number => {
  if (card.rank === 'K') {
    return card.suit === 'hearts' || card.suit === 'diamonds' ? -1 : 13;
  }
  return CARD_VALUES[card.rank] ?? 0;
};

// Special power cards
export const PEEK_SELF_CARDS = ['7', '8'];
export const PEEK_OPPONENT_CARDS = ['9', '10'];
export const BLIND_SWAP_CARDS = ['J', 'Q'];
export const LOOK_AND_SWAP_CARDS = ['K']; // Only black kings

export const PEEK_DURATION_MS = 3000; // 3 seconds for initial peek
```

### Create src/game/deck.ts
```typescript
import { Card, Suit, Rank } from './types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Fisher-Yates shuffle - the gold standard for randomization
export const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// Create a single deck (52 cards + 2 jokers)
export const createDeck = (deckNumber: number = 1): Card[] => {
  const cards: Card[] = [];

  // Standard 52 cards
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({
        id: `${suit}-${rank}-${deckNumber}`,
        suit,
        rank,
        faceUp: false,
      });
    }
  }

  // Add 2 jokers
  cards.push({
    id: `joker-red-${deckNumber}`,
    suit: null,
    rank: 'joker',
    faceUp: false,
  });
  cards.push({
    id: `joker-black-${deckNumber}`,
    suit: null,
    rank: 'joker',
    faceUp: false,
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

// Deal cards to players
export const dealCards = (deck: Card[], playerCount: number): { hands: Card[][]; remainingDeck: Card[] } => {
  const hands: Card[][] = [];
  let currentDeck = [...deck];

  for (let i = 0; i < playerCount; i++) {
    const hand = currentDeck.slice(0, 4);
    currentDeck = currentDeck.slice(4);
    hands.push(hand);
  }

  return { hands, remainingDeck: currentDeck };
};
```

### Create src/components/Card/Card.tsx
```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card as CardType } from '../../game/types';

interface CardProps {
  card: CardType | null;
  onPress?: () => void;
  highlighted?: boolean;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({
  card,
  onPress,
  highlighted = false,
  disabled = false
}) => {
  // Empty slot (card was burned away)
  if (!card) {
    return <View style={styles.emptySlot} />;
  }

  // Face-down card
  if (!card.faceUp) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[styles.card, styles.cardBack, highlighted && styles.highlighted]}
        activeOpacity={0.7}
      >
        <View style={styles.cardBackPattern}>
          <Text style={styles.cardBackText}>C</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Face-up card
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const suitSymbol = getSuitSymbol(card.suit);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.card, styles.cardFront, highlighted && styles.highlighted]}
      activeOpacity={0.7}
    >
      <Text style={[styles.rank, isRed && styles.redText]}>
        {card.rank === 'joker' ? 'JKR' : card.rank}
      </Text>
      <Text style={[styles.suit, isRed && styles.redText]}>
        {suitSymbol}
      </Text>
    </TouchableOpacity>
  );
};

const getSuitSymbol = (suit: string | null): string => {
  switch (suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    case 'spades': return '♠';
    default: return '★'; // Joker
  }
};

const styles = StyleSheet.create({
  card: {
    width: 60,
    height: 84,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  cardFront: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  cardBack: {
    backgroundColor: '#1a5276',
    borderWidth: 2,
    borderColor: '#154360',
  },
  cardBackPattern: {
    width: '80%',
    height: '80%',
    backgroundColor: '#1a5276',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#f4d03f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBackText: {
    color: '#f4d03f',
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptySlot: {
    width: 60,
    height: 84,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#555',
    borderStyle: 'dashed',
    marginHorizontal: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  rank: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  suit: {
    fontSize: 24,
    color: '#000',
  },
  redText: {
    color: '#c0392b',
  },
  highlighted: {
    borderWidth: 3,
    borderColor: '#f1c40f',
    shadowColor: '#f1c40f',
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
});
```

### Create src/components/PlayerHand/PlayerHand.tsx
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../Card/Card';
import { Card as CardType } from '../../game/types';

interface PlayerHandProps {
  cards: (CardType | null)[];
  penaltyCards?: CardType[];
  playerName: string;
  isCurrentPlayer?: boolean;
  onCardPress?: (index: number) => void;
  highlightedIndex?: number | null;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  penaltyCards = [],
  playerName,
  isCurrentPlayer = false,
  onCardPress,
  highlightedIndex,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.playerName, isCurrentPlayer && styles.currentPlayer]}>
        {playerName} {isCurrentPlayer && '(Your Turn)'}
      </Text>

      <View style={styles.handContainer}>
        {/* Main 4 cards in 2x2 grid */}
        <View style={styles.cardGrid}>
          <View style={styles.cardRow}>
            {cards.slice(0, 2).map((card, index) => (
              <Card
                key={index}
                card={card}
                onPress={() => onCardPress?.(index)}
                highlighted={highlightedIndex === index}
              />
            ))}
          </View>
          <View style={styles.cardRow}>
            {cards.slice(2, 4).map((card, index) => (
              <Card
                key={index + 2}
                card={card}
                onPress={() => onCardPress?.(index + 2)}
                highlighted={highlightedIndex === index + 2}
              />
            ))}
          </View>
        </View>

        {/* Penalty cards shown to the side */}
        {penaltyCards.length > 0 && (
          <View style={styles.penaltyContainer}>
            <Text style={styles.penaltyLabel}>+{penaltyCards.length}</Text>
            {penaltyCards.map((card, index) => (
              <Card
                key={`penalty-${index}`}
                card={card}
                onPress={() => onCardPress?.(4 + index)}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 10,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  currentPlayer: {
    color: '#f1c40f',
  },
  handContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardGrid: {
    alignItems: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  penaltyContainer: {
    marginLeft: 16,
    alignItems: 'center',
  },
  penaltyLabel: {
    color: '#e74c3c',
    fontWeight: 'bold',
    marginBottom: 4,
  },
});
```

### Create src/components/Deck/DrawPile.tsx
```typescript
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface DrawPileProps {
  cardsRemaining: number;
  onPress?: () => void;
  disabled?: boolean;
}

export const DrawPile: React.FC<DrawPileProps> = ({
  cardsRemaining,
  onPress,
  disabled = false
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || cardsRemaining === 0}
      style={styles.container}
      activeOpacity={0.7}
    >
      {/* Stack effect - multiple cards */}
      <View style={[styles.card, styles.cardStack2]} />
      <View style={[styles.card, styles.cardStack1]} />
      <View style={styles.card}>
        <View style={styles.cardBackPattern}>
          <Text style={styles.cardBackText}>C</Text>
        </View>
      </View>
      <Text style={styles.countLabel}>{cardsRemaining}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  card: {
    width: 60,
    height: 84,
    borderRadius: 6,
    backgroundColor: '#1a5276',
    borderWidth: 2,
    borderColor: '#154360',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  cardStack1: {
    position: 'absolute',
    top: -2,
    left: 2,
    zIndex: -1,
  },
  cardStack2: {
    position: 'absolute',
    top: -4,
    left: 4,
    zIndex: -2,
  },
  cardBackPattern: {
    width: '80%',
    height: '80%',
    backgroundColor: '#1a5276',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#f4d03f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBackText: {
    color: '#f4d03f',
    fontSize: 24,
    fontWeight: 'bold',
  },
  countLabel: {
    color: '#AAA',
    fontSize: 12,
    marginTop: 4,
  },
});
```

### Create src/components/Deck/DiscardPile.tsx
```typescript
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Card } from '../Card/Card';
import { Card as CardType } from '../../game/types';

interface DiscardPileProps {
  topCard: CardType | null;
  onPress?: () => void;
  disabled?: boolean;
  highlighted?: boolean;
}

export const DiscardPile: React.FC<DiscardPileProps> = ({
  topCard,
  onPress,
  disabled = false,
  highlighted = false
}) => {
  // Empty discard pile
  if (!topCard) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[styles.emptyPile, highlighted && styles.highlighted]}
      >
        <Text style={styles.emptyText}>Discard</Text>
      </TouchableOpacity>
    );
  }

  // Show top card face-up
  return (
    <View style={styles.container}>
      <Card
        card={{ ...topCard, faceUp: true }}
        onPress={onPress}
        disabled={disabled}
        highlighted={highlighted}
      />
      <Text style={styles.label}>Discard</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  emptyPile: {
    width: 60,
    height: 84,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#555',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  emptyText: {
    color: '#666',
    fontSize: 10,
  },
  label: {
    color: '#AAA',
    fontSize: 12,
    marginTop: 4,
  },
  highlighted: {
    borderColor: '#f1c40f',
    borderWidth: 3,
    shadowColor: '#f1c40f',
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
});
```

### Update App.tsx (Replace entire contents)
```typescript
import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Card } from './src/components/Card/Card';
import { PlayerHand } from './src/components/PlayerHand/PlayerHand';
import { DrawPile } from './src/components/Deck/DrawPile';
import { DiscardPile } from './src/components/Deck/DiscardPile';
import { createGameDeck, dealCards } from './src/game/deck';
import { Card as CardType } from './src/game/types';

const App = () => {
  // Initialize game state
  const [gameStarted, setGameStarted] = useState(false);
  const [drawPile, setDrawPile] = useState<CardType[]>([]);
  const [discardPile, setDiscardPile] = useState<CardType[]>([]);
  const [playerHands, setPlayerHands] = useState<CardType[][]>([]);
  const [drawnCard, setDrawnCard] = useState<CardType | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

  // Start a new game
  const startGame = () => {
    const deck = createGameDeck(2); // 2 players for now
    const { hands, remainingDeck } = dealCards(deck, 2);

    // First card to discard pile
    const firstDiscard = remainingDeck[0];
    const restOfDeck = remainingDeck.slice(1);

    setPlayerHands(hands);
    setDrawPile(restOfDeck);
    setDiscardPile([{ ...firstDiscard, faceUp: true }]);
    setDrawnCard(null);
    setSelectedCardIndex(null);
    setGameStarted(true);
  };

  // Draw from pile
  const handleDrawFromPile = () => {
    if (drawnCard || drawPile.length === 0) return;

    const card = drawPile[0];
    setDrawPile(drawPile.slice(1));
    setDrawnCard({ ...card, faceUp: true });
  };

  // Take from discard pile
  const handleTakeFromDiscard = () => {
    if (drawnCard || discardPile.length === 0) return;

    const card = discardPile[discardPile.length - 1];
    setDiscardPile(discardPile.slice(0, -1));
    setDrawnCard(card);
    // Must swap when taking from discard
  };

  // Handle card tap in hand
  const handleCardPress = (playerIndex: number, cardIndex: number) => {
    if (playerIndex !== 0) return; // Only player 0 can interact for now

    if (drawnCard) {
      // Swap drawn card with tapped card
      const newHands = [...playerHands];
      const oldCard = newHands[playerIndex][cardIndex];
      newHands[playerIndex][cardIndex] = { ...drawnCard, faceUp: false };
      setPlayerHands(newHands);

      // Old card goes to discard
      setDiscardPile([...discardPile, { ...oldCard, faceUp: true }]);
      setDrawnCard(null);
    } else {
      // Just selecting a card
      setSelectedCardIndex(cardIndex);
    }
  };

  // Discard drawn card (without using power)
  const handleDiscardDrawnCard = () => {
    if (!drawnCard) return;
    setDiscardPile([...discardPile, drawnCard]);
    setDrawnCard(null);
  };

  // Main menu
  if (!gameStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.menuContainer}>
          <Text style={styles.title}>CAMBIO</Text>
          <Text style={styles.subtitle}>A Memory Card Game</Text>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Game screen
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gameContainer}>
        {/* Round counter */}
        <Text style={styles.roundText}>Round 1 of 10</Text>

        {/* Opponent's hand (top) */}
        <PlayerHand
          cards={playerHands[1] || []}
          playerName="Opponent"
          onCardPress={(index) => handleCardPress(1, index)}
        />

        {/* Center area - Decks */}
        <View style={styles.centerArea}>
          <DrawPile
            cardsRemaining={drawPile.length}
            onPress={handleDrawFromPile}
            disabled={!!drawnCard}
          />

          <View style={styles.deckSpacer} />

          <DiscardPile
            topCard={discardPile[discardPile.length - 1] || null}
            onPress={handleTakeFromDiscard}
            disabled={!!drawnCard}
          />
        </View>

        {/* Drawn card display */}
        {drawnCard && (
          <View style={styles.drawnCardArea}>
            <Text style={styles.drawnCardLabel}>You drew:</Text>
            <Card card={drawnCard} />
            <View style={styles.drawnCardActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDiscardDrawnCard}
              >
                <Text style={styles.actionButtonText}>Discard</Text>
              </TouchableOpacity>
              <Text style={styles.orText}>or tap a card to swap</Text>
            </View>
          </View>
        )}

        {/* Player's hand (bottom) */}
        <PlayerHand
          cards={playerHands[0] || []}
          playerName="You"
          isCurrentPlayer={true}
          onCardPress={(index) => handleCardPress(0, index)}
          highlightedIndex={selectedCardIndex}
        />

        {/* Reset button */}
        <TouchableOpacity style={styles.resetButton} onPress={startGame}>
          <Text style={styles.resetButtonText}>New Game</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a472a', // Casino green
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#f4d03f',
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAA',
    marginTop: 8,
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: '#f4d03f',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 8,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a472a',
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  roundText: {
    textAlign: 'center',
    color: '#AAA',
    fontSize: 14,
  },
  centerArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  deckSpacer: {
    width: 40,
  },
  drawnCardArea: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 12,
  },
  drawnCardLabel: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 8,
  },
  drawnCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  actionButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  orText: {
    color: '#AAA',
    marginLeft: 12,
    fontSize: 12,
  },
  resetButton: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
  },
  resetButtonText: {
    color: '#AAA',
    fontSize: 12,
  },
});

export default App;
```

---

## 3. Card Assets Strategy

### Recommendation: Start with Styled Placeholders

For initial development, the code above uses **styled placeholder cards**. This is the right approach because:

1. **Faster iteration** - You can focus on gameplay mechanics
2. **No asset management headaches** - No importing/sizing images
3. **Looks professional enough** - Unicode card symbols (♥♦♣♠) work great
4. **Easy to customize** - Change colors/fonts instantly

### When to Add Real Graphics

Add proper card images when:
- Core gameplay is complete and tested
- You're preparing for App Store submission
- You want a specific visual theme

### Card Asset Specifications (for later)

When you're ready for real card images:

```
Format: PNG with transparency
Size: 200 x 280 pixels (5:7 ratio)
Resolution: @1x, @2x, @3x for different screen densities

File structure:
assets/
  images/
    cards/
      hearts-A.png
      hearts-A@2x.png
      hearts-A@3x.png
      ... (all 54 cards)
    card-back.png
    card-back@2x.png
    card-back@3x.png
```

### Free Card Asset Sources

- **OpenGameArt.org** - Public domain card sets
- **Kenney.nl** - Free game assets (CC0)
- **Custom design** - Use Figma/Canva to create your own

---

## 4. State Management Approach

### Recommendation: React Context + useReducer

For a card game like Cambio, you need:
- Complex state (multiple players, cards, phases)
- Actions that affect multiple state pieces
- State accessible from many components

**React Context + useReducer** is perfect because:
- Built into React (no extra dependencies)
- Clear action/reducer pattern
- Easy to debug
- Scales well for this complexity level

### Why NOT Redux/MobX/Zustand?

Those are overkill for this project:
- Cambio has complex but bounded state
- No server synchronization (initially)
- The game naturally fits the reducer pattern
- Extra dependencies increase app size

### State Architecture

Create `src/state/GameContext.tsx`:
```typescript
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, GamePhase, Card, Player } from '../game/types';

// All possible actions
type GameAction =
  | { type: 'START_GAME'; players: string[]; totalRounds: number }
  | { type: 'DRAW_FROM_PILE' }
  | { type: 'TAKE_FROM_DISCARD' }
  | { type: 'SWAP_CARD'; playerIndex: number; cardIndex: number }
  | { type: 'DISCARD_DRAWN_CARD'; usePower: boolean }
  | { type: 'SELECT_CARD'; playerIndex: number; cardIndex: number }
  | { type: 'BURN_ATTEMPT'; sourcePlayer: number; sourceIndex: number }
  | { type: 'BURN_COMPLETE'; success: boolean }
  | { type: 'END_PEEK' }
  | { type: 'CALL_CAMBIO' }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESET_GAME' };

// Initial empty state
const initialState: GameState = {
  players: [],
  currentPlayerIndex: 0,
  roundNumber: 0,
  totalRounds: 10,
  drawPile: [],
  discardPile: [],
  phase: 'waiting',
  drawnCard: null,
  selectedCardIndex: null,
  burnAttemptInProgress: false,
  burnSourcePlayer: null,
  burnSourceIndex: null,
};

// Reducer handles all state changes
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      // Initialize game state
      return state; // Implement full logic

    case 'DRAW_FROM_PILE':
      if (state.drawPile.length === 0) return state;
      const drawnCard = state.drawPile[0];
      return {
        ...state,
        drawnCard: { ...drawnCard, faceUp: true },
        drawPile: state.drawPile.slice(1),
        phase: 'deciding',
      };

    // ... implement other actions

    default:
      return state;
  }
}

// Context
const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

// Provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// Hook for easy access
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};
```

### Burning Mechanic - Critical for Performance

The burning mechanic needs sub-second response. Here's the approach:

Create `src/hooks/useBurning.ts`:
```typescript
import { useRef, useCallback } from 'react';
import { GestureResponderEvent } from 'react-native';

interface BurnState {
  sourcePlayer: number | null;
  sourceIndex: number | null;
  timestamp: number;
}

export const useBurning = (onBurnAttempt: (source: BurnState) => void) => {
  const burnState = useRef<BurnState | null>(null);
  const BURN_TIMEOUT_MS = 2000; // Must tap discard within 2 seconds

  // Called when player taps a card (theirs or opponent's)
  const handleCardTap = useCallback((playerIndex: number, cardIndex: number) => {
    burnState.current = {
      sourcePlayer: playerIndex,
      sourceIndex: cardIndex,
      timestamp: Date.now(),
    };

    // Auto-cancel if discard not tapped in time
    setTimeout(() => {
      if (burnState.current?.timestamp === Date.now()) {
        burnState.current = null;
      }
    }, BURN_TIMEOUT_MS);
  }, []);

  // Called when player taps discard pile
  const handleDiscardTap = useCallback(() => {
    if (!burnState.current) return;

    const elapsed = Date.now() - burnState.current.timestamp;
    if (elapsed < BURN_TIMEOUT_MS) {
      onBurnAttempt(burnState.current);
    }
    burnState.current = null;
  }, [onBurnAttempt]);

  return { handleCardTap, handleDiscardTap };
};
```

---

## 5. Testing on Windows

### Option 1: Android Emulator (Recommended for Development)

**Setup:** Already covered in SETUP_GUIDE.md

**Pros:**
- Test touch interactions
- Simulate different screen sizes
- No physical device needed

**Cons:**
- Slower than physical device
- Battery drain on laptop
- Requires good CPU/RAM

### Option 2: Physical Android Device

**Setup:**
1. Enable Developer Options on phone (Settings > About > Tap Build Number 7 times)
2. Enable USB Debugging in Developer Options
3. Connect via USB
4. Run `adb devices` to verify
5. Run `npm run android`

**Pros:**
- Real performance testing
- Actual touch response feel
- Test on real hardware

### Option 3: Expo Go (Alternative Approach)

If you find React Native CLI too complex, consider Expo:

```bash
npx create-expo-app Cambio
cd Cambio
npx expo start
```

Then scan QR code with Expo Go app on your phone.

**Pros:**
- Easier setup
- Test on real device over WiFi
- No Android Studio needed

**Cons:**
- Some limitations on native features
- Larger app size
- Ejecting required for some features

### Testing Touch Response for Burning

Create a simple test component:

```typescript
// TestTouchResponse.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const TestTouchResponse = () => {
  const [lastTap, setLastTap] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const handleTap = () => {
    const now = Date.now();
    if (lastTap) {
      setResponseTime(now - lastTap);
    }
    setLastTap(now);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleTap}>
        <Text style={styles.text}>TAP ME</Text>
      </TouchableOpacity>
      {responseTime && (
        <Text style={styles.result}>
          Time between taps: {responseTime}ms
          {responseTime < 500 ? ' ✓ Fast!' : ' - Try faster!'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  button: {
    width: 150, height: 150, backgroundColor: '#3498db',
    justifyContent: 'center', alignItems: 'center', borderRadius: 75
  },
  text: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  result: { marginTop: 20, fontSize: 16 },
});
```

---

## 6. Development Phases

### Phase 1: Core Gameplay (2-3 weeks)
- [x] Project setup
- [ ] Basic UI (cards, hands, decks)
- [ ] Draw from pile
- [ ] Take from discard
- [ ] Swap cards
- [ ] Turn rotation
- [ ] Initial 3-second peek
- [ ] Round scoring
- [ ] Cambio calling

### Phase 2: Special Powers (1-2 weeks)
- [ ] 7/8: Peek own card
- [ ] 9/10: Peek opponent's card (with visible highlight)
- [ ] J/Q: Blind swap
- [ ] Black King: Look and swap

### Phase 3: Burning Mechanic (1-2 weeks)
- [ ] Touch detection system
- [ ] Burn own card
- [ ] Burn opponent's card
- [ ] Penalty cards
- [ ] Race condition handling (multiple burners)

### Phase 4: Multi-Round Support (1 week)
- [ ] Score tracking across rounds
- [ ] End-of-round scoreboard
- [ ] Winner determination
- [ ] Round reset

### Phase 5: Polish & 3-8 Players (2-3 weeks)
- [ ] Animations (card draws, swaps, burns)
- [ ] Sound effects
- [ ] Visual feedback
- [ ] 3-8 player layouts
- [ ] 2-deck support (5+ players)

### Phase 6: App Store Preparation (1-2 weeks)
- [ ] App icons
- [ ] Splash screen
- [ ] Privacy policy
- [ ] App Store screenshots
- [ ] Beta testing

---

## Quick Start Checklist

After environment setup:

1. [ ] Create project: `npx react-native@latest init Cambio`
2. [ ] Create `src/` folder structure as shown above
3. [ ] Copy the code files from Section 2
4. [ ] Run: `npm start` (Terminal 1)
5. [ ] Run: `npm run android` (Terminal 2)
6. [ ] Verify basic UI appears
7. [ ] Test tap interactions

You now have everything you need to start building Cambio!
