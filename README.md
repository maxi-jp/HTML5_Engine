# HTML5_Engine

A modular, object-oriented HTML5 game engine for web browsers, built with vanilla JavaScript and the HTML5 Canvas API. Originally created for a university course on web game development.

Engine and examples presents on this project are active on github pages: https://maxi-jp.github.io/HTML5_Engine/

## Features

- **Modular Core**: A clean, object-oriented core that's easy to extend.
- **Rendering Engine**: 2D rendering via HTML5 Canvas with an architecture that supports other renderers (like WebGL).
- **Game Loop**: A classic, built-in main loop with fixed update and variable draw phases.
- **Sprite & Animation**: Full support for static sprites, sprite sheets, and complex animations.
- **Sprite & Animation Support**: Render static sprites, sprite sections, and both basic and complex sprite sheet animations.
- **Physics Integration**: Box2D physics support with easy-to-use Box2DGameObject classes for rectangles, sprites, and animated objects.
- **Input Handling**: Unified API for keyboard, mouse, and gamepad input.
- **Audio Manager**: A simple yet powerful system to manage and play audio with optional analyzer support.
- **UI & Menus**: Use standard HTML and CSS for creating game menus and overlays.
- **Background Layers**: Create rich backgrounds with solid colors, gradients, parallax scrolling layers, and tilemaps.
- **Object Pooling**: An efficient pooling system for reusing objects like bullets or particles to improve performance.
- **Utilities**: A collection of helpers for vector math, collision detection, color manipulation, and more.
- **Debugging Tools**: Optional debug drawing for physics bodies and an FPS/stats overlay.
- **Mode 7 Renderer**: Simulate SNES-style pseudo-3D backgrounds (as in F-Zero or Mario Kart).

## Directory Structure
- src/
  - renderer.js           # Graphic renderers (support for 2d context and WebGL)
  - main.js               # Entry point and main loop
  - game.js               # Core Game class
  - gameobjects.js        # GameObject, SpriteObject, AnimationObject, Tileset, Camera, Pool, Background Layers
  - input.js              # Keyboard, mouse, and gamepad input
  - utils_classes.js      # Canvas drawing helpers
  - utils_math.js         # Math, vector, and collision utilities
  - audioplayer.js        # Audio system
  - htmlmenu.js           # HTML-based menu system
  - box2d_game.js         # Box2D game base class 
  - box2d_gameobjects.js  # Box2D-enabled game objects
  - box2d_helper.js       # Box2D utility functions
- examples/
  - floppyderp/           # Flappy Bird-like example
  - menu/                 # Menu example
  - mode7/                # Mode 7 pseudo-3D example

## Getting Started

1. **Clone or Download** this repository.

2. **Set up your project folder.** Create a new folder for your game. Inside it, create an `engine` folder and copy the contents of the `src` directory from this repository into it. Your game's own JavaScript files can go in a `js` or `src` folder.

   Your project structure might look like this:
   ```
   my-game/
   ├── engine/
   │   ├── renderer.js
   │   ├── main.js
   │   ├── game.js
   │   └── ... (all other engine files from src/)
   ├── src/
   │   └── my-game.js
   ├── lib/
   │   └── Box2D.js  (if using physics)
   └── index.html
   ```

3. **Create your `index.html`** and include the engine scripts. The order is important. You can use the following template:
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Awesome Game</title>
    <!-- ... -->
    <script src="engine/renderer.js"></script>
    <script src="engine/main.js"></script>
    <script src="engine/utils_math.js"></script>
    <script src="engine/input.js"></script>
    <script src="engine/audioplayer.js"></script>
    <script src="engine/game.js"></script>
    <script src="engine/utils_classes.js"></script>
    <script src="engine/gameobjects.js"></script>
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
4. Create a new script with a new class that inherits from **Game**, add it to the `index.html`, and initialize the game (the constructor must receive the renderer object and should pass it to its parent):
```javascript
class MyGame extends Game {
    constructor(renderer) {
        super(renderer);
        // Declare game objects
    }

    Start() {
        // Set the screen size (canvas width and height)
        this.screenWidth = 640;
        this.screenHeight = 480;

        // Initialize the game objects
    }

    Update(deltaTime) {
        super.Update(deltaTime);  // Update the game objects of this.gameObjects array
    }

    Draw() {
        // Draw a black rectangle that fills the canvas
        this.renderer.DrawFillRectangle(0, 0, this.screenWidth, this.screenHeight, Color.black);

        super.Draw(); // Draw the game objects of this.gameObjects array
    }
}

// call Init (global function defined in the main.js script) with the class of your game as parameter once the document has been loaded 
window.onload = () => {
    Init(MyGame);
}
```

5. Create GameObjects by inheriting from the classes in `gameobjects.js`, add them to the `this.gameObjects` array of your game's `Start` method, and run! (See the examples in `src/examples/`.)

## Example: Creating a GameObject

```javascript
class MyRotationBox extends RectangleGO {
    constructor(position) {
        // A 100x100 pixels blue box
        super(position, 100, 100, 'blue');

        this.rotationSpeed = 1;
    }

    Update(deltaTime) {
        this.rotation += this.rotationSpeed * deltaTime;
    }
    
    // The base class handles drawing
}
```

## Example: Using Box2D Physics

### Game that uses Box2D

```javascript
class MyBox2DGame extends Box2DGame {
    constructor(renderer) {
        super(renderer, 100, { x: 0, y: -9.8 }, false); // 1 pixel = 1/100 meter, gravity in m/s^2, allow bodies to sleep
    }

    Start() {
        super.Start(); // create the physics simulated this.physicsWorld

        // create game objects with physics
    }
}
```

### GameObjects with Box2D body for this game

```javascript
class MyPhysicsBox extends Box2DRectangleGO {
    constructor(position, physicsWorld) {
        super(position, physicsWorld, PhysicsObjectType.Box, { width: 1, height: 1, density: 1 }, 1, 1, "green");
    }

    OnContactDetected(other) {
        // Handle collision
    }
}
```

## License

MIT License

## TODO list
- Example for a Tileset.
- Create an action system for the input (i.e. `Input.Action("move_left")` instead of `Input.IsKeyDown(KEY_LEFT) || Input.IsKeyDown(KEY_A) || Input.IsGamepadButtonDown(0, "DPAD_LEFT") || Input.IsGamepadButtonDown(0, "LS_LEFT")`).
- Improve the webgl renderer (draw batching).
- Implement other physic engines.
- Create a documentation page/wiki.
- Multiplayer with nodejs.

## Contributing

Contributions are welcome! If you want to help improve HTML5_Engine:

1. **Fork** this repository and create your branch from `main`.
2. **Commit** your changes with clear messages.
3. **Push** your branch and open a **pull request**.
4. For bug reports or feature requests, please [open an issue](https://github.com/maxi-jp/HTML5_Engine/issues).

**Guidelines:**
- Please keep code style consistent with the existing codebase.
- Add comments and documentation where appropriate.
- If you add new features, consider including an example or test.

Thank you for helping make HTML5_Engine better!


---

**Enjoy building games with HTML5_Engine!**


