// PlayerHand Component - Shows a player's 4 cards (2x2 grid) plus penalty cards

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { CardSlot, Card as CardType } from '../game/types';

interface PlayerHandProps {
  cards: CardSlot[];
  penaltyCards?: CardType[];
  playerName: string;
  isCurrentPlayer?: boolean;
  isMyHand?: boolean;
  onCardPress?: (index: number) => void;
  selectedIndex?: number | null;
  peekingIndex?: number | null;
  showCards?: boolean;  // For end-of-round reveal
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  penaltyCards = [],
  playerName,
  isCurrentPlayer = false,
  isMyHand = false,
  onCardPress,
  selectedIndex,
  peekingIndex,
  showCards = false,
}) => {
  // Determine which cards to show face-up
  const shouldShowCard = (slot: CardSlot, index: number): boolean => {
    if (showCards) return true;  // End of round reveal
    if (peekingIndex === index) return true;  // Being peeked
    if (isMyHand && slot.isRevealed) return true;  // Previously peeked by me
    return false;
  };

  // Top row: cards 0 and 1 (furthest from player)
  // Bottom row: cards 2 and 3 (closest to player - these are peeked at start)
  const topRow = cards.slice(0, 2);
  const bottomRow = cards.slice(2, 4);

  return (
    <View style={styles.container}>
      {/* Player name and turn indicator */}
      <View style={styles.header}>
        <Text style={[styles.playerName, isCurrentPlayer && styles.currentPlayerName]}>
          {playerName}
          {isMyHand && ' (You)'}
        </Text>
        {isCurrentPlayer && (
          <View style={styles.turnIndicator}>
            <Text style={styles.turnText}>●</Text>
          </View>
        )}
      </View>

      {/* Cards layout */}
      <View style={styles.cardsContainer}>
        {/* Main 4 cards in 2x2 grid */}
        <View style={styles.cardGrid}>
          {/* Top row (far cards) */}
          <View style={styles.cardRow}>
            {topRow.map((slot, idx) => (
              <Card
                key={idx}
                card={slot.card}
                faceUp={shouldShowCard(slot, idx)}
                onPress={() => onCardPress?.(idx)}
                highlighted={selectedIndex === idx}
                peeking={peekingIndex === idx}
              />
            ))}
          </View>

          {/* Bottom row (close cards - peeked at start) */}
          <View style={styles.cardRow}>
            {bottomRow.map((slot, idx) => {
              const actualIndex = idx + 2;
              return (
                <Card
                  key={actualIndex}
                  card={slot.card}
                  faceUp={shouldShowCard(slot, actualIndex)}
                  onPress={() => onCardPress?.(actualIndex)}
                  highlighted={selectedIndex === actualIndex}
                  peeking={peekingIndex === actualIndex}
                />
              );
            })}
          </View>
        </View>

        {/* Penalty cards (to the right) */}
        {penaltyCards.length > 0 && (
          <View style={styles.penaltyContainer}>
            <Text style={styles.penaltyLabel}>+{penaltyCards.length}</Text>
            <View style={styles.penaltyCards}>
              {penaltyCards.map((card, idx) => (
                <Card
                  key={`penalty-${idx}`}
                  card={card}
                  faceUp={showCards}
                  onPress={() => onCardPress?.(4 + idx)}
                  size="small"
                />
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

// Compact opponent hand view (for showing at top/sides of screen)
interface OpponentHandProps {
  playerName: string;
  cardCount: number;
  penaltyCount: number;
  isCurrentPlayer?: boolean;
  knownCards?: { index: number; card: CardType }[];
  onCardPress?: (index: number) => void;
}

export const OpponentHand: React.FC<OpponentHandProps> = ({
  playerName,
  cardCount,
  penaltyCount,
  isCurrentPlayer = false,
  knownCards = [],
  onCardPress,
}) => {
  // Create array of 4 card slots
  const slots = [0, 1, 2, 3];

  return (
    <View style={styles.opponentContainer}>
      <Text style={[styles.opponentName, isCurrentPlayer && styles.currentPlayerName]}>
        {playerName}
        {isCurrentPlayer && ' ●'}
      </Text>

      <View style={styles.opponentCards}>
        {/* Show 4 card positions in a row */}
        {slots.map(index => {
          const known = knownCards.find(k => k.index === index);
          return (
            <Card
              key={index}
              card={known?.card || { id: 'back', suit: null, rank: 'A' }}
              faceUp={!!known}
              size="small"
              onPress={() => onCardPress?.(index)}
            />
          );
        })}

        {/* Penalty indicator */}
        {penaltyCount > 0 && (
          <View style={styles.opponentPenalty}>
            <Text style={styles.opponentPenaltyText}>+{penaltyCount}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  currentPlayerName: {
    color: '#FCD34D',
  },
  turnIndicator: {
    marginLeft: 8,
  },
  turnText: {
    color: '#10B981',
    fontSize: 12,
  },
  cardsContainer: {
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
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  penaltyCards: {
    flexDirection: 'column',
  },
  // Opponent styles
  opponentContainer: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  opponentName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  opponentCards: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  opponentPenalty: {
    marginLeft: 4,
    backgroundColor: '#EF4444',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  opponentPenaltyText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default PlayerHand;
