# Input System

The engine provides several levels of input:

- [**Direct input**](#direct-input) — query specific keys, mouse buttons, and gamepad buttons directly. Great for quick prototyping or simple games.
- [**Abstract input (Actions & Axes)**](#advanced-input-actions-amp-axes) — map named actions/axes to any device. Recommended for complex or controller-aware games.
- [**Rumble / Haptic Feedback**](#rumble--haptic-feedback) — trigger vibration on controllers that support it.
- [**Touch & Mobile**](#touch--mobile) — raw multi-touch state, automatic mouse mirroring, and on-screen virtual joysticks and buttons for mobile devices.

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

`Input.mouse` exposes position, per-button state for all three buttons, and the scroll wheel.

#### Position & movement

| Expression | Description |
|---|---|
| `Input.mouse.x` / `Input.mouse.y` | Cursor position in **game coordinates** (normalised to the canvas resolution, works in all display / fullscreen modes) |
| `Input.mouse.moved` | `true` this frame if the cursor moved |

#### Per-button state

Each button has its own sub-object with three boolean flags:

```javascript
Input.mouse.left.down      // true only on the frame the left button was first pressed
Input.mouse.left.pressed   // true every frame the left button is held down
Input.mouse.left.up        // true only on the frame the left button was released

Input.mouse.middle.down / .pressed / .up   // middle (scroll-wheel click)
Input.mouse.right.down  / .pressed / .up   // right button
```

The legacy top-level aliases (`Input.mouse.down`, `.up`, `.pressed`) still work and always mirror the **left** button, so existing code requires no changes.

The helper functions are also available and mirror the Unity-style API. All three accept an optional `button` index — `0` = left *(default)*, `1` = right, `2` = middle:

| Function | Description |
|---|---|
| `Input.IsMousePressed(button?)` | Button **held** (fires every frame) |
| `Input.IsMouseDown(button?)` | Button **just pressed** this frame (fires once) |
| `Input.IsMouseUp(button?)` | Button **just released** this frame (fires once) |

#### Scroll wheel

| Expression | Description |
|---|---|
| `Input.mouse.wheel` | Scroll delta accumulated this frame. Positive = scrolled down (away from user), negative = up. Reset to `0` automatically each frame. |

#### Example

```javascript
Update(deltaTime) {
    super.Update(deltaTime);

    // Track cursor
    this.crosshair.x = Input.mouse.x;
    this.crosshair.y = Input.mouse.y;

    // Left button — fire on click (button 0 is the default, parameter can be omitted)
    if (Input.IsMouseDown()) {              // or: Input.mouse.left.down
        this.FireAt(Input.mouse.x, Input.mouse.y);
    }

    // Right button — open context menu on press
    if (Input.IsMouseDown(1)) {             // or: Input.mouse.right.down
        this.OpenContextMenu(Input.mouse.x, Input.mouse.y);
    }

    // Middle button — held to pan the camera
    if (Input.IsMousePressed(2)) {          // or: Input.mouse.middle.pressed
        this.PanCamera(Input.mouse.x, Input.mouse.y);
    }

    // Left button released — finish a drag
    if (Input.IsMouseUp()) {               // or: Input.mouse.left.up
        this.EndDrag();
    }

    // Scroll wheel — zoom
    if (Input.mouse.wheel !== 0) {
        this.camera.zoom -= Input.mouse.wheel * 0.001;
    }
}
```

> See [mousetest.html](../mousetest.html) for an interactive demo of all mouse button events and the scroll wheel.

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

> See the [Twin-Stick Shooter demo](https://maxi-jp.github.io/spark.js/twin-stick-shooter.html) for a complete example combining keyboard movement and mouse aiming.

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

#### Any-button helpers (menu/start flows)

The Input API also includes helpers for "Press any button" style prompts:

| Function | Returns `true` when… |
|---|---|
| `Input.IsAnyGamepadButtonDown()` | Any connected gamepad pressed any physical button this frame |
| `Input.IsAnyGamepadFaceButtonDown()` | Any connected gamepad pressed one of `FACE_DOWN`, `FACE_RIGHT`, `FACE_LEFT`, `FACE_UP` this frame |

Example: continue from a main menu when player uses keyboard, mouse/touch, or gamepad face buttons:

```javascript
if (
    Input.keyboard.anyKeyPressed ||
    Input.touch.any ||
    Input.mouse.down ||
    Input.IsAnyGamepadFaceButtonDown()
) {
    this.mainMenu.StartButton();
}
```

### "Press anything" helper

For generic menu prompts, you can use:

| Function | Returns `true` when… |
|---|---|
| `Input.Anything()` | Keyboard, touch, mouse (button or wheel), or gamepad button activity is detected |

```javascript
if (Input.Anything()) {
    this.mainMenu.StartButton();
}
```

### Rumble / Haptic Feedback

Controllers that support the [Gamepad Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/GamepadHapticActuator) can be made to rumble with a single call.

`Input.RumbleGamepad(gamepadIndex, strongMagnitude, weakMagnitude, duration, startDelay)`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `gamepadIndex` | `number` | — | Index of the target gamepad (usually `0`) |
| `strongMagnitude` | `number` | `1` | Low-frequency (heavy) motor intensity, `0`–`1` |
| `weakMagnitude` | `number` | `1` | High-frequency (light) motor intensity, `0`–`1` |
| `duration` | `number` | `200` | How long the effect lasts, in milliseconds |
| `startDelay` | `number` | `0` | Delay before the effect starts, in milliseconds |

Both magnitudes are clamped to `[0, 1]`. The call is a safe no-op when the controller is disconnected or its actuator is not available.

> **Browser support:** Chrome and Edge support this unconditionally. Firefox requires a flag. Safari does not support it. The engine guards against missing actuators so the call never throws.

**One-shot hit feedback** — short heavy pulse when something impactful happens:
```javascript
Input.RumbleGamepad(0, 1, 0.5, 250);
```

**Differentiate the two motors** — strong motor for deep rumble, weak for surface buzz:
```javascript
// Engine idle: low-frequency only
Input.RumbleGamepad(0, 0.6, 0.1, 1000);

// High-frequency buzz (e.g. electric shock, rapid fire)
Input.RumbleGamepad(0, 0, 1, 400);
```

**Trigger-driven intensity** — rumble proportional to how hard the player pulls the triggers:
```javascript
Update(deltaTime) {
    super.Update(deltaTime);

    const lt = Input.GetGamepadTriggerValue(0, 'LT');
    const rt = Input.GetGamepadTriggerValue(0, 'RT');

    // Only rumble above a small dead-zone to avoid constant low-level noise
    if (lt > 0.05 || rt > 0.05) {
        // LT → strong (low-freq) motor; RT → weak (high-freq) motor
        Input.RumbleGamepad(0, lt, rt, 100);
    }
}
```

**Delayed secondary pulse** — chain two effects, e.g. explosion then debris:
```javascript
Input.RumbleGamepad(0, 1,   0.3, 200,   0);   // main blast
Input.RumbleGamepad(0, 0.2, 0.6, 400, 250);   // debris vibration after 250 ms
```

> **Real-world example:** the <a href="https://maxi-jp.github.io/spark.js/rumble-test.html" target="_blank">Rumble Test</a> demonstrates four named presets (Tap, Impact, Engine, Buzz) and a live custom section where LT/RT control motor intensity before firing.

### Rumble presets

Just like Actions and Axes, rumble effects can be registered by name and fired by id — keeping game logic clean and effects easy to tweak in one place.

```javascript
Start() {
    super.Start();
    Input.ClearMappings();

    // Input.RegisterRumble("rumble id", strongMagnitude, weakMagnitude, duration, startDelay);
    Input.RegisterRumble("Hit",       0.8, 0.4, 150);
    Input.RegisterRumble("Explosion", 1,   0.6, 400);
    Input.RegisterRumble("Engine",    0.5, 0.1, 800, 0);
}
```

Then fire them anywhere in your game:

```javascript
// On bullet hit
Input.ExecuteRumble("Hit");

// On explosion — fire on any connected gamepad
Input.ExecuteRumble("Explosion");

// Fire on a specific controller index
Input.ExecuteRumble("Engine", 1);
```

Unknown ids log a `console.warn` and are otherwise silently ignored.

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
            { type: 'gamepadaxis', stick: 'LS', axis: 1 },
            { type: 'gamepadbutton', positive: 'DPAD_DOWN', negative: 'DPAD_UP' }
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

#### `UnregisterAction(name)`
Removes a previously registered action mapping.

#### `RegisterAxis(name, mappings)`
Registers a new axis with a given name and maps it to one or more physical inputs.

#### `UnregisterAxis(name)`
Removes a previously registered axis mapping.

#### `GetAction(name)`
Returns `true` as long as any mapped input for the action is held down.

#### `GetActionDown(name)`
Returns `true` only during the single frame a mapped input is first pressed.

#### `GetActionUp(name)`
Returns `true` only during the single frame a mapped input is released.

#### `GetAxis(name)`
Returns a float between `-1.0` and `1.0` representing the current axis state.

#### `ClearMappings()`
Removes all previously registered actions, axes, and rumble presets.

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

#### `mouse`
The central mouse state object, updated every frame:

| Property | Type | Description |
|---|---|---|
| `mouse.x` / `mouse.y` | `number` | Cursor position in game coordinates |
| `mouse.moved` | `boolean` | `true` if the cursor moved this frame |
| `mouse.wheel` | `number` | Scroll delta this frame (positive = down). Reset to `0` each frame. |
| `mouse.left` | `{down, up, pressed}` | Left button state |
| `mouse.middle` | `{down, up, pressed}` | Middle button (wheel-click) state |
| `mouse.right` | `{down, up, pressed}` | Right button state |
| `mouse.down` | `boolean` | Alias for `mouse.left.down` |
| `mouse.up` | `boolean` | Alias for `mouse.left.up` |
| `mouse.pressed` | `boolean` | Alias for `mouse.left.pressed` |

For each button sub-object:
- `.down` — `true` only on the **single frame** the button was first pressed
- `.pressed` — `true` **every frame** the button is held
- `.up` — `true` only on the **single frame** the button was released

#### `IsMousePressed(button?)`
Returns `true` as long as the specified mouse button is held. Equivalent to `Input.mouse.left.pressed` when called with no argument.

#### `IsMouseDown(button?)`
Returns `true` only on the first frame the specified button is pressed. Equivalent to `Input.mouse.left.down` when called with no argument.

#### `IsMouseUp(button?)`
Returns `true` only on the frame the specified button is released. Equivalent to `Input.mouse.left.up` when called with no argument.

`button` values: `0` = left *(default)*, `1` = right, `2` = middle (wheel click).

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

#### `RumbleGamepad(gamepadIndex, strongMagnitude, weakMagnitude, duration, startDelay)`
Triggers haptic feedback on a gamepad. See [Rumble / Haptic Feedback](#rumble--haptic-feedback) for the full parameter table, browser support notes, and code examples.

#### `RegisterRumble(id, strong, weak, duration, delay)`
Registers a named rumble preset. `preset` fields: `strong` (0–1), `weak` (0–1), `duration` (ms), `delay` (ms) — all optional, defaults to `1`, `1`, `200`, `0`.

#### `UnregisterRumble(id)`
Removes a previously registered rumble preset.

#### `ExecuteRumble(id, gamepadIndex)`
Fires a previously registered preset. `gamepadIndex` defaults to `0`. Logs a warning if the id is not found.

---

## Touch & Mobile

spark.js has built-in support for touch-screen devices. It includes raw multi-touch state, automatic mirroring of the primary touch to `Input.mouse`, and a full virtual on-screen controls system (joysticks and buttons) that integrates with the Actions & Axes system.

### Enabling Mobile Support

Pass `mobileSupport: true` in your game's `Configure()` call, or leave it unset — the engine auto-detects touch screens via `navigator.maxTouchPoints`:

```javascript
class MyGame extends Game {
    constructor(renderer) {
        super(renderer);
        this.Configure({
            screenWidth:  640,
            screenHeight: 480,
            mobileSupport: true,   // or omit — auto-detected on touch devices
        });
    }
}
```

When active, the engine automatically:
- Injects `<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">` if not already present.
- Sets `touch-action: none` on the canvas (prevents the browser from scrolling or zooming when interacting with the game).
- Sets `user-select: none` on `document.body` (prevents text-selection glitches on tap).
- Calls `Input.SetupTouchEvents(canvas)` to register all touch listeners.

### Touch State

Raw touch state is available on `Input.touch`:

| Expression | Description |
|---|---|
| `Input.touch.any` | `true` while at least one finger is touching the screen |
| `Input.touch.count` | Number of currently active touch points |
| `Input.touch.down` | `true` on the **single frame** the first touch begins |
| `Input.touch.up` | `true` on the **single frame** the last touch ends |
| `Input.touch.touches` | `Map<id, {id, x, y}>` of all active touch points, in game coordinates |

### Mouse Mirroring

The primary finger (the first touch point) is automatically mirrored to `Input.mouse`:

```javascript
// This works on desktop AND mobile — no code change required
const dx = Input.mouse.x - this.player.x;
const dy = Input.mouse.y - this.player.y;
this.player.rotation = Math.atan2(dy, dx);

if (Input.IsMouseDown()) {
    this.FireAt(Input.mouse.x, Input.mouse.y);
}
```

> All touch coordinates are automatically normalised to game resolution, just like mouse coordinates.

### Virtual Controls

Virtual controls place on-screen joysticks and buttons in the canvas. They integrate with the abstract Actions & Axes system using two new binding types: `'virtualjoystick'` and `'virtualbutton'`.

There is a clear **separation of responsibilities** between the two files:
- `input.js` — tracks touch state and maps virtual controls to the action/axis system
- `virtualcontrols.js` — defines `VirtualJoystick`, `VirtualButton`, and the `VirtualControlls` rendering manager

**Script tag required** — include `virtualcontrols.js` after `input.js`:

```html
<script src="engine/input.js"></script>
<script src="engine/virtualcontrols.js"></script>
```

#### Setup in `Start()`

Create each control with `new VirtualJoystick(...)` / `new VirtualButton(...)`, then register it with `Input` for binding. Construction automatically adds the control to `VirtualControlls` for drawing.

```javascript
Start() {
    super.Start();

    const sw = this.screenWidth;
    const sh = this.screenHeight;

    // Axes: keyboard / gamepad / virtual joystick all feed the same axis
    Input.RegisterAxis('MoveH', [
        { type: 'key',             positive: KEY_D, negative: KEY_A },
        { type: 'gamepadaxis',     stick: 'LS',     axis: 0 },
        { type: 'virtualjoystick', id: 'move',      axis: 0 },
    ]);
    Input.RegisterAxis('MoveV', [
        { type: 'key',             positive: KEY_S, negative: KEY_W },
        { type: 'gamepadaxis',     stick: 'LS',     axis: 1 },
        { type: 'virtualjoystick', id: 'move',      axis: 1 },
    ]);

    // Action: keyboard / gamepad button / virtual button
    Input.RegisterAction('Fire', [
        { type: 'key',           code: KEY_SPACE },
        { type: 'gamepad',       code: 'FACE_DOWN' },
        { type: 'virtualbutton', id: 'fire' },
    ]);

    // 1. Construct the controls (auto-registers for drawing via VirtualControlls)
    const stick = new VirtualJoystick(90, sh - 90, 70);
    const btn   = new VirtualButton(sw - 90, sh - 90, 50, '⚡');

    // 2. Register them with Input for axis/action binding
    Input.RegisterVirtualJoystick('move', stick);
    Input.RegisterVirtualButton('fire', btn);
}
```

#### Drawing in `Draw()`

Call `VirtualControlls.Draw(renderer)` last so the controls appear on top of everything else:

```javascript
Draw() {
    // ... draw game world ...
    VirtualControlls.Draw(this.renderer);  // always last
}
```

#### Customising appearance

Both `VirtualJoystick` and `VirtualButton` expose `Color` properties you can set after construction:

```javascript
const stick = new VirtualJoystick(90, sh - 90, 70);
stick.baseColor = new Color(0, 0.5, 1, 0.2);   // blue tint
stick.rimColor  = new Color(0, 0.5, 1, 0.6);
stick.knobColor = new Color(0, 0.8, 1, 0.8);
Input.RegisterVirtualJoystick('move', stick);

const btn = new VirtualButton(sw - 90, sh - 90, 50, '⚡');
btn.color        = new Color(1, 0.3, 0, 0.15);
btn.pressedColor = new Color(1, 0.3, 0, 0.55);
btn.rimColor     = new Color(1, 0.4, 0, 0.70);
Input.RegisterVirtualButton('fire', btn);
```

You can also toggle visibility at any time: `stick.visible = false;`

> **See it live:** [Touch & Virtual Controls demo](../touch.html) — a mobile-friendly "collect the dots" mini-game using a joystick to move and a button to burst.

---

### Touch API Reference

#### `Input.touch`
Object with the current multi-touch state. Fields: `any` (bool), `count` (int), `down` (bool, single frame), `up` (bool, single frame), `touches` (Map&lt;id, {id, x, y}&gt;).

#### `SetupTouchEvents(canvas)`
Registers `touchstart`, `touchmove`, `touchend`, and `touchcancel` listeners on the canvas. Called automatically when `mobileSupport` is active. Safe to call manually if you manage mobile setup yourself.

---

### Virtual Controls API Reference

#### `RegisterVirtualJoystick(id, joystick)`
Registers an existing `VirtualJoystick` instance under `id` for use in axis bindings `{ type: 'virtualjoystick', id, axis }`. The instance must be created first with `new VirtualJoystick(...)`, which auto-registers it for drawing.

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | Unique key referenced in axis bindings |
| `joystick` | `VirtualJoystick` | The instance to register |

#### `RemoveVirtualJoystick(id)`
Unregisters a previously registered virtual joystick id, so it no longer contributes to axis bindings.

#### `RegisterVirtualButton(id, button)`
Registers an existing `VirtualButton` instance under `id` for use in action bindings `{ type: 'virtualbutton', id }`. The instance must be created first with `new VirtualButton(...)`, which auto-registers it for drawing.

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | Unique key referenced in action bindings |
| `button` | `VirtualButton` | The instance to register |

#### `GetVirtualJoystick(id)`
Returns the registered `VirtualJoystick` instance, or `undefined` if not found.

#### `GetVirtualButton(id)`
Returns the registered `VirtualButton` instance, or `undefined` if not found.

#### `UpdateVirtualControls()`
Processes active touch points and updates joystick/button state. Called automatically each frame by the engine loop — you do not need to call this yourself.

#### `VirtualControlls.Draw(renderer)`
Draws all virtual controls created during the session. This is a method on the global `VirtualControlls` object defined in `virtualcontrols.js`, **not** on `Input`. Call it at the end of your `Draw()` method so controls appear above the game world:
```javascript
Draw() {
    // ... game world ...
    VirtualControlls.Draw(this.renderer);  // always last
}
```

---

### `VirtualJoystick` class

Defined in `virtualcontrols.js`. Instantiate directly with `new VirtualJoystick(x, y, baseRadius)`. Construction automatically registers the instance with `VirtualControlls` for drawing. Register with `Input.RegisterVirtualJoystick(id, instance)` for input binding.

| Member | Type | Description |
|---|---|---|
| `axisX` | `number` (read-only) | Normalised horizontal deflection: `-1.0` (left) → `1.0` (right) |
| `axisY` | `number` (read-only) | Normalised vertical deflection: `-1.0` (up) → `1.0` (down) |
| `active` | `bool` (read-only) | `true` while a finger is touching this joystick |
| `x`, `y` | `number` | Centre position (can be updated at runtime for dynamic layouts) |
| `baseRadius` | `number` | Outer ring radius |
| `knobRadius` | `number` | Draggable knob radius |
| `visible` | `bool` | Set to `false` to hide (still processes touches) |
| `baseColor` | `Color` | Fill colour of the outer ring |
| `rimColor` | `Color` | Stroke colour of the outer ring |
| `knobColor` | `Color` | Fill colour of the knob |
| `rimLineWidth` | `number` | Stroke width of the outer ring |

---

### `VirtualButton` class

Defined in `virtualcontrols.js`. Instantiate directly with `new VirtualButton(x, y, radius, label)`. Construction automatically registers the instance with `VirtualControlls` for drawing. Register with `Input.RegisterVirtualButton(id, instance)` for input binding.

| Member | Type | Description |
|---|---|---|
| `down` | `bool` | `true` on the **single frame** the button is first pressed |
| `pressed` | `bool` | `true` every frame the button is held down |
| `up` | `bool` | `true` on the **single frame** the button is released |
| `active` | `bool` (read-only) | `true` while a finger is pressing this button |
| `x`, `y` | `number` | Centre position |
| `radius` | `number` | Hit-test and visual radius |
| `label` | `string` | Text/emoji rendered inside the button |
| `visible` | `bool` | Set to `false` to hide (still processes touches) |
| `color` | `Color` | Fill colour when not pressed |
| `pressedColor` | `Color` | Fill colour when pressed |
| `rimColor` | `Color` | Stroke colour |
| `labelColor` | `Color` | Text colour |
| `labelFont` | `string\|null` | Override font string. `null` = auto-sized from `radius` |
| `rimLineWidth` | `number` | Stroke width |

