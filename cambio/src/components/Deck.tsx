// Deck Components - Draw Pile and Discard Pile

import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Card } from './Card';
import { Card as CardType } from '../game/types';

interface DrawPileProps {
  cardCount: number;
  onPress?: () => void;
  disabled?: boolean;
  highlighted?: boolean;
}

export const DrawPile: React.FC<DrawPileProps> = ({
  cardCount,
  onPress,
  disabled = false,
  highlighted = false,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (highlighted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [highlighted, pulseAnim]);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || cardCount === 0}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.pileContainer,
          { transform: [{ scale: pulseAnim }] },
          highlighted && styles.highlightedPile,
        ]}
      >
        {/* Stack effect - show multiple cards */}
        {cardCount >= 3 && (
          <View style={[styles.stackCard, styles.stackCard3]} />
        )}
        {cardCount >= 2 && (
          <View style={[styles.stackCard, styles.stackCard2]} />
        )}

        {/* Top card */}
        <View style={styles.topCard}>
          <View style={styles.cardBackInner}>
            <Text style={styles.cardBackLogo}>C</Text>
          </View>
        </View>

        {/* Card count */}
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{cardCount}</Text>
        </View>

        <Text style={styles.pileLabel}>Draw</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

interface DiscardPileProps {
  topCard: CardType | null;
  cardCount: number;
  onPress?: () => void;
  disabled?: boolean;
  highlighted?: boolean;  // For burn target
}

export const DiscardPile: React.FC<DiscardPileProps> = ({
  topCard,
  cardCount,
  onPress,
  disabled = false,
  highlighted = false,
}) => {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (highlighted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [highlighted, glowAnim]);

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', '#EF4444'],
  });

  // Empty discard pile
  if (!topCard) {
    return (
      <View style={styles.pileContainer}>
        <View style={styles.emptyPile}>
          <Text style={styles.emptyPileText}>Discard</Text>
        </View>
        <Text style={styles.pileLabel}>Discard</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.pileContainer,
          highlighted && { borderColor, borderWidth: 3, borderRadius: 12 },
        ]}
      >
        {/* Show a few cards in stack */}
        {cardCount >= 3 && (
          <View style={[styles.discardStackCard, styles.stackCard3]} />
        )}
        {cardCount >= 2 && (
          <View style={[styles.discardStackCard, styles.stackCard2]} />
        )}

        {/* Top card (face up) */}
        <Card card={topCard} faceUp={true} disabled={disabled} />

        <Text style={styles.pileLabel}>Discard</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Drawn card display (shows in center when player draws)
interface DrawnCardDisplayProps {
  card: CardType;
  source: 'draw-pile' | 'discard-pile';
  onDiscard?: () => void;
  onDiscardWithPower?: () => void;
  onSwapSelect?: () => void;
  hasPower?: boolean;
  powerDescription?: string;
  mustSwap?: boolean;  // True when taken from discard
}

export const DrawnCardDisplay: React.FC<DrawnCardDisplayProps> = ({
  card,
  source,
  onDiscard,
  onDiscardWithPower,
  onSwapSelect,
  hasPower = false,
  powerDescription,
  mustSwap = false,
}) => {
  return (
    <View style={styles.drawnCardContainer}>
      <Text style={styles.drawnCardTitle}>
        {source === 'draw-pile' ? 'You drew:' : 'You took:'}
      </Text>

      <Card card={card} faceUp={true} size="large" />

      {mustSwap ? (
        <View style={styles.drawnCardActions}>
          <Text style={styles.mustSwapText}>Tap a card in your hand to swap</Text>
        </View>
      ) : (
        <View style={styles.drawnCardActions}>
          {/* Swap button */}
          <TouchableOpacity style={styles.actionButton} onPress={onSwapSelect}>
            <Text style={styles.actionButtonText}>Swap</Text>
          </TouchableOpacity>

          {/* Discard button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.discardButton]}
            onPress={onDiscard}
          >
            <Text style={styles.actionButtonText}>Discard</Text>
          </TouchableOpacity>

          {/* Use power button (if applicable) */}
          {hasPower && (
            <TouchableOpacity
              style={[styles.actionButton, styles.powerButton]}
              onPress={onDiscardWithPower}
            >
              <Text style={styles.actionButtonText}>Use Power</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {hasPower && powerDescription && (
        <Text style={styles.powerDescription}>{powerDescription}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pileContainer: {
    alignItems: 'center',
    padding: 4,
  },
  stackCard: {
    position: 'absolute',
    width: 70,
    height: 98,
    backgroundColor: '#1E3A5F',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0F2744',
  },
  stackCard2: {
    top: -3,
    left: 3,
    zIndex: -1,
  },
  stackCard3: {
    top: -6,
    left: 6,
    zIndex: -2,
  },
  topCard: {
    width: 70,
    height: 98,
    backgroundColor: '#1E3A5F',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0F2744',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardBackInner: {
    width: '80%',
    height: '85%',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FCD34D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBackLogo: {
    color: '#FCD34D',
    fontSize: 32,
    fontWeight: 'bold',
  },
  countBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  countText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pileLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 8,
  },
  highlightedPile: {
    shadowColor: '#FCD34D',
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  discardStackCard: {
    position: 'absolute',
    width: 70,
    height: 98,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyPile: {
    width: 70,
    height: 98,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  emptyPileText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
  },
  // Drawn card display
  drawnCardContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 20,
  },
  drawnCardTitle: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 12,
  },
  drawnCardActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  discardButton: {
    backgroundColor: '#6B7280',
  },
  powerButton: {
    backgroundColor: '#8B5CF6',
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  mustSwapText: {
    color: '#FCD34D',
    fontSize: 14,
    fontStyle: 'italic',
  },
  powerDescription: {
    color: '#A5B4FC',
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
});
