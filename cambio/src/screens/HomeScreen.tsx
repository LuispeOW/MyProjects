// Home Screen - Main menu with Host/Join options

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface HomeScreenProps {
  onHost: (playerName: string) => void;
  onJoin: (roomCode: string, playerName: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onHost, onJoin }) => {
  const [mode, setMode] = useState<'menu' | 'host' | 'join'>('menu');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleHost = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    onHost(playerName.trim());
  };

  const handleJoin = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (roomCode.length !== 4) {
      setError('Room code must be 4 characters');
      return;
    }
    onJoin(roomCode.toUpperCase(), playerName.trim());
  };

  // Main menu
  if (mode === 'menu') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Logo/Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>CAMBIO</Text>
            <Text style={styles.subtitle}>A Memory Card Game</Text>
          </View>

          {/* Menu buttons */}
          <View style={styles.menuButtons}>
            <TouchableOpacity
              style={[styles.menuButton, styles.hostButton]}
              onPress={() => setMode('host')}
            >
              <Text style={styles.menuButtonText}>Host Game</Text>
              <Text style={styles.menuButtonSubtext}>Create a new game room</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuButton, styles.joinButton]}
              onPress={() => setMode('join')}
            >
              <Text style={styles.menuButtonText}>Join Game</Text>
              <Text style={styles.menuButtonSubtext}>Enter a room code</Text>
            </TouchableOpacity>
          </View>

          {/* Info text */}
          <Text style={styles.infoText}>
            2-8 players • Same WiFi network required
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Host form
  if (mode === 'host') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => setMode('menu')}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.formTitle}>Host a Game</Text>

          <View style={styles.form}>
            <Text style={styles.inputLabel}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={playerName}
              onChangeText={(text) => {
                setPlayerName(text);
                setError(null);
              }}
              placeholder="Enter your name"
              placeholderTextColor="#6B7280"
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={20}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity style={styles.submitButton} onPress={handleHost}>
              <Text style={styles.submitButtonText}>Create Game</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.helpText}>
            You'll get a room code to share with friends
          </Text>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Join form
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => setMode('menu')}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.formTitle}>Join a Game</Text>

        <View style={styles.form}>
          <Text style={styles.inputLabel}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={playerName}
            onChangeText={(text) => {
              setPlayerName(text);
              setError(null);
            }}
            placeholder="Enter your name"
            placeholderTextColor="#6B7280"
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={20}
          />

          <Text style={styles.inputLabel}>Room Code</Text>
          <TextInput
            style={[styles.input, styles.roomCodeInput]}
            value={roomCode}
            onChangeText={(text) => {
              setRoomCode(text.toUpperCase().replace(/[^A-Z0-9]/g, ''));
              setError(null);
            }}
            placeholder="ABCD"
            placeholderTextColor="#6B7280"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={4}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity style={styles.submitButton} onPress={handleJoin}>
            <Text style={styles.submitButtonText}>Join Game</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.helpText}>
          Ask the host for the 4-letter room code
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FCD34D',
    letterSpacing: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
  },
  menuButtons: {
    width: '100%',
    maxWidth: 320,
    gap: 16,
  },
  menuButton: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  hostButton: {
    backgroundColor: '#059669',
  },
  joinButton: {
    backgroundColor: '#3B82F6',
  },
  menuButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuButtonSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 4,
  },
  infoText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 40,
  },
  // Form styles
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 8,
  },
  backButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 32,
  },
  form: {
    width: '100%',
    maxWidth: 320,
  },
  inputLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    color: '#FFF',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  roomCodeInput: {
    fontSize: 28,
    letterSpacing: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#FCD34D',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 24,
    textAlign: 'center',
  },
});

export default HomeScreen;
