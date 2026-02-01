# Cambio - Local Network Multiplayer Guide

## Important: Expo Go Limitations

**Expo Go cannot run a TCP/WebSocket server on a phone.** This is a fundamental limitation because Expo Go is a pre-built app that doesn't include native networking modules.

### Solution: Expo Development Build

We'll create a **development build** - your own custom version of the Expo app that includes the native modules we need. This is simpler than it sounds:

1. Still uses Expo's tooling (not "ejecting")
2. One-time setup per platform
3. Your actual code stays the same
4. Works on physical devices over WiFi

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      HOST DEVICE                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              TCP Server (Port 3000)                  │   │
│  │  - Manages authoritative game state                  │   │
│  │  - Broadcasts updates to all clients                 │   │
│  │  - Validates all player actions                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│              Local IP: 192.168.1.42                        │
│              Room Code: ABCD (derived from IP)             │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
     ┌──────────┐    ┌──────────┐    ┌──────────┐
     │ Client 1 │    │ Client 2 │    │ Client 3 │
     │ (TCP)    │    │ (TCP)    │    │ (TCP)    │
     └──────────┘    └──────────┘    └──────────┘
```

### Room Code System

Instead of typing IP addresses, we use a simple room code:
- Host's local IP `192.168.1.42` → Room Code `WXYZ`
- Clients enter `WXYZ` → Decodes back to IP → Connects

---

## Setup Instructions

### Step 1: Install EAS CLI

Open PowerShell/Command Prompt:

```bash
npm install -g eas-cli
```

### Step 2: Navigate to Your Project

```bash
cd C:\Users\luisp\Documents\CambioGame
```

### Step 3: Install Required Packages

```bash
npx expo install expo-network expo-dev-client
npm install react-native-tcp-socket
```

### Step 4: Create EAS Account (Free)

```bash
eas login
# If you don't have an account:
eas register
```

### Step 5: Configure EAS Build

```bash
eas build:configure
```

This creates an `eas.json` file. Update it to:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

### Step 6: Create app.json Config

Make sure your `app.json` includes:

```json
{
  "expo": {
    "name": "Cambio",
    "slug": "cambio",
    "version": "1.0.0",
    "plugins": [
      [
        "expo-dev-client"
      ]
    ],
    "android": {
      "package": "com.yourname.cambio"
    },
    "ios": {
      "bundleIdentifier": "com.yourname.cambio"
    }
  }
}
```

### Step 7: Build Development APK

For Android (builds in the cloud, ~10-15 minutes):

```bash
eas build --platform android --profile development
```

Once complete, download the APK and install on your phone.

### Step 8: Run Development Server

```bash
npx expo start --dev-client
```

Scan the QR code with your development build app (not Expo Go).

---

## Alternative: Quick Start with Expo Go

If you want to test the UI and game logic immediately while waiting for the development build, I'll provide code that:

1. Works in Expo Go for single-device testing
2. Has the networking layer ready to activate once you have the dev build

This lets you build and test the entire game UI now, then just "flip the switch" for multiplayer.

---

## File Structure

```
CambioGame/
├── src/
│   ├── networking/
│   │   ├── NetworkContext.tsx    # React context for network state
│   │   ├── tcpServer.ts          # Host server logic
│   │   ├── tcpClient.ts          # Client connection logic
│   │   ├── protocol.ts           # Message types and serialization
│   │   └── roomCode.ts           # IP ↔ room code conversion
│   │
│   ├── game/
│   │   ├── types.ts              # Game type definitions
│   │   ├── constants.ts          # Card values, rules
│   │   ├── deck.ts               # Deck operations
│   │   ├── gameState.ts          # Game state management
│   │   ├── actions.ts            # Game action handlers
│   │   └── validation.ts         # Action validation
│   │
│   ├── components/
│   │   ├── Card.tsx              # Card component
│   │   ├── PlayerHand.tsx        # Player's 4 cards
│   │   ├── OpponentHand.tsx      # Opponent cards (minimized view)
│   │   ├── DrawPile.tsx          # Draw pile
│   │   ├── DiscardPile.tsx       # Discard pile
│   │   ├── GameTable.tsx         # Main game layout
│   │   └── PlayerIndicator.tsx   # Current turn indicator
│   │
│   ├── screens/
│   │   ├── HomeScreen.tsx        # Main menu
│   │   ├── HostLobbyScreen.tsx   # Host waiting for players
│   │   ├── JoinScreen.tsx        # Enter room code
│   │   ├── GameScreen.tsx        # Main gameplay
│   │   └── ScoreScreen.tsx       # End of round scores
│   │
│   └── hooks/
│       ├── useNetwork.ts         # Network hook
│       ├── useGame.ts            # Game state hook
│       └── useBurning.ts         # Burning mechanic hook
│
├── App.tsx                       # Entry point with navigation
├── app.json                      # Expo config
└── package.json
```

---

## Next Steps

1. **Option A (Recommended):** Start the EAS build now, then build UI while it compiles
2. **Option B:** Build everything in Expo Go first, add networking later

Which would you prefer? I'll provide all the code either way.
