# Cambio - Installation Guide

## Quick Setup

### 1. Copy Source Files to Your Expo Project

Copy the entire `src/` folder to your Expo project:

```
C:\Users\luisp\Documents\CambioGame\
├── src/                          ← Copy this folder
│   ├── components/
│   ├── game/
│   ├── hooks/
│   ├── networking/
│   └── screens/
├── App.tsx                       ← Your existing file
└── package.json
```

### 2. Update Your App.tsx

Replace your `App.tsx` content with:

```typescript
import App from './src/App';
export default App;
```

Or copy the contents of `src/App.tsx` into your main `App.tsx`.

### 3. Install Dependencies

In your Expo project directory:

```bash
cd C:\Users\luisp\Documents\CambioGame
npx expo install expo-network
```

### 4. Run the App

```bash
npx expo start
```

Scan the QR code with Expo Go on your phone.

---

## Testing in Expo Go (Single Device)

Since Expo Go can't run a TCP server, use "Test Players" for development:

1. Open app → Host Game → Enter your name
2. In the lobby, tap "**+ Add Test Player**" to add AI/simulated players
3. Add 1-7 test players
4. Tap "Start Game"

The test players won't take turns automatically - you control the game flow for testing the UI and mechanics.

---

## Full Multiplayer (Development Build)

For real local network multiplayer:

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### Step 2: Add Development Dependencies
```bash
npx expo install expo-dev-client
npm install react-native-tcp-socket
```

### Step 3: Create Development Build
```bash
eas build --platform android --profile development
```

This takes ~15 minutes. Download and install the APK when ready.

### Step 4: Run with Dev Build
```bash
npx expo start --dev-client
```

---

## File Structure

```
src/
├── App.tsx                    # Main entry, navigation logic
│
├── components/
│   ├── Card.tsx               # Playing card component
│   ├── PlayerHand.tsx         # 4-card hand layout
│   └── Deck.tsx               # Draw/Discard piles
│
├── screens/
│   ├── HomeScreen.tsx         # Main menu (Host/Join)
│   ├── LobbyScreen.tsx        # Waiting room
│   ├── GameScreen.tsx         # Main gameplay
│   └── ScoreScreen.tsx        # End of round/game
│
├── game/
│   ├── types.ts               # TypeScript types
│   ├── constants.ts           # Card values, rules
│   ├── deck.ts                # Deck operations
│   └── gameState.ts           # Game logic reducer
│
└── networking/
    ├── NetworkContext.tsx     # React context for multiplayer
    ├── protocol.ts            # Message serialization
    └── roomCode.ts            # Room code generation
```

---

## Troubleshooting

### "Cannot find module './src/App'"
- Make sure the `src/` folder is in your project root
- Check that the import path is correct

### "undefined is not an object (evaluating 'card.suit')"
- Some game state may be null during initialization
- The code has guards, but check for null/undefined in your modifications

### Cards not showing
- Check that the Card component receives valid card objects
- Verify the faceUp prop is set correctly

### Touch not responsive
- React Native's TouchableOpacity should be fast enough
- For the burning mechanic, we use immediate onPressIn handlers

---

## Next Steps

1. **Test the UI** - Host a game, add test players, play through
2. **Customize styles** - Modify colors in StyleSheet objects
3. **Add animations** - Use Animated API for card movements
4. **Build for production** - Create release builds for App Store

Need help? Check the game rules in `PROJECT_ARCHITECTURE.md` or ask for assistance!
