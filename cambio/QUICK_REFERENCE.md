# Cambio - Quick Reference Cheatsheet

## Installation Commands (Run in Order)

```bash
# 1. Check prerequisites
node --version    # Should show v20+
java -version     # Should show 17.x
echo %ANDROID_HOME%  # Should show SDK path

# 2. Create project
npx react-native@latest init Cambio
cd Cambio

# 3. Run app (need 2 terminals)
# Terminal 1:
npm start

# Terminal 2:
npm run android
```

## Project Folder Structure

```
Cambio/
├── src/
│   ├── components/    # UI pieces (Card, PlayerHand, Deck)
│   ├── screens/       # Full screens (Game, Setup, Scores)
│   ├── game/          # Pure logic (no React)
│   ├── state/         # GameContext, reducer
│   ├── hooks/         # useGame, useBurning
│   └── assets/        # Images, sounds
├── App.tsx            # Entry point
└── package.json       # Dependencies
```

## Card Values

| Card | Points |
|------|--------|
| Red King (♥♦) | -1 |
| Joker | 0 |
| Ace | 1 |
| 2-10 | Face value |
| Jack | 11 |
| Queen | 12 |
| Black King (♣♠) | 13 |

## Special Powers (Draw pile → Discard immediately)

| Card | Power |
|------|-------|
| 7, 8 | Peek one of YOUR cards |
| 9, 10 | Peek one OPPONENT's card |
| J, Q | Blind swap (any card ↔ any opponent's card) |
| Black K | Look at opponent's card, MUST swap |

## Game Phases

```
waiting → peek → drawing → deciding → [power-active] → waiting
                              ↓
                          swapping
```

## Burning Rules

**Burn your own card:**
1. Tap YOUR card with matching rank
2. Tap discard pile
3. Your card goes to discard (you have fewer cards)

**Burn opponent's card:**
1. Tap OPPONENT's card (you know it matches)
2. Tap discard pile
3. If correct: Their card discards, give them one of yours
4. If wrong: Draw penalty card

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Start Metro bundler |
| `npm run android` | Build & run on Android |
| `npm install PACKAGE` | Add dependency |
| `adb devices` | Check connected devices |
| `adb reverse tcp:8081 tcp:8081` | Fix connection issues |

## Touch Event Handlers

```typescript
// Basic touch
<TouchableOpacity onPress={() => handleTap()}>

// Press in/out (for burn timing)
<TouchableOpacity
  onPressIn={() => startBurnTimer()}
  onPressOut={() => cancelBurn()}
>

// Long press
<TouchableOpacity
  onLongPress={() => showCardPreview()}
  delayLongPress={500}
>
```

## State Management Pattern

```typescript
// Action
dispatch({ type: 'DRAW_FROM_PILE' });

// Reducer
case 'DRAW_FROM_PILE':
  return { ...state, drawnCard: state.drawPile[0] };

// Access state
const { state, dispatch } = useGame();
```

## Debugging

```bash
# Open React Native debugger
# In emulator, press: Ctrl+M (or shake device)
# Select "Debug"

# View logs
npx react-native log-android

# Clear cache
cd android && ./gradlew clean && cd ..
npm start --reset-cache
```

## Files to Create First

1. `src/game/types.ts` - TypeScript interfaces
2. `src/game/constants.ts` - Card values, rules
3. `src/game/deck.ts` - Deck creation, shuffle
4. `src/components/Card/Card.tsx` - Card component
5. `src/components/PlayerHand/PlayerHand.tsx` - Hand layout
6. `src/components/Deck/DrawPile.tsx` - Draw pile
7. `src/components/Deck/DiscardPile.tsx` - Discard pile
8. Update `App.tsx` - Wire everything together

## Next Steps After Setup

1. ✅ Environment setup (SETUP_GUIDE.md)
2. → Create folder structure
3. → Copy starter code from PROJECT_ARCHITECTURE.md
4. → Run and verify basic UI
5. → Implement draw/swap mechanics
6. → Add turn rotation
7. → Implement burning
8. → Add special powers
