# Fighting Game - spark.js Port

A 1v1 2D fighting game ported from [chriscourses/fighting-game](https://github.com/chriscourses/fighting-game) to the spark.js engine.

## Features

- **Two-player combat**: Samurai Mack vs Kenji
- **Multiple animations**: Idle, Run, Jump, Fall, Attack, Take Hit, Death
- **Collision detection**: Attack boxes and hit detection
- **Health system**: 100 HP per fighter, 20 damage per hit
- **Timed match**: 60-second match timer
- **Win conditions**: Whoever has more health when timer ends or when someone reaches 0 HP

## Controls

### Player 1 (Samurai Mack)
- **A** / **D** - Move left/right
- **W** - Jump
- **Space** - Attack

### Player 2 (Kenji)
- **Arrow Left** / **Arrow Right** - Move left/right
- **Arrow Up** - Jump
- **Arrow Down** - Attack

## Project Structure

```
fighting_game/
├── fighting_game.js          # Main game logic and Fighter class
├── assets/                   # Game assets (downloaded separately)
│   ├── background.png
│   ├── shop.png
│   ├── samuraiMack/
│   │   ├── Idle.png
│   │   ├── Run.png
│   │   ├── Jump.png
│   │   ├── Fall.png
│   │   ├── Attack1.png
│   │   ├── Take Hit - white silhouette.png
│   │   └── Death.png
│   └── kenji/
│       ├── Idle.png
│       ├── Run.png
│       ├── Jump.png
│       ├── Fall.png
│       ├── Attack1.png
│       ├── Take hit.png
│       └── Death.png
└── README.md                 # This file
```

## Setting Up Assets

1. Clone the original repository:
   ```bash
   git clone https://github.com/chriscourses/fighting-game.git
   ```

2. Copy the `img/` folder to `src/examples/fighting_game/assets/`:
   ```bash
   cp -r fighting-game/img/* src/examples/fighting_game/assets/
   ```

3. Or manually download the sprite sheets and place them in the directory structure shown above

## How to Run

1. Open `fighting-game.html` in a web browser
2. The game will load all assets and start
3. Press any key to start playing

## Implementation Details

### Fighter Class
The `Fighter` class extends `GameObject` and manages:
- **Animation system**: Uses separate `SSAnimationObjectBasic` instances for each animation state
- **Animation switching**: Changes which animation object is currently active/drawn
- Sprite loading and frame management
- Health and damage
- Attack box positioning
- Physics (gravity, velocity, collision with ground)
- Body collider for hit detection

### Game Loop
The `FightingGame` class handles:
- Player input processing via Input API
- Movement and animation selection
- Collision detection between attack boxes and fighters
- Health updates and UI refresh
- Timer countdown using `game.Invoke()`
- Win/lose determination

### Animation System
- **Each animation state** (idle, run, jump, fall, attack, takeHit, death) has its own `SSAnimationObjectBasic` instance
- **Each PNG** is a single-row sprite sheet (e.g., Idle.png has 8 frames in one row)
- **Frame configuration**: `frameCount = [numFrames]` with `actualAnimation = 0` (always row 0)
- **Frame duration**: 5 frames at 60fps (~0.083s per frame)
- **Animation switching**: The active animation object is switched based on fighter state
- **Priority system**: Death > Attack > TakeHit (higher priority animations cannot be interrupted)

### Combat System
- Attack boxes are rectangular collision areas offset from the fighter's position
- Collision is checked when the attack animation reaches frame 4 (for Player 1) or frame 2 (for Player 2)
- Body colliders (`RectangleCollider`) are 50×150px and registered with the engine's collision system
- On hit: defender takes 20 damage, plays "take hit" animation
- At 0 HP: fighter plays death animation and becomes inactive

## Engine Classes Used

This port demonstrates proper usage of spark.js engine features:

### Animation System
- **`SSAnimationObjectBasic`** - Used for all fighter animations
  - Each animation state (idle, run, jump, fall, attack, takeHit, death) has its own instance
  - Each PNG sprite sheet is a single-row grid: `frameCount = [numFrames]` with `actualAnimation = 0`
  - Fighter switches which object is active/drawn based on state
  - Frame duration: 5 frames at 60fps (~0.083s per frame)

### Input System
- **`Input.RegisterAction()`** - Registers 8 keyboard actions:
  - `P1_MoveLeft` (A), `P1_MoveRight` (D), `P1_Jump` (W), `P1_Attack` (Space)
  - `P2_MoveLeft` (ArrowLeft), `P2_MoveRight` (ArrowRight), `P2_Jump` (ArrowUp), `P2_Attack` (Enter)
- **`Input.GetAction()`** - Checks if action is currently held (for movement)
- **`Input.GetActionDown()`** - Checks if action was just pressed (for jumps/attacks)

### Collision System
- **`RectangleCollider`** - Each fighter has a 50×150px body collider for hit detection
- Registered with engine's collision system via `game.AddCollider()`
- Attack boxes use custom AABB collision checks

### Background System
- **`SpriteBackgroundLayer`** - Static background image
- **`SpriteBackgroundLayer`** - Shop decoration overlay

### Timer System
- **`game.Invoke(callback, delay)`** - Implements the 60-second match countdown
  - Recursive timer calls itself every 1.0 second
  - Auto-stops when match ends or time runs out

## Porting Notes

Key differences from the original implementation:
- Uses `SSAnimationObjectBasic` for each animation state instead of custom frame management
- Uses spark.js's **Input API** (`Input.RegisterAction`/`GetAction`/`GetActionDown`) instead of `addEventListener`
- Uses **engine Timer API** (`game.Invoke`) instead of `setTimeout` for match countdown
- Uses engine's `RectangleCollider` for body collision detection
- Uses `SpriteBackgroundLayer` for background rendering
- Fighter extends `GameObject` instead of custom Sprite class
- UI updates through DOM element manipulation (health bars, timer, game over display)

## Future Enhancements

Potential improvements:
- Add sound effects
- Add particle effects for hits
- Add combo system
- Add more characters
- Add backgrounds parallax effect
- Add special moves/abilities
- Multiplayer online support
- Mobile touch controls
