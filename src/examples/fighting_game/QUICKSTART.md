# Quick Start Guide - Fighting Game

## Initial Setup

### 1. Download Assets

The game requires sprite sheets from the original repository. Choose one of these methods:

#### Method A: Automatic (Bash/Git)
```bash
cd src/examples/fighting_game
bash setup-assets.sh
```

#### Method B: Manual Download
1. Visit https://github.com/chriscourses/fighting-game
2. Click "Code" → "Download ZIP"
3. Extract the ZIP file
4. Copy the `img/` folder contents to `src/examples/fighting_game/assets/`

Resulting structure should be:
```
src/examples/fighting_game/assets/
├── background.png
├── shop.png
├── samuraiMack/
│   ├── Idle.png
│   ├── Run.png
│   ├── Jump.png
│   ├── Fall.png
│   ├── Attack1.png
│   ├── Take Hit - white silhouette.png
│   └── Death.png
└── kenji/
    ├── Idle.png
    ├── Run.png
    ├── Jump.png
    ├── Fall.png
    ├── Attack1.png
    ├── Take hit.png
    └── Death.png
```

### 2. Run the Game

Open `fighting-game.html` in a web browser. The game will:
- Load all assets
- Initialize both fighters
- Start the 60-second timer
- Be ready to play!

## Gameplay

### Controls

**Player 1 (Samurai Mack - Left Side)**
- **A** - Move Left
- **D** - Move Right  
- **W** - Jump
- **Space** - Attack

**Player 2 (Kenji - Right Side)**
- **← Arrow** - Move Left
- **→ Arrow** - Move Right
- **↑ Arrow** - Jump
- **↓ Arrow** - Attack

### Winning

- Each player starts with 100 health
- Landing an attack deals 20 damage
- Win by:
  - Reducing opponent to 0 health, OR
  - Having more health when the 60-second timer ends
- Winner is displayed on screen

## Architecture Overview

### Core Components

1. **Fighter Class**
   - Extends `GameObject`
   - Handles physics (gravity, movement)
   - Manages 7 animation states
   - Tracks attack boxes and collision

2. **FightingGame Class**
   - Extends `Game` (spark.js base)
   - Orchestrates two fighters
   - Processes input
   - Detects collisions
   - Updates UI elements

### Animation System

Each fighter has 7 animation states:
- `idle` - Standing still
- `run` - Moving horizontally
- `jump` - Rising in air
- `fall` - Falling to ground
- `attack1` - Attack motion
- `takeHit` - Being hit reaction
- `death` - Defeat sequence

Animations are **non-interruptible** based on priority:
- Death animation cannot be cancelled
- Attack animation locks until completion
- Take Hit animation prevents other movement

### Collision Detection

- **Attack boxes**: Defined per fighter with offset and dimensions
- **Hit detection**: Checked when attack animation reaches specific frame
  - Player 1: Frame 4
  - Player 2: Frame 2
- **Ground collision**: Fighters collide with bottom of screen (minus offset)

## Troubleshooting

### Assets Not Loading
- Check browser console (F12) for error messages
- Verify file paths in `src/examples/fighting_game/assets/` match the structure above
- Verify sprite sheet filenames match exactly (case-sensitive!)

### Characters Not Appearing
- Wait a moment for assets to load (there's no loading screen)
- Check console for image loading errors
- Verify image paths don't have typos

### Game Doesn't Respond to Input
- Click in the game window to ensure it has focus
- Check that key presses are registered in console
- Try reloading the page

## Code Organization

```
fighting-game.html               # Entry point
src/examples/fighting_game/
├── fighting_game.js            # Main game code
├── README.md                   # Detailed documentation
├── setup-assets.sh             # Asset download script
└── assets/                     # Game sprites (to be downloaded)
```

## Future Enhancements

Potential features to add:
- Sound effects and music
- Particle effects for attacks
- Combo system
- Additional characters
- Backgrounds with parallax
- Special moves/abilities
- Replay system
- Online multiplayer
- Mobile touch controls
