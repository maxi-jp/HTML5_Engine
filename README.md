# HTML5_Engine

A modular, object-oriented HTML5 game engine for web browsers, built with vanilla JavaScript and the HTML5 Canvas API. Originally created for a university course on web game development.

Engine and examples presents on this project are active on github pages: https://maxi-jp.github.io/HTML5_Engine/

## Features

- **Game Loop**: Built-in main loop with update and draw phases.
- **GameObject System**: Easily create and manage game objects with position, rotation, scale, and custom logic.
- **HTML5 Canvas**: Render the graphics using the canvas from HTML5.
- **Sprite & Animation Support**: Render static sprites, sprite sections, and both basic and complex sprite sheet animations.
- **Physics Integration**: Box2D physics support with easy-to-use Box2DGameObject classes for rectangles, sprites, and animated objects.
- **Input Handling**: Keyboard, mouse, and gamepad input support.
- **Audio System**: Play, pause, stop, and control audio with optional analyzer support.
- **UI & Menus**: HTML-based menu system for overlays and in-game menus.
- **Background Layers**: Static color, gradient, parallax, and tilemap backgrounds.
- **Pooling System**: Efficient object pooling for bullets, particles, etc.
- **Utilities**: Vector math, collision detection, color utilities, and more.
- **Mode 7 Renderer**: Simulate SNES-style pseudo-3D backgrounds (as in F-Zero or Mario Kart).
- **Debug Tools**: Optional debug drawing and FPS/stats overlay.

## Directory Structure
- src/
  - renderer.js           # Graphic renderers (support for 2d context and WebGL)
  - main.js               # Entry point and main loop
  - game.js               # Core Game class
  - gameobjects.js        # GameObject, SpriteObject, AnimationObject, Camera, Pool, Background Layers
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
2. Create a new `index.html` for your game, and add all the `src` scripts you need to your `engine/` folder (main files: `main.js`, `game.js`, `gameobjects.js`, `input.js`, `utils_classes.js`, `utils_math.js`, `audioplayer.js`, `htmlmenu.js`; and for Box2D physics objects: `box2d_game.js`, `box2d_gameobjects.js`, and `box2d_helper.js`):
```html
<head>
    <!-- ... -->
    <script src="engine/renderer.js"></script>
    <script src="engine/main.js"></script>
    <script src="engine/utils_math.js"></script>
    <script src="engine/input.js"></script>
    <script src="engine/audioplayer.js"></script>
    <script src="engine/game.js"></script>
    <script src="engine/utils_classes.js"></script>
    <script src="engine/gameobjects.js"></script>
    <script src="engine/lib/Box2D.js"></script>
    <!-- add these only if you want to use box2d physics -->
    <script src="lib/Box2D.js"></script>
    <script src="engine/box2d_helper.js"></script>
    <script src="engine/box2d_game.js"></script>
    <script src="engine/box2d_gameobjects.js"></script>
    <!-- add here your game scripts -->
    <script src="src/my-game.js"></script>
</head>
```
3. Create a new script with a new class that inherits from **Game**, add it to the `index.html`, and initialize the game (the constructor must receive the renderer object and should pass it to its parent):
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

4. Create GameObjects by inheriting from the classes in `gameobjects.js`, add them to the `this.gameObjects` array of your game, and run! (See the examples in `src/examples/`.)

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


