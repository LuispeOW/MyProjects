// Lobby Screen - Waiting room before game starts

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Share,
} from 'react-native';
import { Player, GameSettings } from '../game/types';

interface LobbyScreenProps {
  roomCode: string;
  players: Player[];
  isHost: boolean;
  settings: GameSettings;
  onUpdateSettings: (totalRounds: 5 | 10 | 15) => void;
  onStartGame: () => void;
  onLeave: () => void;
  onAddSimulatedPlayer?: () => void;  // For testing
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  roomCode,
  players,
  isHost,
  settings,
  onUpdateSettings,
  onStartGame,
  onLeave,
  onAddSimulatedPlayer,
}) => {
  const canStart = players.length >= 2;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my Cambio game!\n\nRoom Code: ${roomCode}\n\nOpen the Cambio app and enter this code to join.`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.leaveButton} onPress={onLeave}>
          <Text style={styles.leaveButtonText}>Leave</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Game Lobby</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Room Code Display */}
        <View style={styles.roomCodeContainer}>
          <Text style={styles.roomCodeLabel}>Room Code</Text>
          <Text style={styles.roomCode}>{roomCode}</Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>Share Code</Text>
          </TouchableOpacity>
        </View>

        {/* Players List */}
        <View style={styles.playersContainer}>
          <Text style={styles.sectionTitle}>
            Players ({players.length}/8)
          </Text>

          {players.map((player, index) => (
            <View key={player.id} style={styles.playerRow}>
              <View style={styles.playerInfo}>
                <Text style={styles.playerNumber}>{index + 1}</Text>
                <Text style={styles.playerName}>{player.name}</Text>
                {player.isHost && (
                  <View style={styles.hostBadge}>
                    <Text style={styles.hostBadgeText}>HOST</Text>
                  </View>
                )}
              </View>
              <View style={[
                styles.statusDot,
                player.isConnected ? styles.connectedDot : styles.disconnectedDot
              ]} />
            </View>
          ))}

          {/* Empty slots */}
          {Array.from({ length: 8 - players.length }).map((_, index) => (
            <View key={`empty-${index}`} style={[styles.playerRow, styles.emptySlot]}>
              <Text style={styles.emptySlotText}>Waiting for player...</Text>
            </View>
          ))}
        </View>

        {/* Test: Add simulated player */}
        {isHost && onAddSimulatedPlayer && (
          <TouchableOpacity
            style={styles.addBotButton}
            onPress={onAddSimulatedPlayer}
          >
            <Text style={styles.addBotButtonText}>+ Add Test Player</Text>
          </TouchableOpacity>
        )}

        {/* Game Settings (Host only) */}
        {isHost && (
          <View style={styles.settingsContainer}>
            <Text style={styles.sectionTitle}>Game Settings</Text>

            <Text style={styles.settingLabel}>Number of Rounds</Text>
            <View style={styles.roundsButtons}>
              {([5, 10, 15] as const).map((rounds) => (
                <TouchableOpacity
                  key={rounds}
                  style={[
                    styles.roundButton,
                    settings.totalRounds === rounds && styles.roundButtonActive,
                  ]}
                  onPress={() => onUpdateSettings(rounds)}
                >
                  <Text
                    style={[
                      styles.roundButtonText,
                      settings.totalRounds === rounds && styles.roundButtonTextActive,
                    ]}
                  >
                    {rounds}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Non-host view of settings */}
        {!isHost && (
          <View style={styles.settingsContainer}>
            <Text style={styles.sectionTitle}>Game Settings</Text>
            <Text style={styles.settingValue}>{settings.totalRounds} Rounds</Text>
            <Text style={styles.waitingText}>Waiting for host to start...</Text>
          </View>
        )}
      </ScrollView>

      {/* Start Button (Host only) */}
      {isHost && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.startButton, !canStart && styles.startButtonDisabled]}
            onPress={onStartGame}
            disabled={!canStart}
          >
            <Text style={styles.startButtonText}>
              {canStart ? 'Start Game' : `Need ${2 - players.length} more player(s)`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  leaveButton: {
    padding: 8,
  },
  leaveButtonText: {
    color: '#EF4444',
    fontSize: 16,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  // Room code
  roomCodeContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  roomCodeLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  roomCode: {
    color: '#FCD34D',
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 12,
  },
  shareButton: {
    marginTop: 16,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  shareButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Players
  playersContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerNumber: {
    color: '#6B7280',
    fontSize: 14,
    width: 24,
  },
  playerName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  hostBadge: {
    backgroundColor: '#FCD34D',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  hostBadgeText: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  connectedDot: {
    backgroundColor: '#10B981',
  },
  disconnectedDot: {
    backgroundColor: '#EF4444',
  },
  emptySlot: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: 'transparent',
  },
  emptySlotText: {
    color: '#6B7280',
    fontSize: 14,
    fontStyle: 'italic',
  },
  addBotButton: {
    alignItems: 'center',
    padding: 12,
    marginBottom: 24,
  },
  addBotButtonText: {
    color: '#3B82F6',
    fontSize: 14,
  },
  // Settings
  settingsContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
  },
  settingLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 12,
  },
  roundsButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roundButton: {
    flex: 1,
    backgroundColor: '#334155',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  roundButtonActive: {
    backgroundColor: '#FCD34D',
  },
  roundButtonText: {
    color: '#9CA3AF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  roundButtonTextActive: {
    color: '#0F172A',
  },
  settingValue: {
    color: '#FCD34D',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
  },
  waitingText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  // Footer
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  startButton: {
    backgroundColor: '#059669',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#334155',
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LobbyScreen;
