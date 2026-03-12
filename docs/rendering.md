# Rendering

The engine exposes a global `renderer` object (either `Canvas2DRenderer` or `WebGLRenderer`) that is passed to every `Draw()` method. All drawing is done through this object — you never touch the Canvas API directly.

## Canvas2D vs WebGL

By default the engine creates a **Canvas2DRenderer**. Appending `?webgl` to the URL switches it to **WebGLRenderer** (WebGL2, falling back to WebGL1). Both implementations share the same API, so your game code is identical in either mode.

```javascript
// URL: mygame.html          → Canvas2DRenderer
// URL: mygame.html?webgl    → WebGLRenderer
```

The active renderer is available as `this.renderer` inside any `Game` subclass, and as the global `renderer` everywhere else.

---

## Key Properties

| Property | Type | Description |
|---|---|---|
| `width` | `number` | Canvas width in pixels |
| `height` | `number` | Canvas height in pixels |
| `halfWidth` | `number` | `width / 2` (convenience shortcut) |
| `halfHeight` | `number` | `height / 2` (convenience shortcut) |
| `imageSmoothingEnabled` | `boolean` | Bilinear filtering on images. Set `false` for pixel art |
| `fillScreen` | `boolean` | Setter — enables/disables fill-window mode |

> These are the same values surfaced on the `Game` class as `this.screenWidth`, `this.screenHeight`, etc.

---

## Primitives

### Lines & Polygons

```javascript
Draw(renderer) {
    // Line from (x1,y1) to (x2,y2)
    renderer.DrawLine(0, 0, 200, 200, Color.red, 2);

    // Closed polygon (fill + stroke)
    renderer.DrawPolygon(
        [{ x: 100, y: 50 }, { x: 150, y: 150 }, { x: 50, y: 150 }],
        Color.white,   // stroke color
        1,             // line width
        true,          // fill?
        Color.FromHex('#4488ff')  // fill color
    );
}
```

| Method | Signature |
|---|---|
| `DrawLine` | `(x1, y1, x2, y2, color, lineWidth=1)` |
| `DrawPolygon` | `(points, strokeColor, lineWidth=1, fill=false, fillColor)` |

---

### Rectangles

Two families:

- **Regular** — centered on `(x, y)`, supports rotation and pivot. Use for game-world objects.
- **Basic** — top-left corner at `(x, y)`, no rotation. Use for UI, backgrounds, HUDs.

```javascript
Draw(renderer) {
    // Centered fill rectangle (supports rotation)
    renderer.DrawFillRectangle(
        this.screenHalfWidth, this.screenHalfHeight, // center position
        200, 100,           // width, height
        Color.blue,
        this.rotation,      // rotation in radians
        this.pivot          // Vector2 pivot offset
    );

    // Centered stroke rectangle
    renderer.DrawStrokeRectangle(100, 100, 80, 80, Color.white, 2, 0, coord);

    // Basic fill (top-left anchor — fast, no transform)
    renderer.DrawFillBasicRectangle(0, 0, this.screenWidth, this.screenHeight, Color.black);

    // Basic stroke (top-left anchor)
    renderer.DrawStrokeBasicRectangle(10, 10, 200, 50, Color.red, 1);
}
```

| Method | Signature |
|---|---|
| `DrawFillRectangle` | `(x, y, w, h, color, rot=0, pivot=coord)` |
| `DrawStrokeRectangle` | `(x, y, w, h, color, lineWidth=1, rot=0, pivot=coord)` |
| `DrawRectangle` | `(x, y, w, h, color, stroke=false, lineWidth=1, rot=0, pivot=coord)` |
| `DrawFillBasicRectangle` | `(x, y, w, h, color)` |
| `DrawStrokeBasicRectangle` | `(x, y, w, h, color, lineWidth=1)` |
| `DrawBasicRectangle` | `(x, y, w, h, color, stroke=false, lineWidth=1)` |

> `coord` is the engine's default zero-pivot constant `{ x: 0, y: 0 }`.

---

### Circles

```javascript
Draw(renderer) {
    renderer.DrawFillCircle(this.x, this.y, this.radius, Color.green);
    renderer.DrawStrokeCircle(this.x, this.y, this.radius + 4, Color.white, 1);
}
```

| Method | Signature |
|---|---|
| `DrawFillCircle` | `(x, y, radius, color)` |
| `DrawStrokeCircle` | `(x, y, radius, color, lineWidth=1)` |
| `DrawCircle` | `(x, y, radius, color, stroke=false, lineWidth=1)` |

---

## Text

```javascript
Draw(renderer) {
    // Filled text
    renderer.DrawFillText("Score: 0", 400, 20, "16px Arial", Color.white, "center", "top");

    // Stroked text
    renderer.DrawStrokeText("GAME OVER", 400, 240, "48px Impact", Color.black, "center", "middle", 2);

    // Combined (stroke=true adds an outline)
    renderer.DrawText("Hello", x, y, font, color, align, baseline, stroke=false, lineWidth=1);
}
```

| Parameter | Values |
|---|---|
| `align` | `"left"`, `"center"`, `"right"`, `"start"`, `"end"` |
| `baseline` | `"top"`, `"middle"`, `"alphabetic"`, `"bottom"` |

| Method | Signature |
|---|---|
| `DrawFillText` | `(text, x, y, font, color, align="center", baseline="alphabetic")` |
| `DrawStrokeText` | `(text, x, y, font, color, align="center", baseline="alphabetic", lineWidth=1)` |
| `DrawText` | `(text, x, y, font, color, align, baseline, stroke=false, lineWidth=1)` |

---

## Images

### `DrawImageBasic` — simple top-left draw

The fastest way to draw a full image. Position is the **top-left corner**.

```javascript
Draw(renderer) {
    renderer.DrawImageBasic(this.graphicAssets.bg.img, 0, 0);

    // Optional: override the draw size (stretches/crops)
    renderer.DrawImageBasic(img, x, y, w, h, alpha);
}
```

Signature: `DrawImageBasic(img, x, y, w=img.width, h=img.height, alpha=1.0)`

---

### `DrawImage` — scaled, rotated, centered

Draws an image centered on `(x, y)` with full transform support.

```javascript
Draw(renderer) {
    renderer.DrawImage(
        this.img,          // HTMLImageElement
        this.x, this.y,    // center position
        this.scaleX,       // horizontal scale
        this.scaleY,       // vertical scale
        this.rotation,     // rotation in radians
        this.pivot,        // Vector2 pivot offset
        1.0                // alpha (0–1)
    );
}
```

Signature: `DrawImage(img, x, y, scaleX, scaleY, rot=0, pivot=coord, alpha=1.0)`

> `SpriteObject` uses this internally — most of the time you won't call it directly.

---

### `DrawImageSection` — sprite-sheet crop

Draws a rectangular region of an image (e.g. one frame from a sprite sheet), centered on `(x, y)`.

```javascript
Draw(renderer) {
    const frameX = this.currentFrame * this.frameWidth;

    renderer.DrawImageSection(
        this.sheet,        // full sprite sheet image
        this.x, this.y,    // center position
        frameX, 0,         // source x, y in the sheet
        this.frameWidth,   // source width
        this.frameHeight,  // source height
        1, 1,              // scaleX, scaleY
        this.rotation,
        coord,             // pivot
        1.0                // alpha
    );
}
```

Signature: `DrawImageSection(img, x, y, sx, sy, sw, sh, scaleX, scaleY, rot=0, pivot=coord, alpha=1.0)`

> `SSAnimationObjectBasic` and `SSAnimationObjectComplex` use this internally.

---

### `DrawImageSectionBasic` — sprite-sheet crop, top-left

Like `DrawImageSection` but with a **top-left anchor** and no rotation.

```javascript
renderer.DrawImageSectionBasic(sheet, x, y, sx, sy, sw, sh, scaleX, scaleY, alpha);
```

---

## Gradient Rectangles

Use a `LinearGradient` object to fill a rectangle with a smooth color transition. The gradient works in both Canvas2D and WebGL.

```javascript
Start() {
    // direction: Vector2(0, 1) = top → bottom
    this.bgGradient = new LinearGradient(this.renderer, new Vector2(0, 1), [
        [0.0,  Color.FromHex('#040311')],
        [0.05, Color.Black()],
        [1.0,  Color.FromHex('#1a0050')]
    ]);
}

Draw(renderer) {
    renderer.DrawGradientRectangle(0, 0, this.screenWidth, this.screenHeight, this.bgGradient);
}
```

### `LinearGradient` constructor

```javascript
new LinearGradient(renderer, direction, colorStops)
```

| Parameter | Description |
|---|---|
| `renderer` | Pass `this.renderer` |
| `direction` | `Vector2` — normalized direction vector (e.g. `(0,1)` for vertical, `(1,0)` for horizontal) |
| `colorStops` | Array of `[offset, Color]` pairs where offset is `0.0`–`1.0` |

### `LinearGradient` methods

| Method | Description |
|---|---|
| `AddColorStop(offset, color)` | Add a new color stop |
| `SetColorStop(index, color)` | Update an existing stop's color (useful for animated gradients) |

---

## Camera Transform

Wrap a section of your `Draw()` call between `ApplyCameraTransform` and `RestoreCameraTransform` to apply a camera's world offset to everything drawn in between. This is handled automatically when you add a `Camera` or `FollowCameraBasic` object to the game.

```javascript
Draw(renderer) {
    // World objects — affected by the camera
    renderer.ApplyCameraTransform(this.camera);
    for (const obj of this.worldObjects) {
        obj.Draw(renderer);
    }
    renderer.RestoreCameraTransform();

    // HUD — drawn in screen space, not affected by camera
    renderer.DrawFillText(`Score: ${this.score}`, 10, 10, "16px Arial", Color.white, "left");
}
```

| Method | Signature |
|---|---|
| `ApplyCameraTransform` | `(camera)` — translates the canvas by `-camera.x, -camera.y` |
| `RestoreCameraTransform` | `()` — restores previous transform state |

---

## Fill Window

The renderer can expand to fill the browser window at runtime. This is usually configured once via the `Game` config, but can also be toggled programmatically.

```javascript
// In your Game constructor — configure via config:
this.Configure({
    fillWindow: true,
    matchNativeResolution: true, // resize canvas pixels to match window size
    preserveAspectRatio: true,   // letterbox if aspect differs
    useDevicePixelRatio: false   // HiDPI / retina scaling
});
```

Or control it at runtime:

```javascript
// Enable fill window with full options
this.renderer.SetCanvasFillWindow(
    matchNativeResolution, // true = resize canvas pixels; false = stretch CSS only
    useDevicePixelRatio,   // true = scale by window.devicePixelRatio
    preserveAspectRatio    // true = letterbox; false = stretch to fit
);

// Restore to original canvas size
this.renderer.RestoreCanvasOriginalSize();

// Toggle via property setter
this.renderer.fillScreen = true;  // calls SetCanvasFillWindow with stored options
this.renderer.fillScreen = false; // calls RestoreCanvasOriginalSize
```

### Fill window options explained

| Option | `true` | `false` |
|---|---|---|
| `matchNativeResolution` | Canvas pixel size = window size (crisp, uses more memory) | Canvas stays at original size, CSS scales it |
| `preserveAspectRatio` | Letterbox — fit within window keeping ratio | Stretch to fill entire window |
| `useDevicePixelRatio` | Scale by `devicePixelRatio` for HiDPI/retina | Use CSS pixels only |

> When `fillScreen` is active, the engine fires `game.WindowResized()` on every browser resize. Override it in your `Game` subclass to reposition UI elements.

---

## Full API Reference

| Method | Description |
|---|---|
| `Clear()` | Clear the entire canvas each frame |
| `DrawLine(x1,y1,x2,y2,color,lineWidth)` | Draw a line segment |
| `DrawPolygon(points,strokeColor,lineWidth,fill,fillColor)` | Draw a closed polygon |
| `DrawFillRectangle(x,y,w,h,color,rot,pivot)` | Centered filled rectangle |
| `DrawStrokeRectangle(x,y,w,h,color,lineWidth,rot,pivot)` | Centered stroked rectangle |
| `DrawFillBasicRectangle(x,y,w,h,color)` | Top-left filled rectangle (fast) |
| `DrawStrokeBasicRectangle(x,y,w,h,color,lineWidth)` | Top-left stroked rectangle (fast) |
| `DrawFillCircle(x,y,radius,color)` | Filled circle |
| `DrawStrokeCircle(x,y,radius,color,lineWidth)` | Stroked circle |
| `DrawFillText(text,x,y,font,color,align,baseline)` | Filled text |
| `DrawStrokeText(text,x,y,font,color,align,baseline,lineWidth)` | Stroked text |
| `DrawImage(img,x,y,scaleX,scaleY,rot,pivot,alpha)` | Centered image with full transform |
| `DrawImageBasic(img,x,y,w,h,alpha)` | Top-left image, no transform |
| `DrawImageSection(img,x,y,sx,sy,sw,sh,scaleX,scaleY,rot,pivot,alpha)` | Sprite-sheet crop, centered |
| `DrawImageSectionBasic(img,x,y,sx,sy,sw,sh,scaleX,scaleY,alpha)` | Sprite-sheet crop, top-left |
| `DrawGradientRectangle(x,y,w,h,gradient)` | Fill rectangle with `LinearGradient` |
| `ApplyCameraTransform(camera)` | Push camera offset transform |
| `RestoreCameraTransform()` | Pop camera offset transform |
| `SetScreenSize(width,height)` | Resize canvas to given dimensions |
| `SetCanvasFillWindow(matchNative,usePixelRatio,preserveAspect)` | Enable fill-window mode |
| `RestoreCanvasOriginalSize()` | Exit fill-window mode |
