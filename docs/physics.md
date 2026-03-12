# Physics (Box2D)

The engine integrates with Box2D for robust 2D physics simulations. Extend `Box2DGame` for your game class and use `Box2DRectangleGO` / `Box2DCircleGO` for physics-enabled game objects.

## Initial Configuration

In your `index.html`, add the Box2D scripts after the core engine scripts:

```html
<!-- core engine scripts first -->
<script src="engine/renderer.js"></script>
<!-- ... -->
<script src="engine/gameobjects.js"></script>

<!-- then Box2D -->
<script src="lib/Box2D.js"></script>
<script src="engine/box2d_helper.js"></script>
<script src="engine/box2d_game.js"></script>
<script src="engine/box2d_gameobjects.js"></script>

<script src="src/my-game.js"></script>
```

## Game class with Box2D

```javascript
class MyBox2DGame extends Box2DGame {
    constructor(renderer) {
        // super(renderer, pixelsPerMeter, gravityVector, allowSleep)
        super(renderer, 100, { x: 0, y: -9.8 }, false);
    }

    Start() {
        super.Start(); // creates this.physicsWorld

        // this.gameObjects.push(new MyPhysicsBox(new Vector2(100, 100), this.physicsWorld));
    }
}
```

## GameObjects with a Box2D body

```javascript
class MyPhysicsBox extends Box2DRectangleGO {
    constructor(position, physicsWorld) {
        // super(position, physicsWorld, PhysicsObjectType, { width, height }, friction, restitution, color)
        super(position, physicsWorld, PhysicsObjectType.Box, { width: 1, height: 1, density: 1 }, 1, 0.5, Color.green);
    }

    OnContactDetected(other) {
        console.log("Collision with:", other.name);
    }
}
```

---

## API Reference

### `Box2DGame`

Extends the base `Game` class to manage the Box2D physics world.

#### `constructor(renderer, pixelsPerMeter, gravityVector, allowSleep)`

- `renderer` — the engine renderer instance
- `pixelsPerMeter` — conversion factor (e.g. `100` means 100 px = 1 m)
- `gravityVector` — `{x, y}` gravity in m/s² (e.g. `{x: 0, y: -9.8}`)
- `allowSleep` — whether bodies can sleep to save CPU

#### `physicsWorld`
The Box2D `b2World` instance. Use for advanced physics operations.

#### `SetDebugDraw(enabled)`
Enables or disables debug drawing of physics bodies and joints.

#### `AddBody(bodyDef)` / `RemoveBody(body)`
Add or remove a `b2Body` from the world. Typically called internally by `Box2DGameObject`s.

#### `SetGravity(gravityVector)`
Changes the gravity vector at runtime.

---

### `Box2DGameObject` classes

Base class for all physics-enabled game objects. Subclasses: `Box2DRectangleGO`, `Box2DCircleGO`, `Box2DSpriteGO`, `Box2DAnimatedSpriteGO`.

#### `constructor(position, physicsWorld, objectType, sizeOrRadius, density, friction, restitution, ...)`

- `position` — `Vector2` initial position
- `physicsWorld` — the `b2World` from `Box2DGame`
- `objectType` — `PhysicsObjectType.Box` or `PhysicsObjectType.Circle`
- `sizeOrRadius` — `{width, height}` for boxes, or a number for circles
- `density`, `friction`, `restitution` — physics material properties
- Additional parameters for rendering (color, image, animation data)

#### `body`
The underlying `b2Body` instance.

#### `OnContactDetected(otherGameObject)`
Called when this object's body begins contact with another `Box2DGameObject`. Override to handle collisions.

#### `OnContactEnded(otherGameObject)`
Called when contact ends.

#### `SetLinearVelocity(x, y)` / `GetLinearVelocity()`
Set or get the body's linear velocity in m/s.

#### `SetAngularVelocity(radiansPerSecond)` / `GetAngularVelocity()`
Set or get the body's angular velocity.

#### `ApplyForce(forceX, forceY, pointX, pointY)`
Applies a continuous force at a world point (affects acceleration).

#### `ApplyImpulse(impulseX, impulseY, pointX, pointY)`
Applies an instantaneous impulse (affects velocity directly).

#### `SetFixedRotation(fixed)`
Pass `true` to prevent the body from rotating.

#### `SetSensor(isSensor)`
Sensors detect collisions but don't apply physics responses.

#### `SetCategoryBits(bits)` / `SetMaskBits(bits)`
Configure collision filtering categories and masks.

---

### Helper functions (`box2d_helper.js`)

#### `PixelsToMeters(pixels)` / `MetersToPixels(meters)`
Convert between pixel values and Box2D meter values using `pixelsPerMeter`.

#### `Vector2ToB2Vec2(vector2)` / `B2Vec2ToVector2(b2vec2)`
Convert between the engine's `Vector2` and Box2D's `b2Vec2`.
