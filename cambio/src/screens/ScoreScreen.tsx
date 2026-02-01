// Score Screen - Shows scores at end of round or game

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Player, GamePhase } from '../game/types';

interface ScoreScreenProps {
  players: Player[];
  roundNumber: number;
  totalRounds: number;
  phase: GamePhase;  // 'round-end' or 'game-end'
  onNextRound: () => void;
  onNewGame: () => void;
}

export const ScoreScreen: React.FC<ScoreScreenProps> = ({
  players,
  roundNumber,
  totalRounds,
  phase,
  onNextRound,
  onNewGame,
}) => {
  // Sort players by total score (ascending - lowest is best)
  const sortedPlayers = [...players].sort((a, b) => a.totalScore - b.totalScore);
  const isGameEnd = phase === 'game-end';
  const winner = sortedPlayers[0];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {isGameEnd ? 'Game Over!' : `Round ${roundNumber} Complete`}
          </Text>
          {!isGameEnd && (
            <Text style={styles.subtitle}>
              {totalRounds - roundNumber} round{totalRounds - roundNumber !== 1 ? 's' : ''} remaining
            </Text>
          )}
        </View>

        {/* Winner announcement (game end only) */}
        {isGameEnd && (
          <View style={styles.winnerBanner}>
            <Text style={styles.winnerEmoji}>🏆</Text>
            <Text style={styles.winnerText}>{winner.name} Wins!</Text>
            <Text style={styles.winnerScore}>{winner.totalScore} points</Text>
          </View>
        )}

        {/* Scoreboard */}
        <View style={styles.scoreboard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreHeaderText}>Player</Text>
            <Text style={styles.scoreHeaderText}>Round</Text>
            <Text style={styles.scoreHeaderText}>Total</Text>
          </View>

          {sortedPlayers.map((player, index) => (
            <View
              key={player.id}
              style={[
                styles.scoreRow,
                index === 0 && styles.firstPlace,
                index === 1 && styles.secondPlace,
                index === 2 && styles.thirdPlace,
              ]}
            >
              <View style={styles.playerCell}>
                <Text style={styles.rank}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                </Text>
                <Text style={styles.playerName}>{player.name}</Text>
              </View>
              <Text style={[
                styles.scoreValue,
                player.roundScore < 0 && styles.negativeScore,
              ]}>
                {player.roundScore > 0 ? '+' : ''}{player.roundScore}
              </Text>
              <Text style={styles.totalScore}>{player.totalScore}</Text>
            </View>
          ))}
        </View>

        {/* Card reveal (show what everyone had) */}
        <View style={styles.revealSection}>
          <Text style={styles.revealTitle}>Cards Revealed</Text>
          {players.map(player => (
            <View key={player.id} style={styles.revealRow}>
              <Text style={styles.revealPlayerName}>{player.name}:</Text>
              <View style={styles.revealCards}>
                {player.hand.map((slot, idx) => (
                  <Text key={idx} style={styles.revealCard}>
                    {slot.card ? `${slot.card.rank}${slot.card.suit ? slot.card.suit[0].toUpperCase() : '★'}` : '—'}
                  </Text>
                ))}
                {player.penaltyCards.map((card, idx) => (
                  <Text key={`p-${idx}`} style={[styles.revealCard, styles.penaltyCard]}>
                    {card.rank}{card.suit ? card.suit[0].toUpperCase() : '★'}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Action button */}
      <View style={styles.footer}>
        {isGameEnd ? (
          <TouchableOpacity style={styles.actionButton} onPress={onNewGame}>
            <Text style={styles.actionButtonText}>New Game</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.actionButton} onPress={onNextRound}>
            <Text style={styles.actionButtonText}>Next Round</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
  },
  // Winner banner
  winnerBanner: {
    backgroundColor: '#FCD34D',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  winnerEmoji: {
    fontSize: 48,
  },
  winnerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 8,
  },
  winnerScore: {
    fontSize: 18,
    color: '#374151',
    marginTop: 4,
  },
  // Scoreboard
  scoreboard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  scoreHeader: {
    flexDirection: 'row',
    backgroundColor: '#334155',
    padding: 12,
  },
  scoreHeaderText: {
    flex: 1,
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  firstPlace: {
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
  },
  secondPlace: {
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
  },
  thirdPlace: {
    backgroundColor: 'rgba(180, 83, 9, 0.1)',
  },
  playerCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: {
    fontSize: 16,
    marginRight: 8,
    width: 28,
    textAlign: 'center',
  },
  playerName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  scoreValue: {
    flex: 1,
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
  },
  negativeScore: {
    color: '#10B981',
  },
  totalScore: {
    flex: 1,
    color: '#FCD34D',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Card reveal
  revealSection: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
  },
  revealTitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 12,
  },
  revealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  revealPlayerName: {
    color: '#FFF',
    fontSize: 14,
    width: 80,
  },
  revealCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  revealCard: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
    color: '#FFF',
    fontSize: 12,
  },
  penaltyCard: {
    backgroundColor: '#991B1B',
  },
  // Footer
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  actionButton: {
    backgroundColor: '#059669',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ScoreScreen;
