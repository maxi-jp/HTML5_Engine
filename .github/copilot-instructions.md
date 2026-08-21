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
11. `src/engine/tiled_loader.js` — TiledLoader *(optional — only if using Tiled maps)*
12. `src/lib/Box2D.js` + `src/engine/box2d_helper.js` + `src/engine/box2d_game.js` + `src/engine/box2d_gameobjects.js` *(optional — only for physics games; load `Box2D.js` first)*
13. `src/engine/main.js` — engine bootstrap (LoadImages, StartGame)

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
└── RectangleCollider

BackgroundLayer (and subclasses — see gameobjects.js)
├── StaticColorLayer
├── StaticGradientLayer
├── ColorRectangleLayer
├── GradientRectangleLayer
├── SpriteBackgroundLayer
├── MultispritesBackgroundLayer
├── TilesetBackgroundLayer
├── GameObjectBackgroundLayer
└── GameObjectsBackgroundLayer

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
| Register action | `Input.RegisterAction('Fire', [{type:'key', code:KEY_SPACE}])` |
| Action held | `Input.GetAction('Fire')` |
| Action just pressed | `Input.GetActionDown('Fire')` |
| Register axis | `Input.RegisterAxis('MoveX', [{type:'key', code:KEY_LEFT, value:-1}, …])` |
| Read axis | `Input.GetAxis('MoveX')` — returns –1..1 |
| Any input | `Input.Anything()` — true if any device triggered anything |
| Any gamepad face btn | `Input.IsAnyGamepadFaceButtonDown()` |
| Rumble preset | `Input.RegisterRumble('hit', 0.8, 0.4, 150)` → `Input.ExecuteRumble('hit', 0)` |
| Virtual joystick | `Input.RegisterVirtualJoystick('move', x, y, radius)` → `Input.GetAxis('move_x')` |

---

## Renderer API quick-reference
All methods are called on `renderer` (or `this.renderer` inside Game). Colors use 0–1 range (use `Color.FromRGB()` for 0-255).

### Text rendering
| Method | Usage |
|---|---|
| `DrawFillText(text, x, y, font, color?, align?, baseline?)` | Filled text. Font ex: `"16px Arial"`. Align: `"left"` / `"center"` / `"right"` |
| `DrawStrokeText(text, x, y, font, color?, align?, baseline?, lineWidth?)` | Outlined text |
| `DrawText(text, x, y, font, color?, align?, baseline?, stroke?, lineWidth?)` | Text with optional stroke |

### Rectangles (centered on x,y with rotation)
| Method | Notes |
|---|---|
| `DrawFillRectangle(x, y, w, h, color?, rot?, pivot?)` | Filled, supports rotation |
| `DrawStrokeRectangle(x, y, w, h, color?, lineWidth?, rot?, pivot?)` | Outlined, supports rotation |
| `DrawRectangle(x, y, w, h, color?, stroke?, lineWidth?, rot?, pivot?)` | Generic (fill or stroke) |

### Rectangles (top-left at x,y — faster, no rotation)
| Method | Notes |
|---|---|
| `DrawFillBasicRectangle(x, y, w, h, color?)` | **Fastest** — use for UI/backgrounds |
| `DrawStrokeBasicRectangle(x, y, w, h, color?, lineWidth?)` | Outlined, no rotation |
| `DrawBasicRectangle(x, y, w, h, color?, stroke?, lineWidth?)` | Generic (fill or stroke) |

### Circles
| Method | Notes |
|---|---|
| `DrawFillCircle(x, y, radius, color?)` | Filled circle |
| `DrawStrokeCircle(x, y, radius, color?, lineWidth?)` | Outlined circle |
| `DrawCircle(x, y, radius, color?, stroke?, lineWidth?)` | Generic (fill or stroke) |

### Images (centered on x,y with rotation)
| Method | Notes |
|---|---|
| `DrawImage(img, x, y, scaleX, scaleY, rot?, pivot?, alpha?)` | Full-featured image draw |
| `DrawImageSection(img, x, y, sx, sy, sw, sh, scaleX, scaleY, rot?, pivot?, alpha?)` | Sprite sheet / cropped region |

### Images (top-left at x,y — faster, no rotation)
| Method | Notes |
|---|---|
| `DrawImageBasic(img, x, y, w?, h?, alpha?)` | **Fastest** — use when no rotation needed |
| `DrawImageSectionBasic(img, x, y, sx, sy, sw, sh, scaleX, scaleY, alpha?)` | Sprite sheet, no rotation |

### Other
| Method | Notes |
|---|---|
| `DrawLine(x1, y1, x2, y2, color?, lineWidth?)` | Line segment |
| `DrawPolygon(points, strokeColor?, lineWidth?, fill?, fillColor?)` | Closed polygon. `points` is `{x,y}[]` |
| `DrawGradientRectangle(x, y, w, h, gradient)` | Gradient-filled rectangle |
| `ApplyCameraTransform(camera)` | Apply camera offset (call before drawing world objects) |
| `RestoreCameraTransform()` | Restore to screen space (call after world objects) |

---

## Timer API quick-reference
Timers run on game time (pause with game) and auto-cleanup when GameObjects are destroyed.  
**Callbacks are automatically bound to the owner** (Unity-style) — pass methods directly without `.bind(this)`.

| Usage | Call |
|---|---|
| One-shot delay | `game.Invoke(() => { ... }, 2.0)` |
| Repeating timer | `game.InvokeRepeating(() => { ... }, delay, interval)` |
| Cancel timer | `game.CancelInvoke(timer)` |
| From GameObject (arrow) | `this.Invoke(() => this.method(), 2.0)` — auto-cancelled on destroy |
| From GameObject (direct) | `this.Invoke(this.method, 2.0)` — auto-bound, no `.bind()` needed |
| From non-GameObject | `game.Invoke(this.method, 2.0, this)` — pass owner as 3rd param |
| Cancel all (GO) | `this.CancelAllInvokes()` |

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

**Enabling/disabling colliders:**
```javascript
// All colliders have an 'enabled' property (default true)
player.collider.enabled = false; // skip collision detection
game.Invoke(() => { player.collider.enabled = true; }, 3.0);

// Setting GameObject.active automatically toggles collider.enabled
enemy.active = false; // enemy.collider.enabled is now false too
```

---

## Tiled Map Editor Integration

The optional `TiledLoader` utility loads maps created in **[Tiled Map Editor](https://www.mapeditor.org/)** (v1.11+) and converts them to engine format.

### Requirements
- **Tile Layer Format**: Must be set to **CSV** in Map → Map Properties
- **Embed tilesets**: Must be **checked** when exporting JSON from Tiled
- Supported tileset formats: Grid-based and Collection of Images
- Maps are exported to JSON with embedded tilesets and tile data

### Basic usage
```javascript
Start() {
    super.Start();
    
    // Declare Tiled map assets (JSON files with embedded tilesets)
    this.tiledAssets = {
        forestMap: { path: "assets/forest/forest.json", data: null }
    };
}

// After assets load, parse and create tilesets:
const mapData = TiledLoader.Parse(this.tiledAssets.forestMap.data, this.graphicAssets);
const tilesets = TiledLoader.CreateTilesets(mapData, new Vector2(0, 0), 1);
tilesets.forEach(ts => this.gameObjects.push(ts));

// Create sprites from object layers:
const sprites = TiledLoader.CreateSpriteObjects(this.tiledAssets.forestMap.data, mapData, Vector2.Zero());
sprites.forEach(sprite => this.gameObjects.push(sprite));
```

### Key TiledLoader methods
| Method | Purpose |
|---|---|
| `Parse(tiledJSON, graphicAssets)` | Parse Tiled JSON and return map data with tileset config |
| `CreateTilesets(mapData, position, scale)` | Create Tileset GameObjects from parsed map |
| `GetObjectsByName(tiledJSON, name, layerName)` | Query objects by name |
| `GetObjectsByType(tiledJSON, type, layerName)` | Query objects by type |
| `CreateSpriteObjects(tiledJSON, mapData, position, scale, layerName)` | Create sprites from object layer |
| `CreateGameObjectsBackgroundLayer(tiledJSON, mapData, layerName, position, scale)` | Create parallax layer from objects |

### See also
- Complete working example: `src/examples/tileset/tileset.js` and `tileset.html`
- Full integration guide: `docs/tiled-integration.md`

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
    <!-- Tiled map loader (optional):
    <script src="src/engine/tiled_loader.js"></script>
     -->
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
