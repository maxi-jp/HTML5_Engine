# Debugging Tools

The engine provides several built-in debugging aids, all zero-cost in production — just flip a flag.

---

## Collider visualisation

Add `drawColliders: true` to your game config to draw every registered collider on top of the normal scene each frame:

```javascript
this.Configure({ drawColliders: true });
```

Colliders are drawn in **red** when not overlapping and switch to **green** while a collision is active.

For pure hitbox debugging — skipping all game-object rendering entirely — use `collidersOnly: true` instead:

```javascript
this.Configure({ collidersOnly: true });
```

For Box2D physics games this also draws Box2D body shapes, joints, and AABB outlines via the built-in debug renderer.

> See the [Colliders test demo](https://maxi-jp.github.io/spark.js/colliders.html) for a live example.

---

## FPS / stats overlay

The global `drawStats` boolean toggles a live FPS + frame-time counter drawn in the top-left corner of the canvas. It is `true` by default. Set it to `false` to hide it:

```javascript
// Hide the FPS overlay for release builds
drawStats = false;
```

---

## Debug mode

The global `debugMode` boolean enables extra visualisation inside certain engine classes (e.g. `SSAnimationObjectBasic` draws the current frame bounding box). Toggle it at any time:

```javascript
debugMode = true;
```

You can also use it as a guard in your own game objects to add custom debug drawing without shipping it in production:

```javascript
Draw(renderer) {
    super.Draw(renderer);
    if (debugMode) {
        renderer.DrawStrokeCircle(this.x, this.y, this.hitRadius, Color.red, 1);
    }
}
```

---

## Summary

| Flag / Config | Where | Effect |
|---|---|---|
| `this.Configure({ drawColliders: true })` | Game config | Draw all colliders (red/green) on top of the scene |
| `this.Configure({ collidersOnly: true })` | Game config | Draw **only** colliders — skip all game-object rendering |
| `drawStats = false` | Global variable | Hide the FPS/frame-time overlay |
| `debugMode = true` | Global variable | Enable extra debug drawing in engine classes and your own code |
