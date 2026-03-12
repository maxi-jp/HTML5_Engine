# Input System

The engine provides two levels of input:

- [**Direct input**](#direct-input) — query specific keys, mouse buttons, and gamepad buttons directly. Great for quick prototyping or simple games.
- [**Abstract input (Actions & Axes)**](#advanced-input-actions-amp-axes) — map named actions/axes to any device. Recommended for complex or controller-aware games.

---

## Direct Input

### Keyboard

All key codes are pre-defined constants. The common ones are:

| Constant | Key | Constant | Key |
|---|---|---|---|
| `KEY_LEFT` / `KEY_RIGHT` / `KEY_UP` / `KEY_DOWN` | Arrow keys | `KEY_SPACE` | Space |
| `KEY_W` / `KEY_A` / `KEY_S` / `KEY_D` | WASD | `KEY_ENTER` | Enter |
| `KEY_ESCAPE` | Escape | `KEY_LSHIFT` | Left Shift |
| `KEY_LCTRL` | Left Ctrl | `KEY_TAB` | Tab |
| `KEY_0` … `KEY_9` | Number row | `KEY_Q` … `KEY_P`, `KEY_A` … `KEY_M` | Letter keys |

Three query functions cover every keyboard use case:

| Function | Returns `true` when… |
|---|---|
| `Input.IsKeyPressed(keyCode)` | The key is **held down** (fires every frame) |
| `Input.IsKeyDown(keyCode)` | The key was **just pressed** this frame (fires once) |
| `Input.IsKeyUp(keyCode)` | The key was **just released** this frame (fires once) |

Example use of basic keyboard input functions in a `Game` class:

```javascript
Update(deltaTime) {
    super.Update(deltaTime);

    // Held — smooth movement
    if (Input.IsKeyPressed(KEY_LEFT)  || Input.IsKeyPressed(KEY_A))
        this.player.x -= 200 * deltaTime;
    if (Input.IsKeyPressed(KEY_RIGHT) || Input.IsKeyPressed(KEY_D))
        this.player.x += 200 * deltaTime;
    if (Input.IsKeyPressed(KEY_UP)    || Input.IsKeyPressed(KEY_W))
        this.player.y -= 200 * deltaTime;
    if (Input.IsKeyPressed(KEY_DOWN)  || Input.IsKeyPressed(KEY_S))
        this.player.y += 200 * deltaTime;

    // Single-frame — toggle or fire once
    if (Input.IsKeyDown(KEY_SPACE)) {
        this.player.Jump();
    }

    if (Input.IsKeyUp(KEY_ESCAPE)) {
        this.TogglePause();
    }
}
```

### Mouse

In the Input object there is a `mouse` attribute with the mouse status, and other functions relative to it:

| Expression | Description |
|---|---|
| `Input.mouse.x` / `Input.mouse.y` | Cursor position in **game coordinates** (automatically normalised to match the canvas resolution, works correctly in all display/fullscreen modes) |
| `Input.IsMousePressed()` | Left button is **held down** (fires every frame) |
| `Input.IsMouseDown()` | Left button was **just pressed** this frame (fires once) |
| `Input.IsMouseUp()` | Left button was **just released** this frame (fires once) |

Example use of basic mouse input logic in a `Game` class:

```javascript
Update(deltaTime) {
    super.Update(deltaTime);

    // Track cursor position
    this.crosshair.x = Input.mouse.x;
    this.crosshair.y = Input.mouse.y;

    // Fire on click (single frame)
    if (Input.IsMouseDown()) {
        this.FireAt(Input.mouse.x, Input.mouse.y);
    }

    // Charge while held
    if (Input.IsMousePressed()) {
        this.chargeBar += deltaTime;
    }

    // Release
    if (Input.IsMouseUp()) {
        this.LaunchCharged(this.chargeBar);
        this.chargeBar = 0;
    }
}
```

### Keyboard + Mouse together — compact example

```javascript
Update(deltaTime) {
    super.Update(deltaTime);

    // WASD movement
    const speed = 200;
    if (Input.IsKeyPressed(KEY_W)) this.player.y -= speed * deltaTime;
    if (Input.IsKeyPressed(KEY_S)) this.player.y += speed * deltaTime;
    if (Input.IsKeyPressed(KEY_A)) this.player.x -= speed * deltaTime;
    if (Input.IsKeyPressed(KEY_D)) this.player.x += speed * deltaTime;

    // Face the cursor
    const dx = Input.mouse.x - this.player.x;
    const dy = Input.mouse.y - this.player.y;
    this.player.rotation = Math.atan2(dy, dx);

    // Shoot on click
    if (Input.IsMouseDown()) {
        this.SpawnBullet(this.player.position, this.player.rotation);
    }
}
```

> See the [Twin-Stick Shooter demo](https://maxi-jp.github.io/HTML5_Engine/twin-stick-shooter.html) for a complete example combining keyboard movement and mouse aiming.

### Direct Gamepad Access

For quick gamepad queries:

```javascript
Update(deltaTime) {
    super.Update(deltaTime);

    if (Input.gamepads.length > 0) {
        const stick = Input.GetGamepadStickValue(0, 'LS');
        this.player.x += stick.x * 200 * deltaTime;
        this.player.y += stick.y * 200 * deltaTime;

        if (Input.IsGamepadButtonDown(0, 'FACE_DOWN')) {
            this.player.Jump();
        }
    }
}
```

---

## Advanced Input: Actions & Axes

The abstract input system lets you define high-level **Actions** (discrete events like jumping) and **Axes** (continuous input like movement) and map them to any physical device — keyboard, mouse, or gamepad. This decouples your game logic from specific hardware, making controls flexible and easy to remap.

### 1. Registering Actions and Axes

In your game's `Start` method, register your actions and axes. Call `Input.ClearMappings()` first to ensure a clean slate.

```javascript
class MyGame extends Game {
    Start() {
        super.Start();
        Input.ClearMappings();

        // Single-press action
        Input.RegisterAction("Jump", [
            { type: 'key', code: KEY_SPACE },
            { type: 'gamepad', code: 'FACE_DOWN' } // A button (Xbox layout)
        ]);

        // Held action
        Input.RegisterAction("Fire", [
            { type: 'mouse' },
            { type: 'gamepad', code: 'FACE_RIGHT' }
        ]);

        // Continuous horizontal axis
        Input.RegisterAxis("MoveHorizontal", [
            { type: 'key', positive: KEY_D, negative: KEY_A },
            { type: 'key', positive: KEY_RIGHT, negative: KEY_LEFT },
            { type: 'gamepadaxis', stick: 'LS', axis: 0 },
            { type: 'gamepadbutton', positive: 'DPAD_RIGHT', negative: 'DPAD_LEFT' }
        ]);

        // Vertical axis
        Input.RegisterAxis("MoveVertical", [
            { type: 'key', positive: KEY_S, negative: KEY_W },
            { type: 'key', positive: KEY_DOWN, negative: KEY_UP },
            { type: 'gamepadaxis', stick: 'LS', axis: 1 }
        ]);

        // Trigger axis (0.0 – 1.0)
        Input.RegisterAxis("Accelerate", [
            { type: 'gamepadtrigger', trigger: 'RT' }
        ]);
    }
}
```

### 2. Querying Input in `Update`

```javascript
Update(deltaTime) {
    super.Update(deltaTime);

    // Single press event
    if (Input.GetActionDown("Jump")) {
        // myPlayer.jump();
    }

    // Held
    if (Input.GetAction("Fire")) {
        // myPlayer.fireWeapon();
    }

    // Analog axis (-1.0 to 1.0)
    const moveX = Input.GetAxis("MoveHorizontal");
    const moveY = Input.GetAxis("MoveVertical");
    this.player.x += moveX * 200 * deltaTime;
    this.player.y += moveY * 200 * deltaTime;

    // Trigger (0.0 to 1.0)
    const accel = Input.GetAxis("Accelerate");
}
```

---

## API Reference

### Abstract Input System

#### `RegisterAction(name, mappings)`
Registers a new action with a given name and maps it to one or more physical inputs.

#### `RegisterAxis(name, mappings)`
Registers a new axis with a given name and maps it to one or more physical inputs.

#### `GetAction(name)`
Returns `true` as long as any mapped input for the action is held down.

#### `GetActionDown(name)`
Returns `true` only during the single frame a mapped input is first pressed.

#### `GetActionUp(name)`
Returns `true` only during the single frame a mapped input is released.

#### `GetAxis(name)`
Returns a float between `-1.0` and `1.0` representing the current axis state.

#### `ClearMappings()`
Removes all previously registered actions and axes.

---

### Direct Keyboard Input

#### `IsKeyPressed(keyCode)`
Returns `true` as long as the key is held down.

#### `IsKeyDown(keyCode)`
Returns `true` only on the first frame the key is pressed.

#### `IsKeyUp(keyCode)`
Returns `true` only on the frame the key is released.

---

### Direct Mouse Input

#### `IsMousePressed(button)`
Returns `true` as long as the mouse button is held. `0` = Left, `1` = Middle, `2` = Right.

#### `IsMouseDown(button)`
Returns `true` only on the first frame the button is pressed.

#### `IsMouseUp(button)`
Returns `true` only on the frame the button is released.

#### `mouse`
Object with `Input.mouse.x` and `Input.mouse.y` — automatically normalised to game resolution.

---

### Direct Gamepad Input

#### `gamepads`
Array of connected gamepad objects. Check `.length` to see how many are connected.

#### `IsGamepadButtonPressed(gamepadIndex, buttonCode)`
Returns `true` as long as the button is held.

#### `IsGamepadButtonDown(gamepadIndex, buttonCode)`
Returns `true` only on the first frame the button is pressed.

#### `IsGamepadButtonUp(gamepadIndex, buttonCode)`
Returns `true` only on the frame the button is released.

#### `GetGamepadStickValue(gamepadIndex, stick)`
Returns `{x, y}` values for the specified stick (`'LS'` or `'RS'`).

#### `GetGamepadTriggerValue(gamepadIndex, trigger)`
Returns a float between `0.0` and `1.0` for the specified trigger (`'LT'` or `'RT'`).

#### `GetGamepadStickDirection(gamepadIndex, stick, direction)`
Returns `true` if the stick is pushed past the deadzone in the given direction (`'UP'`, `'DOWN'`, `'LEFT'`, `'RIGHT'`).
