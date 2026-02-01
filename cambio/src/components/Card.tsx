// Card Component - Displays a single playing card

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Card as CardType } from '../game/types';
import { getSuitSymbol, getSuitColor, formatCard } from '../game/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(70, SCREEN_WIDTH * 0.16);
const CARD_HEIGHT = CARD_WIDTH * 1.4;

interface CardProps {
  card: CardType | null;
  faceUp?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  highlighted?: boolean;
  peeking?: boolean;
  size?: 'small' | 'normal' | 'large';
  style?: object;
}

export const Card: React.FC<CardProps> = ({
  card,
  faceUp = false,
  onPress,
  onLongPress,
  disabled = false,
  highlighted = false,
  peeking = false,
  size = 'normal',
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Size multipliers
  const sizeMultiplier = size === 'small' ? 0.7 : size === 'large' ? 1.3 : 1;
  const cardWidth = CARD_WIDTH * sizeMultiplier;
  const cardHeight = CARD_HEIGHT * sizeMultiplier;

  // Highlight animation
  useEffect(() => {
    if (highlighted || peeking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [highlighted, peeking, glowAnim]);

  // Press animation
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  // Empty slot (no card)
  if (!card) {
    return (
      <View
        style={[
          styles.emptySlot,
          { width: cardWidth, height: cardHeight },
          style,
        ]}
      />
    );
  }

  // Interpolate glow color
  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', peeking ? '#60A5FA' : '#FCD34D'],
  });

  // Face-down card (card back)
  if (!faceUp) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            { width: cardWidth, height: cardHeight },
            { transform: [{ scale: scaleAnim }] },
            highlighted && { borderColor: glowColor, borderWidth: 3 },
            style,
          ]}
        >
          <View style={styles.cardBackInner}>
            <Text style={[styles.cardBackLogo, { fontSize: cardWidth * 0.5 }]}>C</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  // Face-up card
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const textColor = getSuitColor(card.suit);
  const isJoker = card.rank === 'joker';

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.card,
          styles.cardFront,
          { width: cardWidth, height: cardHeight },
          { transform: [{ scale: scaleAnim }] },
          peeking && styles.peekingCard,
          style,
        ]}
      >
        {isJoker ? (
          <View style={styles.jokerContent}>
            <Text style={[styles.jokerText, { fontSize: cardWidth * 0.25 }]}>JOKER</Text>
            <Text style={[styles.jokerSymbol, { fontSize: cardWidth * 0.4 }]}>★</Text>
          </View>
        ) : (
          <>
            {/* Top left corner */}
            <View style={styles.cornerTop}>
              <Text style={[styles.rank, { color: textColor, fontSize: cardWidth * 0.28 }]}>
                {card.rank}
              </Text>
              <Text style={[styles.suit, { color: textColor, fontSize: cardWidth * 0.22 }]}>
                {getSuitSymbol(card.suit)}
              </Text>
            </View>

            {/* Center suit */}
            <Text style={[styles.centerSuit, { color: textColor, fontSize: cardWidth * 0.5 }]}>
              {getSuitSymbol(card.suit)}
            </Text>

            {/* Bottom right corner (upside down) */}
            <View style={styles.cornerBottom}>
              <Text style={[styles.rank, { color: textColor, fontSize: cardWidth * 0.28 }]}>
                {card.rank}
              </Text>
              <Text style={[styles.suit, { color: textColor, fontSize: cardWidth * 0.22 }]}>
                {getSuitSymbol(card.suit)}
              </Text>
            </View>
          </>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Mini card for opponent hands (just shows back or count)
export const MiniCard: React.FC<{ count?: number }> = ({ count }) => {
  return (
    <View style={styles.miniCard}>
      <View style={styles.miniCardBack}>
        {count !== undefined && (
          <Text style={styles.miniCardCount}>{count}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    marginHorizontal: 3,
    marginVertical: 2,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardBack: {
    backgroundColor: '#1E3A5F',
    borderWidth: 2,
    borderColor: '#0F2744',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBackInner: {
    width: '80%',
    height: '85%',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FCD34D',
    backgroundColor: '#1E3A5F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBackLogo: {
    color: '#FCD34D',
    fontWeight: 'bold',
  },
  cardFront: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cornerTop: {
    position: 'absolute',
    top: 4,
    left: 6,
    alignItems: 'center',
  },
  cornerBottom: {
    position: 'absolute',
    bottom: 4,
    right: 6,
    alignItems: 'center',
    transform: [{ rotate: '180deg' }],
  },
  rank: {
    fontWeight: 'bold',
    lineHeight: 20,
  },
  suit: {
    marginTop: -4,
  },
  centerSuit: {
    position: 'absolute',
    alignSelf: 'center',
    top: '35%',
  },
  jokerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jokerText: {
    color: '#7C3AED',
    fontWeight: 'bold',
  },
  jokerSymbol: {
    color: '#7C3AED',
  },
  emptySlot: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
    marginHorizontal: 3,
    marginVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  peekingCard: {
    borderWidth: 3,
    borderColor: '#60A5FA',
    shadowColor: '#60A5FA',
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  miniCard: {
    width: 24,
    height: 32,
    marginHorizontal: 1,
  },
  miniCardBack: {
    flex: 1,
    backgroundColor: '#1E3A5F',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#FCD34D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniCardCount: {
    color: '#FCD34D',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default Card;
