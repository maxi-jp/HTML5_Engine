# Getting Started

Follow these steps to set up your first game with HTML5_Engine.

## 1. Get the engine scripts

Clone or download the HTML5_Engine repository from [GitHub](https://github.com/maxi-jp/HTML5_Engine).

## 2. Set up your project folder

Create a new folder for your game. Inside it, create an `engine` folder and copy the contents of the `engine` directory from this repository into it. Your game's own JavaScript files can go in a `js` or `src` folder.

Your project structure might look like this:

```
my-game/
├── engine/
│   ├── renderer.js
│   ├── main.js
│   ├── game.js
│   └── ... (all other engine files from engine/)
├── src/
│   └── my-game.js
├── lib/
│   └── Box2D.js  (if using physics)
└── index.html
```

## 3. Create your `index.html`

Include the engine scripts in your `index.html`. The order of script inclusion is important:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Awesome Game</title>
    <script src="engine/renderer.js"></script>
    <script src="engine/main.js"></script>
    <script src="engine/utils_math.js"></script>
    <script src="engine/input.js"></script>
    <script src="engine/audioplayer.js"></script>
    <script src="engine/game.js"></script>
    <script src="engine/utils_classes.js"></script>
    <script src="engine/gameobjects.js"></script>
    <!-- add this to use particle systems -->
    <script src="engine/particlesystem.js"></script>
    <!-- add these only if you want to use box2d physics -->
    <script src="lib/Box2D.js"></script>
    <script src="engine/box2d_helper.js"></script>
    <script src="engine/box2d_game.js"></script>
    <script src="engine/box2d_gameobjects.js"></script>
    <!-- add here your game scripts -->
    <script src="src/my-game.js"></script>
</head>
<body>
    <canvas width="640" height="480" id="myCanvas"></canvas>
</body>
</html>
```

## 4. Create your Game class

Create a new JavaScript file (e.g., `src/my-game.js`) with a class that inherits from `Game`:

```javascript
class MyGame extends Game {
    constructor(renderer) {
        super(renderer);

        this.Configure({
            screenWidth: 640,
            screenHeight: 480
        });
    }

    Start() {
        super.Start();

        // initialize some Game Objects here
    }

    Update(deltaTime) {
        super.Update(deltaTime);
        // your update logic here
    }

    Draw() {
        this.renderer.DrawFillBasicRectangle(0, 0, this.screenWidth, this.screenHeight, Color.black);
        super.Draw();
        // your draw logic here
    }
}

window.onload = () => {
    Init(MyGame); // Init is a global function defined in main.js
}
```

## 5. Create GameObjects

GameObjects are the building blocks of your game — players, enemies, bullets, walls, pickups, etc. Every entity you want to update or draw should be a class that extends `GameObject` (or one of its built-in subclasses) and gets added to `this.gameObjects`.

### Built-in subclasses

| Class | Description |
|-------|-------------|
| `RectangleGO` | A solid or outlined rectangle |
| `CircleGO` | A solid or outlined circle |
| `SpriteObject` | A rendered image with position, rotation, and scale |
| `SSAnimationObjectBasic` | Sprite-sheet animation where every frame is the same size, laid out in a regular grid |
| `SSAnimationObjectComplex` | Sprite-sheet animation where each frame can have a different source rectangle — ideal for packed texture atlases |

### Example: a rotating coloured box

The simplest possible custom object — extends `RectangleGO` and rotates every frame:

```javascript
class RotatingBox extends RectangleGO {
    constructor(position) {
        // position, width, height, color
        super(position, 100, 100, Color.blue);
        this.rotationSpeed = 1; // radians per second
    }

    Update(deltaTime) {
        this.rotation += this.rotationSpeed * deltaTime;
    }

    // Draw is handled by RectangleGO — no need to override it
}
```

Add it to your game in `Start()`:

```javascript
Start() {
    super.Start();

    // create a new RotatingBox Game Object and add it to the gameObjects array
    this.gameObjects.push(new RotatingBox(new Vector2(320, 240)));
}
```

### Example: a player that moves with keyboard input

A slightly more complete object reading from the input system and bouncing off the screen edges:

```javascript
class Player extends RectangleGO {
    constructor(position) {
        super(position, 40, 40, Color.FromRGB(50, 200, 100));
        this.speed = 200; // pixels per second
    }

    Update(deltaTime) {
        // Read raw key input
        if (Input.IsKeyPressed(KEY_LEFT) || Input.IsKeyPressed(KEY_A))
            this.x -= this.speed * deltaTime;
        if (Input.IsKeyPressed(KEY_RIGHT) || Input.IsKeyPressed(KEY_D))
            this.x += this.speed * deltaTime;
        if (Input.IsKeyPressed(KEY_UP) || Input.IsKeyPressed(KEY_W))
            this.y -= this.speed * deltaTime;
        if (Input.IsKeyPressed(KEY_DOWN) || Input.IsKeyPressed(KEY_S))
            this.y += this.speed * deltaTime;

        // Clamp to screen bounds
        this.x = Math.max(this.width  / 2, Math.min(game.screenWidth  - this.width  / 2, this.x));
        this.y = Math.max(this.height / 2, Math.min(game.screenHeight - this.height / 2, this.y));
    }

    // Draw is handled by RectangleGO — no need to override it
}
```

### Example: a sprite-based object

When you want to draw an image instead of a shape, extend `SpriteObject`:

```javascript
class Enemy extends SpriteObject {
    constructor(position, img) {
        // position, rotation, scale, img
        super(position, 0, 1, img);
        this.speed = 80;
    }

    Update(deltaTime) {
        // Move downward
        this.y += this.speed * deltaTime;

        // Deactivate when off-screen
        if (this.y > game.screenHeight + 50)
            this.active = false;
    }

    // Draw is handled by SpriteObject — no need to override it
}
```

Pass the loaded image when you create the object:

```javascript
// in your Game class ...

Start() {
    super.Start();
    // this.graphicAssets.enemy.img must be loaded before Start is called
    // (normally this is done in the constructor of the Game class)
    // Create a new Enemy Game Object and add it to the gameObjects array
    this.gameObjects.push(new Enemy(new Vector2(320, -50), this.graphicAssets.enemy.img));
}
```

### Example: regular sprite-sheet animation (`SSAnimationObjectBasic`)

Use `SSAnimationObjectBasic` when every frame in your sprite sheet is the **same size** and the animations are laid out in a **regular grid** (rows = animations, columns = frames). This is the simplest and most common sprite-sheet format.

This is exactly how the player character is implemented in the [Flappy Derp example](https://maxi-jp.github.io/HTML5_Engine/floppyderp.html) — two 10-frame animations (flying and dying) on a 24 × 24 grid:

![Floppy Derp player sprite sheet](https://maxi-jp.github.io/HTML5_Engine/src/examples/floppyderp/assets/player_sprites.png)

*Sprite sheet: 10 columns × 2 rows, each cell 24 × 24 px. Row 0 = flying animation, row 1 = death animation.*

```javascript
class FloppyDerpPlayer extends SSAnimationObjectBasic {
    constructor(position, img) {
        // position, rotation, scale, img, frameWidth, frameHeight,
        // frameCount (array — one entry per animation row),
        // framesDuration (seconds per frame)
        super(position, 0, 1, img, 24, 24, [10, 10], 0.03);

        this.animationSpeedFlying = 0.03; // fast flap
        this.animationSpeedDying  = 0.15; // slow death sequence

        this.state = 0; // 0 = falling, 1 = jumping, 2 = dying
    }

    Update(deltaTime) {
        super.Update(deltaTime); // advances the current animation automatically

        if (this.state !== 2 && Input.IsMouseDown()) {
            this.Jump();
        }

        // ... movement logic ...
    }

    Jump() {
        this.state = 1;
        this.PlayAnimationLoop(0);             // row 0 — flying animation
        this.framesDuration = this.animationSpeedFlying;
    }

    Die() {
        this.state = 2;
        this.PlayAnimationLoop(1);             // row 1 — death animation
        this.framesDuration = this.animationSpeedDying;
    }
}
```

Key points:
- The `frameCount` parameter is an **array** — one entry per animation row. `[10, 10]` means two animations, each with 10 frames.
- Frames are read left-to-right on each row; row 0 is animation 0, row 1 is animation 1, etc.
- Call `PlayAnimationLoop(animationId)` to switch between rows.
- `framesDuration` can be changed at any time to speed up or slow down the current animation.

> Live demo: [Floppy Derp](https://maxi-jp.github.io/HTML5_Engine/floppyderp.html)

---

### Example: complex sprite-sheet animation (`SSAnimationObjectComplex`)

Use `SSAnimationObjectComplex` when your sprite sheet is a **packed atlas** where frames are not all the same size or are not arranged in a regular grid. You describe every animation as an array of `Rect` objects (`{x, y, w, h}` in the source image), and each animation can have its own frame duration.

This is exactly how the `Pacman` character is implemented in the Pacmon example:

```javascript
class Pacman extends SSAnimationObjectComplex {
    constructor(img, startPosition) {
        // animationsRectangles: one array per animation, each entry is a Rect in the atlas
        const animationsRectangles = [
            // animation 0 – mouth opening/closing (3 frames)
            [
                new Rect(454, 0, 16, 16),  // frame 0 – fully open
                new Rect(470, 0, 16, 16),  // frame 1 – half open
                new Rect(486, 0, 16, 16),  // frame 2 – closed
            ],
            // animation 1 – death sequence (add as many frames as needed)
            [
                new Rect(454, 16, 16, 16),
                new Rect(470, 16, 16, 16),
            ]
        ];

        // framesDurations: one duration value (in seconds) per animation
        const framesDurations = [0.1, 0.12];

        // position, rotation, scale, img, animationsRectangles array, framesDurations array
        super(startPosition, 0, 1, img, animationsRectangles, framesDurations);
    }

    Update(deltaTime) {
        super.Update(deltaTime); // advances the current animation automatically

        // Switch animation based on game state
        if (this.isDying) {
            this.PlayAnimationLoop(1); // switch to death animation
        }
        else {
            this.PlayAnimationLoop(0, false); // play walk/chomp animation
            // the false flag indicates that the animation is not reseted each time
            // this function is called
        }
    }
}
```

Key points:
- `animationsRectangles` is an **array of arrays** — the outer index is the animation ID, the inner array lists each frame's source `Rect`.
- `framesDurations` is a flat array with one duration (seconds per frame) for each animation.
- Call `PlayAnimationLoop(animationId)` to switch the active animation at any time. Pass `false` as the second argument to *not* reset to frame 0 when re-selecting the same animation.
- `flipX` / `flipY` and `rotation` work the same as on any other `SpriteObject`, so you can mirror the sprite to face different directions without needing extra frames.

### Important tips

- Add objects to `this.gameObjects` in `Start()` — the base `Game.Update` and `Game.Draw` will call `Update`/`Draw` on every active entry automatically.
- Set `this.active = false` on an object to stop it being updated and drawn (useful for pooling or death states).
- Override `OnCollisionEnter(myCollider, otherCollider)` on a `GameObject` to react to collider intersections (see [Utilities](utilities.md) for the collider API).

See the full examples in `src/examples/` — [BrokeOut](../brokeout.html ':target=_blank'), [Snake](../snake.html ':target=_blank'), and [Floppy Derp](../floppyderp.html ':target=_blank') are good starting points.

---

## 7. Fullscreen and Display Configuration *(optional)*

The engine supports flexible display options including fullscreen modes with aspect ratio preservation:

```javascript
class MyGame extends Game {
    constructor(renderer) {
        super(renderer);

        this.Configure({
            fillWindow: true,              // Make canvas fill entire window
            preserveAspectRatio: true,     // Keep aspect ratio when scaling
            matchNativeResolution: false,  // Use window size as resolution
            useDevicePixelRatio: false     // Handle high-DPI displays
        });
    }
}
```

> **Important:** Always use `this.screenWidth` and `this.screenHeight` instead of `canvas.width` and `canvas.height` for proper fullscreen compatibility.

💡 See the [Canvas Resizing Demo](../canvas-resize.html ':target=_blank') for an interactive example of all display options.

