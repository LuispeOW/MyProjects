// Game Screen - Main gameplay area

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { GameState, TurnPhase, Card as CardType } from '../game/types';
import { Card } from '../components/Card';
import { PlayerHand, OpponentHand } from '../components/PlayerHand';
import { DrawPile, DiscardPile, DrawnCardDisplay } from '../components/Deck';
import { getPowerType, getPowerDescription, PEEK_DURATION_MS } from '../game/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GameScreenProps {
  gameState: GameState;
  myPlayerId: string;
  onDrawFromPile: () => void;
  onTakeFromDiscard: () => void;
  onDiscard: (usePower: boolean) => void;
  onSwap: (cardIndex: number) => void;
  onPeek: (targetPlayerId: string, cardIndex: number) => void;
  onCompletePeek: () => void;
  onBlindSwap: (myIndex: number, targetPlayerId: string, targetIndex: number) => void;
  onBurn: (targetPlayerId: string, cardIndex: number) => void;
  onCallCambio: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  gameState,
  myPlayerId,
  onDrawFromPile,
  onTakeFromDiscard,
  onDiscard,
  onSwap,
  onPeek,
  onCompletePeek,
  onBlindSwap,
  onBurn,
  onCallCambio,
}) => {
  // Find my player info
  const myPlayerIndex = gameState.players.findIndex(p => p.id === myPlayerId);
  const myPlayer = gameState.players[myPlayerIndex];
  const isMyTurn = gameState.currentPlayerIndex === myPlayerIndex;
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  // State for swap selection in blind swap
  const [selectedMyCard, setSelectedMyCard] = useState<number | null>(null);
  const [selectedOpponentCard, setSelectedOpponentCard] = useState<{
    playerId: string;
    index: number;
  } | null>(null);

  // Burn state
  const [burnTarget, setBurnTarget] = useState<{
    playerId: string;
    index: number;
  } | null>(null);

  // Peek timer
  const [peekTimeRemaining, setPeekTimeRemaining] = useState<number | null>(null);

  // Handle peek phase timer
  useEffect(() => {
    if (gameState.phase === 'peek') {
      setPeekTimeRemaining(3);
      const interval = setInterval(() => {
        setPeekTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState.phase]);

  // Handle peek power timer
  useEffect(() => {
    if (gameState.peekingPlayerId && gameState.peekingPlayerId === myPlayerId) {
      setPeekTimeRemaining(3);
      const timer = setTimeout(() => {
        onCompletePeek();
        setPeekTimeRemaining(null);
      }, PEEK_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [gameState.peekingPlayerId, myPlayerId, onCompletePeek]);

  // Get opponents (all players except me)
  const opponents = gameState.players.filter((_, idx) => idx !== myPlayerIndex);

  // Handle card press in my hand
  const handleMyCardPress = (cardIndex: number) => {
    // If I have a drawn card, swap with it
    if (gameState.drawnCard && isMyTurn) {
      if (gameState.turnPhase === 'decide' || gameState.turnPhase === 'swap-select') {
        onSwap(cardIndex);
        return;
      }
    }

    // Peek self power
    if (gameState.turnPhase === 'power-peek-self' && isMyTurn) {
      onPeek(myPlayerId, cardIndex);
      return;
    }

    // Blind swap - select my card first
    if (gameState.turnPhase === 'power-blind-swap' || gameState.turnPhase === 'power-look-swap') {
      if (isMyTurn) {
        setSelectedMyCard(cardIndex);
        return;
      }
    }

    // Burn attempt - tap card then discard
    if (!burnTarget && gameState.discardPile.length > 0) {
      setBurnTarget({ playerId: myPlayerId, index: cardIndex });
      // Auto-cancel after 2 seconds if discard not tapped
      setTimeout(() => setBurnTarget(null), 2000);
    }
  };

  // Handle opponent card press
  const handleOpponentCardPress = (playerId: string, cardIndex: number) => {
    // Peek opponent power
    if (gameState.turnPhase === 'power-peek-other' && isMyTurn) {
      onPeek(playerId, cardIndex);
      return;
    }

    // Blind swap - select opponent's card
    if (gameState.turnPhase === 'power-blind-swap' || gameState.turnPhase === 'power-look-swap') {
      if (isMyTurn && selectedMyCard !== null) {
        onBlindSwap(selectedMyCard, playerId, cardIndex);
        setSelectedMyCard(null);
        return;
      }
    }

    // Burn attempt
    if (!burnTarget && gameState.discardPile.length > 0) {
      setBurnTarget({ playerId, index: cardIndex });
      setTimeout(() => setBurnTarget(null), 2000);
    }
  };

  // Handle discard pile tap (for burns)
  const handleDiscardPress = () => {
    // If burn in progress, complete it
    if (burnTarget) {
      onBurn(burnTarget.playerId, burnTarget.index);
      setBurnTarget(null);
      return;
    }

    // Normal take from discard
    if (isMyTurn && gameState.turnPhase === 'draw') {
      onTakeFromDiscard();
    }
  };

  // Handle draw pile tap
  const handleDrawPress = () => {
    if (isMyTurn && gameState.turnPhase === 'draw') {
      onDrawFromPile();
    }
  };

  // Get instruction text
  const getInstructionText = (): string => {
    if (gameState.phase === 'peek') {
      return `Memorize your bottom 2 cards! ${peekTimeRemaining}s`;
    }

    if (!isMyTurn) {
      return `${currentPlayer.name}'s turn`;
    }

    switch (gameState.turnPhase) {
      case 'draw':
        return 'Draw a card or take from discard';
      case 'decide':
        return 'Swap, discard, or use power';
      case 'swap-select':
        return 'Tap a card to swap';
      case 'power-peek-self':
        return 'Tap one of your cards to peek';
      case 'power-peek-other':
        return "Tap an opponent's card to peek";
      case 'power-blind-swap':
        return selectedMyCard !== null
          ? "Now tap opponent's card to swap"
          : 'Tap your card first, then opponent\'s';
      case 'power-look-swap':
        return selectedMyCard !== null
          ? "Tap opponent's card to swap"
          : 'Tap your card first';
      default:
        return '';
    }
  };

  // Check if power card
  const drawnCardPower = gameState.drawnCard
    ? getPowerType(gameState.drawnCard.card)
    : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.roundText}>
          Round {gameState.roundNumber} of {gameState.settings.totalRounds}
        </Text>
        {gameState.cambioCallerId && (
          <View style={styles.cambioBadge}>
            <Text style={styles.cambioText}>CAMBIO!</Text>
          </View>
        )}
      </View>

      {/* Opponents area (top) */}
      <View style={styles.opponentsArea}>
        {opponents.map(opponent => {
          // Get known cards for this opponent (cards I've peeked)
          const opponentIndex = gameState.players.findIndex(p => p.id === opponent.id);
          const knownCards = opponent.hand
            .map((slot, idx) => ({ slot, idx }))
            .filter(({ slot }) => slot.card && slot.revealedTo?.includes(myPlayerId))
            .map(({ slot, idx }) => ({ index: idx, card: slot.card! }));

          return (
            <OpponentHand
              key={opponent.id}
              playerName={opponent.name}
              cardCount={opponent.hand.filter(s => s.card).length}
              penaltyCount={opponent.penaltyCards.length}
              isCurrentPlayer={gameState.players[gameState.currentPlayerIndex]?.id === opponent.id}
              knownCards={knownCards}
              onCardPress={(idx) => handleOpponentCardPress(opponent.id, idx)}
            />
          );
        })}
      </View>

      {/* Center area - Decks */}
      <View style={styles.centerArea}>
        <DrawPile
          cardCount={gameState.drawPile.length}
          onPress={handleDrawPress}
          highlighted={isMyTurn && gameState.turnPhase === 'draw'}
          disabled={!isMyTurn || gameState.turnPhase !== 'draw'}
        />

        <View style={styles.deckSpacer} />

        <DiscardPile
          topCard={gameState.discardPile[gameState.discardPile.length - 1] || null}
          cardCount={gameState.discardPile.length}
          onPress={handleDiscardPress}
          highlighted={burnTarget !== null}
          disabled={!isMyTurn && !burnTarget}
        />
      </View>

      {/* Drawn card overlay */}
      {gameState.drawnCard && isMyTurn && gameState.turnPhase === 'decide' && (
        <View style={styles.drawnCardOverlay}>
          <DrawnCardDisplay
            card={gameState.drawnCard.card}
            source={gameState.drawnCard.source}
            onDiscard={() => onDiscard(false)}
            onDiscardWithPower={() => onDiscard(true)}
            hasPower={!!drawnCardPower}
            powerDescription={getPowerDescription(gameState.drawnCard.card) || undefined}
          />
        </View>
      )}

      {/* Must swap indicator */}
      {gameState.drawnCard && isMyTurn && gameState.turnPhase === 'swap-select' && (
        <View style={styles.swapIndicator}>
          <Card card={gameState.drawnCard.card} faceUp={true} />
          <Text style={styles.swapText}>Tap a card in your hand to swap</Text>
        </View>
      )}

      {/* Instruction bar */}
      <View style={styles.instructionBar}>
        <Text style={styles.instructionText}>{getInstructionText()}</Text>

        {/* Burn target indicator */}
        {burnTarget && (
          <Text style={styles.burnText}>Tap discard to burn!</Text>
        )}
      </View>

      {/* My hand (bottom) */}
      <View style={styles.myHandArea}>
        <PlayerHand
          cards={myPlayer?.hand || []}
          penaltyCards={myPlayer?.penaltyCards || []}
          playerName={myPlayer?.name || 'You'}
          isCurrentPlayer={isMyTurn}
          isMyHand={true}
          onCardPress={handleMyCardPress}
          selectedIndex={selectedMyCard}
          peekingIndex={
            gameState.peekingPlayerId === myPlayerId
              ? gameState.peekingCardIndex
              : null
          }
          showCards={gameState.phase === 'peek' || gameState.phase === 'round-end'}
        />
      </View>

      {/* Cambio button */}
      {isMyTurn && gameState.turnPhase === 'draw' && !gameState.cambioCallerId && (
        <TouchableOpacity style={styles.cambioButton} onPress={onCallCambio}>
          <Text style={styles.cambioButtonText}>Call Cambio</Text>
        </TouchableOpacity>
      )}

      {/* Last burn result */}
      {gameState.lastBurnResult && (
        <View style={[
          styles.burnResult,
          gameState.lastBurnResult.success ? styles.burnSuccess : styles.burnFail
        ]}>
          <Text style={styles.burnResultText}>
            {gameState.lastBurnResult.message}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#166534',  // Casino green
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  roundText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cambioBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  cambioText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  opponentsArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 100,
  },
  centerArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    flex: 1,
  },
  deckSpacer: {
    width: 60,
  },
  drawnCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  swapIndicator: {
    position: 'absolute',
    top: '30%',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
    borderRadius: 12,
  },
  swapText: {
    color: '#FCD34D',
    fontSize: 14,
    marginTop: 12,
  },
  instructionBar: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  instructionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  burnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  myHandArea: {
    paddingBottom: 20,
  },
  cambioButton: {
    position: 'absolute',
    bottom: 180,
    right: 20,
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cambioButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  burnResult: {
    position: 'absolute',
    bottom: 240,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  burnSuccess: {
    backgroundColor: '#059669',
  },
  burnFail: {
    backgroundColor: '#DC2626',
  },
  burnResultText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default GameScreen;
