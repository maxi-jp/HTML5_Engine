# spark.js — AI Agent Reference

## Critical architecture note
The engine is **plain global JavaScript — no ES modules, no bundler, no TypeScript**.
Scripts are loaded via `<script>` tags in each HTML file in a fixed order.
**Every engine symbol is a global variable.** There are no imports or exports.

---

## Script load order (dependency chain)
Each example HTML file must load engine scripts in this order before any game code:

1. `src/engine/utils_math.js` — math constants and free functions
2. `src/engine/utils_classes.js` — core value types (Vector2, Color, Rect, ObjectPool, …)
3. `src/engine/renderer.js` — Renderer base + Canvas2DRenderer + WebGLRenderer
4. `src/engine/gameobjects.js` — GameObject, RectangleGO, CircleGO, SpriteObject, SSAnimationObjectBasic, SSAnimationObjectComplex, Tileset, Camera, FollowCamera, FollowCameraBasic, Pool, BackgroundLayer (+ subclasses), BackgroundLayers
5. `src/engine/input.js` — Input namespace, KEY_* / gamepad constants, actions/axes/rumble API
6. `src/engine/audioplayer.js` — AudioPlayer class
7. `src/engine/particlesystem.js` — ParticleEmitter, ParticleSystem
8. `src/engine/htmlmenu.js` — HTMLMenu overlay/layer system
9. `src/engine/virtualcontrols.js` — VirtualJoystick, VirtualDPad
10. `src/engine/game.js` — Game base class
11. `src/lib/Box2D.js` + `src/engine/box2d_helper.js` + `src/engine/box2d_game.js` + `src/engine/box2d_gameobjects.js` *(optional — only for physics games; load `Box2D.js` first)*
12. `src/engine/main.js` — engine bootstrap (LoadImages, StartGame)

---

## Key globals (set by main.js at startup)
| Variable | Type | Description |
|---|---|---|
| `game` | `Game` | The active Game instance |
| `renderer` | `Renderer` | The active Renderer instance |
| `audioPlayer` | `AudioPlayer` | Global audio manager |
| `totalTime` | `number` | Elapsed seconds since game start |
| `mobileWithTouchScreen` | `boolean` | True on touch-primary devices |

---

## Class hierarchy
```
Game
└── Box2DGame

GameObject
├── RectangleGO
├── CircleGO
└── SpriteObject
    ├── SSAnimationObjectBasic
    └── SSAnimationObjectComplex

Renderer
├── Canvas2DRenderer
└── WebGLRenderer

Collider
├── CircleCollider
└── RectCollider

Box2DGameObject (extends GameObject)
├── Box2DRectangleGO
├── Box2DSpriteObject
├── Box2DSSAnimationObjectBasic
├── Box2DSSAnimationObjectComplex
└── Box2DTrigger
```

---

## Project layout
```
src/engine/          ← engine source (14 files)
src/examples/        ← example game implementations
  <name>/            ← one folder per example; each may have its own assets/
src/lib/             ← third-party libs (Box2D)
docs/                ← Docsify documentation site
*.html (root)        ← entry point for each example
index.html           ← landing page / gallery
```

---

## Making a minimal game
```javascript
class MyGame extends Game {
  constructor(renderer) {
    super(renderer);
    this.Configure({ screenWidth: 800, screenHeight: 600 });
    this.graphicAssets = { ship: { path: 'assets/ship.png', img: null } };
  }
  Start()            { this.ship = new SpriteObject(new Vector2(400,300), 0, 1, this.graphicAssets.ship.img); }
  Update(deltaTime)  { this.ship.Update(deltaTime); }
  Draw()             { this.ship.Draw(this.renderer); }
}
// In the last game script (or inline in the HTML):
window.onload = () => { Init(MyGame); }
```

---

## Input API quick-reference (Input namespace)
| Usage | Call |
|---|---|
| Key held | `Input.IsKeyDown(KEY_SPACE)` |
| Key just pressed | `Input.IsKeyPressed(KEY_SPACE)` |
| Mouse button | `Input.IsMouseButtonDown(0)` |
| Gamepad raw | `Input.GetGamepad(0)` |
| Register action | `Input.RegisterAction('Fire', [{type:'key', keyCode:KEY_SPACE}])` |
| Action held | `Input.IsActionDown('Fire')` |
| Action just pressed | `Input.IsActionPressed('Fire')` |
| Register axis | `Input.RegisterAxis('MoveX', [{type:'key', keyCode:KEY_LEFT, value:-1}, …])` |
| Read axis | `Input.GetAxis('MoveX')` — returns –1..1 |
| Any input | `Input.Anything()` — true if any device triggered anything |
| Any gamepad face btn | `Input.IsAnyGamepadFaceButtonDown()` |
| Rumble preset | `Input.RegisterRumble('hit', {duration:200, strongMagnitude:0.6})` → `Input.PlayRumble('hit', 0)` |
| Virtual joystick | `Input.RegisterVirtualJoystick('move', x, y, radius)` → `Input.GetAxis('move_x')` |

---

## Assets and collider patterns

### Loading images and audio
Declare assets as object literals in the constructor; the engine loads them before `Start()` is called:
```javascript
this.graphicAssets = { ship: { path: 'assets/ship.png', img: null } };
this.audioAssets   = { shoot: { path: 'assets/shoot.wav' } };
// Access after load:
// this.graphicAssets.ship.img  →  HTMLImageElement
// game.audioPlayer.PlayAudio('shoot')
```

### Non-physics collisions
Colliders are registered with the game and checked every frame via the callback pattern:
```javascript
// In Start():
this.collider = new CircleCollider(Vector2.Zero(), radius, this);
game.AddCollider(this.collider);

// In the game object class:
OnCollisionEnter(myCollider, otherCollider) {
    const other = otherCollider.go; // the other game object
}
```
Remove with `game.RemoveCollider(this.collider)` or `game.RemoveGameObject(this)` (auto-removes its collider).

---

## Minimal HTML template
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>My Game</title>
    <link rel="stylesheet" href="css/style.css">
    <script src="src/engine/utils_math.js"></script>
    <script src="src/engine/utils_classes.js"></script>
    <script src="src/engine/renderer.js"></script>
    <script src="src/engine/gameobjects.js"></script>
    <script src="src/engine/input.js"></script>
    <script src="src/engine/audioplayer.js"></script>
    <script src="src/engine/particlesystem.js"></script>
    <script src="src/engine/htmlmenu.js"></script>
    <script src="src/engine/virtualcontrols.js"></script>
    <script src="src/engine/game.js"></script>
    <!-- Box2D physics (optional):
    <script src="src/lib/Box2D.js"></script>
    <script src="src/engine/box2d_helper.js"></script>
    <script src="src/engine/box2d_game.js"></script>
    <script src="src/engine/box2d_gameobjects.js"></script>
    -->
    <script src="src/engine/main.js"></script>
    <!-- Game scripts: -->
    <script src="src/examples/mygame/mygame.js"></script>
</head>
<body>
    <div id="canvasContainer">
        <canvas id="canvas"></canvas>
    </div>
</body>
</html>
```

---

## Conventions
- **Color channels are 0–1**, not 0–255. Use `Color.FromRGB(r,g,b)` for 0-255 inputs.
- **`deltaTime` is seconds.** Multiply all speeds/velocities by `deltaTime` for frame-rate independence.
- **Object pooling** via `ObjectPool` is the standard pattern for bullets, particles, and other frequently created/destroyed objects.
- Engine files use `// #region` / `// #endregion` for code folding.
- Physics games extend `Box2DGame` instead of `Game`; all Box2D bodies use `physicsScale` (pixels per meter).
- HTML menus and overlays use `HTMLMenu`; they live in the DOM above the canvas, not on the canvas.
