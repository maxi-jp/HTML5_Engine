# Fighting Game - Engine-Native Implementation

## Overview

This document explains how the fighting game was refactored to use spark.js engine classes instead of custom implementations.

## Animation System Refactoring

### Original Implementation (Custom)
The original code used a custom animation system with:
- Manual frame tracking (`framesCurrent`, `framesElapsed`, `frameHold`)
- Custom `updateAnimation()` method that incremented frames manually
- Custom `switchAnimation()` that swapped sprite images
- Direct image section rendering in `Draw()`

### New Implementation (SSAnimationObjectBasic)
The refactored code leverages the engine's animation system:

```javascript
// Each animation state has its own SSAnimationObjectBasic instance
this.animationObjects = {
  idle: new SSAnimationObjectBasic(...),
  run: new SSAnimationObjectBasic(...),
  jump: new SSAnimationObjectBasic(...),
  fall: new SSAnimationObjectBasic(...),
  attack1: new SSAnimationObjectBasic(...),
  takeHit: new SSAnimationObjectBasic(...),
  death: new SSAnimationObjectBasic(...)
};

// Switch animations by changing which object is active
this.currentAnimationName = 'idle';

// Engine handles frame updates automatically
this.animationObjects[this.currentAnimationName].Update(deltaTime);

// Engine handles rendering
this.animationObjects[this.currentAnimationName].Draw(renderer);
```

### Why SSAnimationObjectBasic?

The sprite assets are organized as **separate PNG files per animation**:
- `Idle.png` - 8 frames in a horizontal strip
- `Run.png` - 8 frames in a horizontal strip
- `Attack1.png` - 6 frames (Mack) / 4 frames (Kenji)
- etc.

Each PNG is a **single-row sprite sheet**, which perfectly matches `SSAnimationObjectBasic`'s grid-based animation system:
- `frameCount = [numFrames]` - Single animation (row 0) with N frames
- `actualAnimation = 0` - Always use row 0 since each PNG has only one row
- `frameDuration = 0.083s` - 5 frames at 60fps

### Animation Priority System

Animations respect a priority hierarchy:
1. **Death** - Cannot be interrupted once started
2. **Attack** - Cannot be interrupted until complete
3. **TakeHit** - Cannot be interrupted until complete
4. **Movement/Idle** - Can be interrupted at any time

This is handled in `switchAnimation()`:
```javascript
switchAnimation(animName) {
  // Death cannot be interrupted
  if (this.currentAnimationName === 'death') return;
  
  // Attack cannot be interrupted until frame completes
  if (this.currentAnimationName === 'attack1') {
    const anim = this.animationObjects['attack1'];
    if (anim && anim.actualFrame < anim.frameCount[0] - 1) return;
  }
  
  // Switch and reset
  this.currentAnimationName = animName;
  const newAnim = this.animationObjects[animName];
  if (newAnim) {
    newAnim.PlayAnimationLoop(0, true); // Row 0, reset to frame 0
  }
}
```

## Combat System Integration

### Hit Detection Timing
The engine's animation frame tracking (`actualFrame`) is used for precise hit detection:

```javascript
// Player hits on attack frame 4
if (this.player.getCurrentFrame() === 4 && this.player.isAttacking) {
  this.enemy.takeHit();
}

// Enemy hits on attack frame 2
if (this.enemy.getCurrentFrame() === 2 && this.enemy.isAttacking) {
  this.player.takeHit();
}
```

### Attack Box vs Body Collider
- **Attack boxes**: Custom AABB collision (not registered with engine)
  - Positioned relative to fighter using offsets
  - Only active during attack animation
  
- **Body colliders**: Engine `RectCollider` (50×150px)
  - Registered with `game.AddCollider()`
  - Used for hit detection target
  - Automatically updated each frame

## Benefits of Engine Integration

### 1. Automatic Frame Management
- No manual frame counting or elapsed time tracking
- Engine handles frame timing based on `deltaTime`
- Consistent animation playback across different frame rates

### 2. Built-in Animation Looping
- `PlayAnimationLoop(animId, reset)` handles looping automatically
- No need for custom loop-back logic

### 3. Proper Delta Time Support
- Animations run at correct speed regardless of FPS
- Original game was locked to 60 FPS logic

### 4. Cleaner Code
- Reduced from ~80 lines of custom animation code to ~40 lines
- Animation logic encapsulated in engine class
- Easier to add new animations (just create new `SSAnimationObjectBasic` instance)

### 5. Consistent with Other Engine Examples
- Uses same patterns as other spark.js examples
- Easier for developers familiar with the engine

## Asset Organization

```
fighting_game/assets/
├── background.png              # Static background image
├── shop.png                    # Shop decoration overlay
├── samuraiMack/
│   ├── Idle.png               # 8 frames × 1 row
│   ├── Run.png                # 8 frames × 1 row
│   ├── Jump.png               # 2 frames × 1 row
│   ├── Fall.png               # 2 frames × 1 row
│   ├── Attack1.png            # 6 frames × 1 row
│   ├── Take Hit.png           # 4 frames × 1 row
│   └── Death.png              # 6 frames × 1 row
└── kenji/
    ├── Idle.png               # 4 frames × 1 row
    ├── Run.png                # 8 frames × 1 row
    ├── Jump.png               # 2 frames × 1 row
    ├── Fall.png               # 2 frames × 1 row
    ├── Attack1.png            # 4 frames × 1 row
    ├── Take hit.png           # 3 frames × 1 row
    └── Death.png              # 7 frames × 1 row
```

## Code Comparison

### Before (Custom Animation)
```javascript
class Fighter extends SpriteObject {
  constructor(position, config) {
    super(position, 0, config.scale, null);
    this.frameHold = 5;
    this.framesElapsed = 0;
    this.framesCurrent = 0;
    this.framesMax = 1;
    this.animations = {};
    this.loadAnimationSprites(config.sprites);
  }
  
  updateAnimation() {
    this.framesElapsed++;
    if (this.framesElapsed % this.frameHold === 0) {
      if (this.framesCurrent < this.framesMax - 1) {
        this.framesCurrent++;
      } else {
        this.framesCurrent = 0;
      }
    }
  }
  
  Draw(renderer) {
    const anim = this.animations[this.currentAnimationName];
    const frameWidth = anim.image.width / anim.framesMax;
    renderer.DrawImageSection(
      anim.image, this.position.x, this.position.y,
      this.framesCurrent * frameWidth, 0, frameWidth, frameHeight,
      this.scale, this.scale
    );
  }
}
```

### After (SSAnimationObjectBasic)
```javascript
class Fighter extends GameObject {
  constructor(position, config) {
    super(position);
    this.animationObjects = {};
    this.currentAnimationName = 'idle';
    this.loadAnimations(config.sprites);
  }
  
  loadAnimations(spritesConfig) {
    for (const [name, spriteData] of Object.entries(spritesConfig)) {
      const img = new Image();
      img.onload = () => {
        this.animationObjects[name] = new SSAnimationObjectBasic(
          this.position, 0, this.scale, img,
          frameW, frameH, [spriteData.framesMax], frameDuration
        );
      };
      img.src = spriteData.imageSrc;
    }
  }
  
  Update(deltaTime) {
    const anim = this.animationObjects[this.currentAnimationName];
    if (anim) anim.Update(deltaTime);
  }
  
  Draw(renderer) {
    const anim = this.animationObjects[this.currentAnimationName];
    if (anim) anim.Draw(renderer);
  }
}
```

## Testing Checklist

- [ ] Both fighters load and display correctly
- [ ] Idle animation loops smoothly
- [ ] Run animation plays when moving
- [ ] Jump/fall animations trigger during aerial movement
- [ ] Attack animation plays and cannot be interrupted
- [ ] Hit detection triggers on correct frame (4 for P1, 2 for P2)
- [ ] Take hit animation plays when damaged
- [ ] Death animation plays when health reaches 0
- [ ] Health bars update correctly
- [ ] 60-second timer counts down
- [ ] Winner is determined correctly
- [ ] Game over display shows correct message

## Future Improvements

1. **Consider SSAnimationObjectComplex** if you need:
   - Variable frame durations per animation
   - Different frame sizes per animation
   - More complex animation sequencing

2. **Particle Effects** using `ParticleEmitter`:
   - Hit sparks on successful attacks
   - Dust clouds when landing from jumps
   - Death explosion effects

3. **Audio Integration** using `AudioPlayer`:
   - Attack sounds on each hit
   - Jump/land sound effects
   - Background music
   - Victory/defeat fanfare

4. **Advanced Input** features:
   - Gamepad support via Input API
   - Touch controls for mobile using `VirtualJoystick`
   - Action combos (e.g., double-tap dash)

5. **Camera System**:
   - Use `FollowCamera` to zoom/pan based on fighter positions
   - Screen shake on heavy hits
