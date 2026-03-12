# UI & Menus

The engine uses two complementary approaches for UI:

- **HTML + CSS overlays** — standard web elements (divs, buttons, animations) positioned on top of the canvas. Best for menus, HUDs, and any UI that benefits from CSS transitions, layouts, or accessibility. Managed through the `HTMLMenu` helper class (`engine/htmlmenu.js`).
- **In-canvas drawing** — `TextLabel` and direct renderer calls drawn during `Draw()`. Best for score counters, health bars, and anything that needs to move with the game world.

---

## HTML Overlay Approach

### HTML structure

The canvas sits inside a **relative-positioned container**. Menu divs are absolutely positioned siblings of the canvas so they overlay it exactly:

```html
<div id="container">
    <canvas id="myCanvas" width="640" height="480"></canvas>

    <!-- Main menu — covers the canvas -->
    <div id="mainMenu">
        <h1>My Game</h1>
        <div class="menuButton" id="menuStart">Start</div>
        <div class="menuButton" id="menuCredits">Credits</div>
    </div>

    <!-- In-game UI panel — shown/hidden during gameplay -->
    <div id="ingameUI" class="hidden">
        <button id="upgrade1">Upgrade 1</button>
        <button id="upgrade2">Upgrade 2</button>
    </div>
</div>
```

### CSS structure

```css
#container {
    position: relative;  /* required — overlays use position: absolute inside this */
    overflow: hidden;
}

#mainMenu {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background-color: rgba(0, 0, 50, 0.9);
    transition: left 0.5s;  /* slide in/out transition */
}

.hidden {
    display: none;
}
```

### The `HTMLMenu` class

`HTMLMenu` (`engine/htmlmenu.js`) is a thin helper that wires CSS selectors to DOM elements and attaches click callbacks. Extend it for each menu in your game.

**Constructor**

```javascript
new HTMLMenu(game, menuContainerSelector, canvasContainerSelector, canvas, coverCanvas)
```

| Parameter | Description |
|---|---|
| `game` | Reference to your `Game` instance (gives menu access to game state) |
| `menuContainerSelector` | CSS selector for the menu `<div>` (e.g. `"#mainMenu"`) |
| `canvasContainerSelector` | CSS selector for the wrapper `<div>` (e.g. `"#container"`) |
| `canvas` | The `canvas` DOM element |
| `coverCanvas` | If `true`, `Start()` resizes the menu container to exactly match the canvas size |

**Key methods**

| Method | Description |
|---|---|
| `Start()` | Call once (from your `Game.Start()`). Optionally sizes the container to match the canvas. |
| `SetupElements(selectors[])` | Registers DOM elements by CSS selector for later access via `this.elements["#id"]` |
| `SetupButtons([ {selector, callback} ])` | Registers click listeners; callbacks are bound to your class methods |
| `SetContainerStyle(styleString)` | Directly sets the container's `style` attribute — useful for CSS transitions |

---

### Example: a sliding main menu

This is the pattern used in the [menu example](https://maxi-jp.github.io/HTML5_Engine/menu.html):

**JS — subclass `HTMLMenu`**

```javascript
class MainMenu extends HTMLMenu {
    constructor(game, canvas) {
        // "#mainMenu" is the menu div, "#container" is the canvas wrapper
        super(game, "#mainMenu", "#container", canvas, true);
    }

    Start() {
        super.Start();

        // Register elements and button callbacks
        this.SetupElements(["#menuStart", "#menuCredits", "#credits"]);
        this.SetupButtons([
            { selector: "#menuStart",   callback: this.OnStartButton.bind(this) },
            { selector: "#menuCredits", callback: this.OnCreditsButton.bind(this) },
        ]);
    }

    // Slide the menu off-screen to the left
    OnStartButton() {
        this.SetContainerStyle("left: -100%");
        this.game.OnMenuStart();        // notify the Game class
    }

    // Slide the menu back on-screen
    ShowMenu() {
        this.SetContainerStyle("left: 0%");
    }
}
```

**JS — `Game` class wiring**

```javascript
class MyGame extends Game {
    constructor(renderer) {
        super(renderer);
        this.mainMenu = null;
        this.onMenu = true;
    }

    Start() {
        super.Start();

        this.mainMenu = new MainMenu(this, canvas);
        this.mainMenu.Start();
        this.onMenu = true;

        // Re-open the menu with Escape
    }

    Update(deltaTime) {
        super.Update(deltaTime);

        if (Input.IsKeyUp(KEY_ESCAPE)) {
            this.mainMenu.ShowMenu();
            this.onMenu = true;
        }
    }

    // Called by MainMenu when the Start button is clicked
    OnMenuStart() {
        this.onMenu = false;
    }
}
```

---

### Example: an in-game UI panel

This is the pattern used in the [menu-and-ui example](https://maxi-jp.github.io/HTML5_Engine/menu-and-ui.html) — an upgrade panel that can be toggled during gameplay:

```javascript
class UIMenu extends HTMLMenu {
    constructor(game, canvas) {
        // coverCanvas=false — this panel does NOT need to fill the whole canvas
        super(game, "#ingameUI", "#container", canvas, false);
    }

    Start() {
        super.Start();

        this.SetupElements(["#ingameUI", "#upgrade1", "#upgrade2", "#upgrade3"]);
        this.SetupButtons([
            { selector: "#upgrade1", callback: this.UpgradeButton.bind(this, 1) },
            { selector: "#upgrade2", callback: this.UpgradeButton.bind(this, 2) },
            { selector: "#upgrade3", callback: this.UpgradeButton.bind(this, 3) },
        ]);
    }

    Show() { this.elements["#ingameUI"].classList.remove("hidden"); }
    Hide() { this.elements["#ingameUI"].classList.add("hidden"); }

    UpgradeButton(id) {
        this.game.OnUpgradeClick(id);
    }

    // Update a button's displayed value from game code
    UpdateButtonCost(id, newCost) {
        this.elements["#upgrade" + id].querySelector("p").innerText = newCost + "€";
    }
}
```

Toggle it from the `Game`:

```javascript
if (Input.IsKeyDown(KEY_SPACE)) {
    this.onUpgradeMenu ? this.uiMenu.Hide() : this.uiMenu.Show();
    this.onUpgradeMenu = !this.onUpgradeMenu;
}
```

---

## In-Canvas UI with `TextLabel`

For score displays, timers, and HUD text drawn directly on the canvas, use `TextLabel`:

```javascript
// Create labels (typically in Start())
this.scoreLabel   = new TextLabel("Score: 0", new Vector2(8, 8), "18px Arial", "white", "left", "top");
this.centerLabel  = new TextLabel("PAUSED", new Vector2(320, 240), "36px Arial", "yellow", "center", "middle");

// Update text at any time
this.scoreLabel.text = `Score: ${this.score}`;

// Draw them in Draw() — they render on top of gameObjects
Draw() {
    super.Draw();
    this.scoreLabel.Draw(this.renderer);
    if (this.paused)
        this.centerLabel.Draw(this.renderer);
}
```

**`TextLabel` constructor:**

```javascript
new TextLabel(text, position, font, color, align, baseline, visible)
```

| Parameter | Default | Description |
|---|---|---|
| `text` | — | Initial string |
| `position` | — | `Vector2` — screen position |
| `font` | — | CSS font string, e.g. `"18px Arial"` |
| `color` | — | CSS color string or engine `Color` |
| `align` | `"left"` | `"left"` \| `"center"` \| `"right"` |
| `baseline` | `"top"` | `"top"` \| `"middle"` \| `"bottom"` |
| `visible` | `true` | Toggle without removing the object |

---

## Live demos

- [HTML + CSS main menu](https://maxi-jp.github.io/HTML5_Engine/menu.html) — sliding menu with credits scroll
- [HTML + CSS menu and in-game UI](https://maxi-jp.github.io/HTML5_Engine/menu-and-ui.html) — toggling upgrade panel with two-way data binding between HTML and canvas
