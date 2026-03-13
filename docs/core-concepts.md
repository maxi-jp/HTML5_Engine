# Core Concepts

## The Game Class

The `Game` class (`engine/game.js`) is the central hub of your game. It owns the game loop (`Start`, `Update` and `Draw` methods), the `gameObjects` array, the collision system, and all asset references. Your game is a single class that extends `Game`.

### Skeleton

```javascript
class MyGame extends Game {
    constructor(renderer) {
        super(renderer);

        // 1. Configure the canvas and engine features
        this.Configure({
            screenWidth: 640,
            screenHeight: 480,
            imageSmoothingEnabled: false,
            drawColliders: false,
        });

        // 2. Declare graphic assets — loaded automatically before Start() is called
        this.graphicAssets = {
            player:     { path: "assets/player.png", img: null },
            background: { path: "assets/bg.png",     img: null },
        };

        // 3. Declare audio assets
        this.audioAssets = {
            jump: { path: "assets/jump.m4a", audio: null },
        };

        // 4. Game flags and Game Object references
        this.score = 0;
        this.player = null;
    }

    Start() {
        super.Start(); // applies config, sets screen size, clears gameObjects/colliders

        // Assets are fully loaded here — safe to use this.graphicAssets.*.img
        this.player = new Player(
            new Vector2(this.screenHalfWidth, this.screenHalfHeight),
            this.graphicAssets.player.img
        );
        this.gameObjects.push(this.player);
    }

    Update(deltaTime) {
        super.Update(deltaTime); // updates all active game objects + runs collision detection

        // Game-level logic: score, state machine, spawning...
    }

    Draw() {
        super.Draw(); // draws all active game objects

        // HUD drawn on top
        this.renderer.DrawText(`Score: ${this.score}`, 8, 8, "16px Arial", Color.red);
    }
}
```

> Always call `super.Start()`, `super.Update(deltaTime)`, and `super.Draw()` — the base implementations drive the entire game object and collision pipeline.

### Asset loading

`graphicAssets` and `audioAssets` are plain objects declared in the constructor. `main.js` reads both, loads every entry, and only calls `Start()` once all assets are resolved.

```javascript
this.graphicAssets = {
    player:  { path: "assets/player.png",  img: null },
    tileset: { path: "assets/tileset.png", img: null },
};

this.audioAssets = {
    bgm:      { path: "assets/music.m4a",  audio: null },
    sfx_jump: { path: "assets/jump.wav",   audio: null },
};
```

After loading, `img` / `audio` are populated and accessible anywhere as `this.graphicAssets.player.img`.

### Config reference

Set `this.config` in the constructor. `super.Start()` reads it to configure the renderer.

| Property | Type | Default | Description |
|---|---|---|---|
| `screenWidth` | `number` | `640` | Initial canvas / game resolution width |
| `screenHeight` | `number` | `480` | Initial canvas / game resolution height |
| `imageSmoothingEnabled` | `boolean` | `true` | Canvas image smoothing |
| `fillWindow` | `boolean` | `false` | Stretch canvas to fill the browser window |
| `matchNativeResolution` | `boolean` | `false` | When `fillWindow=true`: update internal resolution to match window size (vs. stretching) |
| `preserveAspectRatio` | `boolean` | `true` | When `fillWindow=true` and `matchNativeResolution=false`, maintain aspect ratio |
| `useDevicePixelRatio` | `boolean` | `false` | Multiply resolution by `devicePixelRatio` for crisp high-DPI rendering |
| `audioAnalyzer` | `boolean` | `false` | Create a Web Audio analyser node when loading audio assets |
| `analyzerFftSize` | `number` | `128` | FFT size for the audio analyser |
| `analyzerSmoothing` | `number` | `0.5` | Smoothing time constant for the audio analyser |
| `drawColliders` | `boolean` | `false` | Draw collision shapes on top of game visuals every frame (debug aid) |
| `collidersOnly` | `boolean` | `false` | Skip all game object rendering and draw **only** collision shapes — useful for pure hitbox debugging |

Call `this.Configure(partialConfig)` in your Game's constructor to merge new values into an already-running config.

For example, to setup a 1280 x 720 resolution game canvas presented in full screen, you can setup some of these flags like this (and then ask the player to press `F11`):

```javascript
// 1280 x 720 resolution filling the browser window
this.Configure({
    screenWidth: 1280,            // game resolution width
    screenHeight: 720,            // game resolution height
    fillWindow: true,             // make canvas fill entire window
    preserveAspectRatio: true,    // keep aspect ratio when scaling
    matchNativeResolution: false, // use window size as resolution
    useDevicePixelRatio: false    // handle high-DPI displays
});
```

### Key properties

Some properties that the base `Game` class provides and can be used in your game:

| Property | Description |
|---|---|
| `this.screenWidth` / `this.screenHeight` | Current canvas dimensions — always prefer these over `canvas.width` / `canvas.height` |
| `this.screenHalfWidth` / `this.screenHalfHeight` | Convenience shortcuts for centering objects |
| `this.gameObjects` | Array of all `GameObject` instances; iterated by the base `Update` and `Draw` |
| `this.renderer` | The active `Renderer` (Canvas 2D or WebGL) |
| `this.audioActive` | Global mute flag — check before calling `audioPlayer.Play*()` |

### Key methods

Some methods that the base `Game` class provides and can be used in your game:

| Method | Description |
|---|---|
| `Destroy(gameObject)` | Removes a game object from `gameObjects`, fires its `Destroy()` hook, and cleans up its collider |
| `AddCollider(collider)` | Registers a collider with the collision detection system |
| `RemoveCollider(collider)` | Unregisters a collider and cleans up any pending collision pairs |
| `SetScreenSize(width, height)` | Resize the canvas at runtime |
| `SetFillWindow(matchNative, useDevicePixelRatio, preserveAspectRatio)` | Enable fill-window mode at runtime |
| `Configure(partialConfig)` | Merge new values into `this.config` |
| `WindowResized()` | Override to react to window resize events (called by the renderer automatically) |

## GameObjects

The `GameObject` class (`engine/gameobjects.js`) is the base class for every interactive entity. Push instances into `this.gameObjects` and the engine will call their lifecycle methods automatically.

### Lifecycle methods

Override these in your subclass to inject logic:

| Method | When it is called |
|---|---|
| `Start()` | Once, just before the first frame — same time as `Game.Start()` |
| `Update(deltaTime)` | Every frame while `active === true`; `deltaTime` is seconds since last frame |
| `Draw(renderer)` | Every frame while `active === true`, after all `Update` calls |
| `OnCollisionEnter(myCollider, otherCollider)` | First frame two registered colliders overlap |
| `OnCollisionExit(myCollider, otherCollider)` | First frame two previously overlapping colliders separate |
| `OnClick()` | When the mouse is clicked inside the object's registered collider |

> Always call `super.Update(deltaTime)` when overriding `Update` — the base implementation ticks the attached collider.

### Properties

| Property | Description |
|---|---|
| `active` | `boolean` — when `false` the object is skipped by `Update` and `Draw` |
| `position` | `Vector2` — world position |
| `x` / `y` | Shorthand for `position.x` / `position.y` |
| `rotation` | Rotation in radians |
| `scale` | `Vector2` or uniform `number` |
| `pivot` | `{x, y}` offset from `position` used as the rotation/scale origin |
| `collider` | Attached `Collider` instance (or `undefined` if none) |

### Built-in subclasses

| Class | Constructor highlights | Use for |
|---|---|---|
| `RectangleGO` | `(position, width, height, color, stroke, lineWidth)` | Solid or outlined rectangles |
| `CircleGO` | `(position, radius, color, stroke, lineWidth)` | Solid or outlined circles |
| `SpriteObject` | `(position, rotation, scale, img, alpha)` | Single image with `flipX` / `flipY` support |
| `SSAnimationObjectBasic` | `(position, rotation, scale, img, frameWidth, frameHeight, frameCount[], framesDuration)` | Regular grid sprite-sheet (all frames same size) |
| `SSAnimationObjectComplex` | `(position, rotation, scale, img, animationsRectangles[][], framesDurations[])` | Packed-atlas sprite-sheet (arbitrary frame rects per animation) |
| `Tileset` | `(img, position, scale, tilesetConfig, tilesetMap, tileWidth, tileHeight)` | Tile-map rendering |

### Minimal example

```javascript
class RotatingBox extends RectangleGO {
    constructor(position) {
        super(position, 100, 100, Color.blue);
        this.rotationSpeed = 1; // radians per second
    }

    Update(deltaTime) {
        super.Update(deltaTime);
        this.rotation += this.rotationSpeed * deltaTime;
    }
    // Draw is handled by RectangleGO — no override needed
}
```

For step-by-step examples covering sprites, keyboard input, and sprite-sheet animations, see [Getting Started → Create GameObjects](getting-started.md#_5-create-gameobjects).

## Rendering

The `Renderer` class (from `engine/renderer.js`) provides methods for drawing shapes, sprites, and text. It is accessed via `this.renderer` inside your `Game` class.

```javascript
// In your Game's Draw method
this.renderer.DrawFillRectangle(x, y, width, height, Color.red);
this.renderer.DrawSprite(mySpriteImage, x, y, width, height);
this.renderer.DrawText("Hello World", x, y, "20px Arial", Color.white);
```

## Screen and Coordinate System

The engine uses a consistent coordinate system that works across all display modes:

- **Always use `this.screenWidth` and `this.screenHeight`** instead of `canvas.width` / `canvas.height`
- **Mouse coordinates** via `Input.mouse.x` and `Input.mouse.y` are automatically normalised
- **Fullscreen modes** preserve aspect ratios and coordinate consistency

```javascript
// ✅ Correct — works with all display modes
const centerX = this.screenWidth / 2;
const centerY = this.screenHeight / 2;

// ❌ Incorrect — breaks with fullscreen modes
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
```
