// #region Helper classes

class Color {
    _rgba = [0, 0, 0, 1];

    constructor(r, g, b, a=1) {
        this._r = r;
        this._g = g;
        this._b = b;
        this._a = a;
        this._rgba = [r, g, b, a];
        this.string = this.toString();
    }

    get r() {
        return this._rgba[0];
    }

    get g() {
        return this._rgba[1];
    }

    get b() {
        return this._rgba[2];
    }

    get a() {
        return this._rgba[3];
    }

    get rgba() {
        return this._rgba;
    }

    set r(value) {
        this._r = value;
        this._rgba[0] = value;
        this.string = this.toString();
    }

    set g(value) {
        this._g = value;
        this._rgba[1] = value;
        this.string = this.toString();
    }

    set b(value) {
        this._b = value;
        this._rgba[2] = value;
        this.string = this.toString();
    }

    set a(value) {
        this._a = value;
        this._rgba[3] = value;
        this.string = this.toString();
    }

    static Random() {
        return new Color(Math.random(), Math.random(), Math.random(), 1);
    }

    static Black() {
        return new Color(0, 0, 0, 1);
    }
    static White() {
        return new Color(1, 1, 1, 1);
    }
    static Red() {
        return new Color(1, 0, 0, 1);
    }
    static Green() {
        return new Color(0, 0.5, 0, 1);
    }
    static Blue() {
        return new Color(0, 0, 1, 1);
    }
    static Aqua() {
        return new Color(0, 1, 1, 1);
    }
    static Yellow() {
        return new Color(1, 1, 0, 1);
    }
    static Orange() {
        return new Color(1, 0.647, 0, 1);
    }
    static Pink() {
        return new Color(1, 0, 1, 1);
    }

    static black  = Color.Black();
    static white  = Color.White();
    static red    = Color.Red();
    static green  = Color.Green();
    static lime   = new Color(0, 1, 0, 1);
    static blue   = Color.Blue();
    static cyan   = new Color(0, 1, 1, 1);
    static aqua   = Color.Aqua();
    static yellow = Color.Yellow();
    static orange = Color.Orange();
    static pink   = Color.Pink();
    static purple = new Color(0.576, 0.439, 0.859, 1);
    static grey   = new Color(0.5, 0.5, 0.5, 1);
    static darkGrey  = new Color(0.663, 0.663, 0.663, 1);
    static lightGrey = new Color(0.827, 0.827, 0.827, 1);

    static Copy(color) {
        return new Color(color.r, color.g, color.b, color.a);
    }

    static FromRGB(r, g, b) {
        return new Color(r / 255, g / 255, b / 255);
    }

    static FromRGBA(r, g, b, a) {
        return new Color(r / 255, g / 255, b / 255, a);
    }

    static FromHex(hex) {
        let r = parseInt(hex.substring(1, 3), 16) / 255;
        let g = parseInt(hex.substring(3, 5), 16) / 255;
        let b = parseInt(hex.substring(5, 7), 16) / 255;
        return new Color(r, g, b);
    }

    static FromHexA(hex) {
        let r = parseInt(hex.substring(1, 3), 16) / 255;
        let g = parseInt(hex.substring(3, 5), 16) / 255;
        let b = parseInt(hex.substring(5, 7), 16) / 255;
        let a = parseInt(hex.substring(7, 9), 16) / 255;
        return new Color(r, g, b, a);
    }

    static FromString(color) {
        if (color.startsWith("#")) {
            if (color.length === 7) {
                return Color.FromHex(color);
            }
            else if (color.length === 9) {
                return Color.FromHexA(color);
            }
        }
        else if (color.startsWith("rgb")) {
            const values = color.match(/\d+/g).map(Number);
            if (color.startsWith("rgba")) {
                return Color.FromRGBA(values[0], values[1], values[2], values[3] / 255);
            } else {
                return Color.FromRGB(values[0], values[1], values[2]);
            }
        }
        else {
            return Color.FromRGB(...color.split(',').map(Number));
        }
    }

    static FromHTMLColorName(color) {
        return Color.FromString(HTMLColorNameToRGB(color));
    }

    static Lerp(from, to, step) {
        const stepMin1 = 1 - step;

        return new Color(
            (stepMin1 * from.r) + (step * to.r),
            (stepMin1 * from.g) + (step * to.g),
            (stepMin1 * from.b) + (step * to.b),
            (stepMin1 * from.a) + (step * to.a)
        );
    }

    Desaturate(desaturateValue=0.5) {
        const avg = (this.r + this.g + this.b) / 3;
        this.r = this.r + (avg - this.r) * desaturateValue;
        this.g = this.g + (avg - this.g) * desaturateValue;
        this.b = this.b + (avg - this.b) * desaturateValue;

        return this;
    }

    toString() {
        return `rgba(${this.r * 255}, ${this.g * 255}, ${this.b * 255}, ${this.a})`;
    }
}

class Sprite {
    _scale = new Vector2(1, 1);
    _flipX = false;
    _flipY = false;
    _computedScale = new Vector2(1, 1);

    constructor(img, position, rotation, scale, alpha=1.0) {
        this.img = img;
        // this.img.halfWidth = img.width / 2;
        // this.img.halfHeight = img.height / 2;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.alpha = alpha;
        
        this._computedScale = new Vector2(this._scale.x, this._scale.y);
        this._computedScale.x *= this._flipX ? -1 : 1;
        this._computedScale.y *= this._flipY ? -1 : 1;
    }

    get width() {
        return this.img.width;
    }
    get height() {
        return this.img.height;
    }
    get scale() {
        return this._scale;
    }
    get x() {
        return this.position.x;
    }
    get y() {
        return this.position.y;
    }
    get flipX() {
        return this._flipX;
    }
    get flipY() {
        return this._flipY;
    }

    set flipX(value) {
        if (this._flipX !== value) {
            this._flipX = value;
            this._computedScale.x = value ? -this._scale.x : this._scale.x;
        }
    }
    set flipY(value) {
        if (this._flipY !== value) {
            this._flipY = value;
            this._computedScale.y = value ? -this._scale.y : this._scale.y;
        }
    }

    set scale(scale) {
        if (typeof scale === "number") {
            this._scale = new Vector2(scale, scale);

            this._computedScale.Set(scale, scale);
            this._computedScale.x *= this._flipX ? -1 : 1;
            this._computedScale.y *= this._flipY ? -1 : 1;
        }
        else {
            this._scale = scale;

            this._computedScale.Set(scale.x, scale.y);
            this._computedScale.x *= this._flipX ? -1 : 1;
            this._computedScale.y *= this._flipY ? -1 : 1;
        }
    }

    Draw(renderer) {
        renderer.DrawImage(this.img, this.position.x, this.position.y, this._computedScale.x, this._computedScale.y, this.rotation, this.alpha);
    }

    DrawBasic(renderer) {
        renderer.DrawImageBasic(this.img, this.position.x, this.position.y, this.img.width * this.scale.x, this.img.height * this.scale.y, this.alpha);
    }
    
    DrawSection(renderer, sx, sy, sw, sh) {
        renderer.DrawImageSection(this.img, this.position.x, this.position.y, sx, sy, sw, sh, this._computedScale.x, this._computedScale.y, this.rotation, this.alpha);
    }

    DrawSectionBasic(sx, sy, sw, sh) {
        renderer.DrawImageSectionBasic(this.img, this.position.x, this.position.y, sx, sy, sw, sh, this._computedScale.x, this._computedScale.y, this.alpha);
    }

    DrawAt(renderer, x, y) {
        renderer.DrawImage(this.img, x, y, this._computedScale.x, this._computedScale.y, this.rotation, this.alpha);
    }

    DrawBasicAt(renderer, x, y) {
        renderer.DrawImageBasic(this.img, x, y, this.img.width * this.scale.x, this.img.height * this.scale.y, this.alpha);
    }
    
    DrawSectionAt(renderer, sx, sy, sw, sh, x, y) {
        renderer.DrawImageSection(this.img, x, y, sx, sy, sw, sh, this._computedScale.x, this._computedScale.y, this.rotation, this.alpha);
    }

    DrawSectionBasicAt(renderer, sx, sy, sw, sh, x, y) {
        renderer.DrawImageSectionBasic(this.img, x, y, sx, sy, sw, sh, this._computedScale.x, this._computedScale.y, this.alpha);
    }
}

class SpriteSection extends Sprite {
    constructor(img, position, rotation, scale, rect=new Rect(0, 0, img.width, img.height)) {
        super(img, position, rotation, scale);

        this.rect = rect;
    }

    Draw(renderer) {
        this.DrawSection(renderer, this.rect.x, this.rect.y, this.rect.w, this.rect.h);
    }

    DrawBasic(renderer) {
        this.DrawSectionBasic(renderer, this.rect.x, this.rect.y, this.rect.w, this.rect.h);
    }

    DrawAt(renderer, x, y) {
        this.DrawSectionAt(renderer, this.rect.x, this.rect.y, this.rect.w, this.rect.h, x, y);
    }

    DrawBasicAt(renderer, x, y) {
        this.DrawSectionBasicAt(renderer, this.rect.x, this.rect.y, this.rect.w, this.rect.h, x, y);
    }
}

class LinearGradient {
    constructor(renderer, x0, y0, x1, y1, colorStops=[]) {
        this.renderer = renderer;
        this.x0 = x0;
        this.y0 = y0;
        this.x1 = x1;
        this.y1 = y1;
        this.colorStops = [];
        this.webglTexture = null;

        colorStops.forEach(cs => this.AddColorStop(cs[0], cs[1]));

        if (renderer.ctx) {
            this.gradient = renderer.ctx.createLinearGradient(x0, y0, x1, y1);
            colorStops.forEach(cs => {
                this.gradient.addColorStop(cs[0], cs[1]);
            });
        }
        else if (renderer instanceof WebGLRenderer) {
            this.webglTexture = GradientRectShader.CreateGradientTexture(renderer.gl, this.colorStops);
        }
    }

    AddColorStop(offset, color) {
        this.colorStops.push({ offset, color: color });
    }

    SetColorStop(offsetId, color) {
        this.colorStops[offsetId].color = color;
        if (this.renderer.ctx) {
            this.gradient = renderer.ctx.createLinearGradient(this.x0, this.y0, this.x1, this.y1);
            this.colorStops.forEach(cs => {
                this.gradient.addColorStop(cs.offset, cs.color);
            });
        }
        else {
            if (this.webglTexture)
                GradientRectShader.CleanGradientTexture(this.renderer.gl, this.webglTexture);

            this.webglTexture = GradientRectShader.CreateGradientTexture(this.renderer.gl, this.colorStops);
        }
    }
}

class RadialGradient {
    // TODO refactor this class to work with the new renderers
    constructor(x0, y0, r0, x1, y1, r1, colorStops) {
        this.gradient = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
        colorStops.forEach(colorStop => {
            this.addColorStop(colorStop[0], colorStop[1]);
        });
    }

    addColorStop(offset, color) {
        this.gradient.addColorStop(offset, color);
    }
}

class Rectangle {
    constructor(position, width, height, color=Color.Black(), stroke=false, lineWidth=1) {
        this.position = position;
        this.width = width;
        this.height = height;
        this.color = color;
        this.stroke = stroke;
        this.lineWidth = lineWidth;
    }

    Draw(renderer) {
        renderer.DrawRectangle(this.position.x, this.position.y, this.width, this.height, this.color, this.stroke, this.lineWidth);
    }
}

class Circle {
    constructor(position, radius, color, stroke=false, lineWidth=1) {
        this.position = position;
        this.radius = radius;
        this.color = color;
        this.stroke = stroke;
        this.lineWidth = lineWidth;
    }

    Draw(renderer) {
        renderer.DrawCircle(this.position.x, this.position.y, this.radius, this.color, this.stroke, this.lineWidth);
    }
}

class TextLabel {
    constructor(text, position, font, color="black", align="center", baseline="bottom", stroke=false, lineWidth=1) {
        this.text = text;
        this.position = position;
        this.font = font;
        this.color = color;
        this.align = align;
        this.baseline = baseline;
        this.stroke = stroke;
        this.lineWidth = lineWidth;
    }

    Draw(renderer) {
        renderer.DrawText(this.text, this.position.x, this.position.y, this.font, this.color, this.align, this.baseline, this.stroke, this.lineWidth);
    }
}

class TextLabelFillAndStroke {
    constructor(text, position, font, fillColor="white", strokeColor="black", align="center", baseline="bottom") {
        this.text = text;
        this.position = position;
        this.font = font;
        this.fillColor = fillColor;
        this.strokeColor = strokeColor;
        this.align = align;
        this.baseline = baseline;
    }

    Draw(renderer) {
        renderer.DrawFillText(this.text, this.position.x, this.position.y, this.font, this.fillColor, this.align, this.baseline);
        renderer.DrawStrokeText(this.text, this.position.x, this.position.y, this.font, this.strokeColor, this.align, this.baseline);
    }
}

// #endregion

// #region Collider classes
class CollisionManager {
    /**
     * Checks for collision between two Collider objects.
     * Dispatches to specific collision functions based on collider types.
     * @param {Collider} colliderA The first collider.
     * @param {Collider} colliderB The second collider.
     * @returns {boolean} True if a collision is detected, false otherwise.
     */
    static Check(colliderA, colliderB) {
        // Circle-Circle collision
        if (colliderA instanceof CircleCollider && colliderB instanceof CircleCollider) {
            return CollisionManager.CheckCircleCircle(colliderA, colliderB);
        }
        // Rectangle-Rectangle collision (Axis-Aligned Bounding Box)
        else if (colliderA instanceof RectangleCollider && colliderB instanceof RectangleCollider) {
            return CollisionManager.CheckRectRect(colliderA, colliderB);
        }
        // Circle-Rectangle collision
        else if (colliderA instanceof CircleCollider && colliderB instanceof RectangleCollider) {
            return CollisionManager.CheckCircleRect(colliderA, colliderB);
        }
        // Rectangle-Circle collision (swap order for consistency)
        else if (colliderA instanceof RectangleCollider && colliderB instanceof CircleCollider) {
            return CollisionManager.CheckCircleRect(colliderB, colliderA);
        }
        // Polygon collisions (and rotated rectangles) are more complex and typically require
        // advanced algorithms like the Separating Axis Theorem (SAT).
        // These are not implemented in this basic CollisionManager.
        else if (colliderA instanceof PolygonCollider || colliderB instanceof PolygonCollider) {
            // console.warn("Collision detection for PolygonCollider (or rotated rectangles) requires advanced algorithms like SAT, which are not implemented in this basic CollisionManager.");
            console.warn("Unsuported colision type (PolygonCollider).")
            return false; // Currently unsupported for detailed narrow-phase
        }
        return false; // Unknown or unsupported collider types
    }

    /**
     * Checks for collision between two CircleCollider objects.
     * @param {CircleCollider} circleA The first circle collider.
     * @param {CircleCollider} circleB The second circle collider.
     * @returns {boolean} True if circles overlap, false otherwise.
     */
    static CheckCircleCircle(circleA, circleB) {
        // Uses the pre-calculated squared bounding radius from Collider base class
        return CheckCollisionTwoCircles(circleA.position, circleA.boundingRadius, circleB.position, circleB.boundingRadius);
    }

    /**
     * Checks for collision between two RectangleCollider objects (Axis-Aligned).
     * @param {RectangleCollider} rectA The first rectangle collider.
     * @param {RectangleCollider} rectB The second rectangle collider.
     * @returns {boolean} True if rectangles overlap, false otherwise.
     */
    static CheckRectRect(rectA, rectB) {
        return CheckCollisionTwoRects(rectA.rect, rectB.rect);
    }

    /**
     * Checks for collision between a CircleCollider and a RectangleCollider (Axis-Aligned).
     * @param {CircleCollider} circle The circle collider.
     * @param {RectangleCollider} rect The rectangle collider.
     * @returns {boolean} True if they overlap, false otherwise.
     */
    static CheckCircleRect(circle, rect) {
        return CheckCollisionCircleRect(circle, rect.rect);
    }
}

class Collider {
    static defaultColor   = new Color(1, 0, 0, 0.2); // Red for no collision
    static collisionColor = new Color(0, 1, 0, 0.2); // Green for collision

    static nextColliderId = 0; // for unique IDs

    _go;

    constructor(position, boundingRadius, gameObject=null) {
        this.position = position;
        this.boundingRadius = boundingRadius;
        this.boundingRadius2 = this.boundingRadius * this.boundingRadius;
        this.isColliding = false;

        this.color = Collider.defaultColor;

        this.id = Collider.nextColliderId++;

        if (gameObject)
            this._go = gameObject;
    }

    get go() {
        return this._go;
    }
    get gameObject() {
        return this._go;
    }

    get x() {
        return this.position.x;
    }

    get y() {
        return this.position.y;
    }

    set x(value) {
        this.position.x = value;
    }

    set y(value) {
        this.position.y = value;
    }

    Draw(renderer) { }

    UpdatePosition(newPosition) {
        this.position.Set(newPosition.x, newPosition.y);
    }
}

class RectangleCollider extends Collider {
    constructor(position, width, height) {
        // Pass a callback to update rect when position changes
        const onChange = (vec) => {
            this.rect.x = vec.x - this.rect.halfWidth;
            this.rect.y = vec.y - this.rect.halfHeight;
        };
        const pos = new Vector2(position.x, position.y, onChange);
        const boundingRadius = Math.sqrt(width * width + height * height) / 2;

        super(pos, boundingRadius);
        this.rect = new Rect(position.x - width / 2, position.y - height / 2, width, height);
    }

    Draw(renderer) {
        renderer.DrawFillCircle(this.position.x, this.position.y, this.boundingRadius, this.color);
        
        renderer.DrawFillRectangle(this.rect.x, this.rect.y, this.rect.w, this.rect.h, this.color);
    }
}

class CircleCollider extends Collider {
    constructor(position, radius) {
        super(position, radius);
        this.radius = radius;
    }

    Draw(renderer) {
        renderer.DrawFillCircle(this.position.x, this.position.y, this.radius, this.color);
    }
}

class PolygonCollider extends Collider {
    constructor(position, rotation, points) {
        super(position, 0);
        this.rotation = rotation;
        this.points = points;
        this.transformedPoints = new Array(this.points.lenght);
        for (let i = 0; i < this.points.length; i++) {
            this.transformedPoints[i] = Vector2.Copy(this.points[i]);
        }
        this._calculateBoundingRadius();
    }

    _calculateBoundingRadius() {
        let maxDistSq = 0;
        for (const p of this.points) {
            const distSq = SqrLength(p); // Distance from origin (0,0) of the polygon's local points
            if (distSq > maxDistSq)
                maxDistSq = distSq;
        }

        this.boundingRadius = Math.sqrt(maxDistSq);
        this.boundingRadius2 = maxDistSq;
    }

    UpdatePosition(newPosition) {
        super.UpdatePosition(newPosition);

        for (let i = 0; i < this.points.length; i++) {
            this.transformedPoints[i].Set(this.points[i].x + newPosition.x, this.points[i].y + newPosition.y);
        }
    }

    UpdatePositionAndRotation(newPosition, newRotation) {
        this.position.Set(newPosition.x, newPosition.y);
        this.rotation = newRotation;

        for (let i = 0; i < this.points.length; i++) {
            this.transformedPoints[i].Set(this.points[i].x + newPosition.x, this.points[i].y + newPosition.y);
            RotatePointAroundPoint(this.transformedPoints[i], newPosition, this.rotation, this.transformedPoints[i]);
        }
    }

    Draw(renderer) {
        renderer.DrawPolygon(this.transformedPoints, this.color);
    }
}

// #endregion

// #region HelperCTXFunctions
// TODO delete these functions (already impelemnted on the renderer)

function DrawRectangle(ctx, x, y, width, height, color, stroke=false, lineWidth=1) {
    // TODO moved to the renderer: delete it
    if (stroke) {
        DrawStrokeRectangle(ctx, x, y, width, height, color, lineWidth);
    }
    else {
        DrawFillRectangle(ctx, x, y, width, height, color);
    }
}

function DrawFillRectangle(ctx, x, y, width, height, color) {
    // TODO moved to the renderer: delete it
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function DrawStrokeRectangle(ctx, x, y, width, height, color, lineWidth=1) {
    // TODO moved to the renderer: delete it
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x, y, width, height);
}

function DrawText(ctx, text, x, y, font, color="black", align="center", baseline="alphabetic", stroke=false) {
    // TODO delete it, already done in the renderer
    if (stroke) {
        DrawStrokeText(ctx, text, x, y, font, color, align, baseline);
    }
    else {
        DrawFillText(ctx, text, x, y, font, color, align, baseline);
    }
}

function DrawFillText(ctx, text, x, y, font, color="black", align="center", baseline="alphabetic") {
    // TODO delete it, already done in the renderer
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

function DrawStrokeText(ctx, text, x, y, font, color="black", align="center", baseline="alphabetic") {
    // TODO delete it, already done in the renderer
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.strokeStyle = color;
    ctx.strokeText(text, x, y);
}

function DrawSegment(ctx, x1, y1, x2, y2, color, lineWidth=1) {
    // TODO delete it, already done in the renderer
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function DrawPolygon(ctx, coordinates, strokeColor="black", lineWidth=1, fill=false, fillColor="black") {
    // TODO delete it, already done in the renderer
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(coordinates[0].x, coordinates[0].y);
    for (let i = 1; i < coordinates.length; i++) {
        ctx.lineTo(coordinates[i].x, coordinates[i].y);
    }
    ctx.closePath();
    if (fill) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    ctx.stroke();
}

function DrawFillCircle(ctx, x, y, radius, color) {
    // TODO delete it, already done in the renderer
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, PI2, false);
    ctx.fill();
    ctx.closePath();
}

function DrawStrokeCircle(ctx, x, y, radius, color, lineWidth=1) {
    // TODO delete it, already done in the renderer
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, PI2, false);
    ctx.stroke();
    ctx.closePath();
}

function DrawCircle(ctx, x, y, radius, color, stroke=false, lineWidth=1) {
    // TODO delete it, already done in the renderer
    if (stroke) {
        DrawStrokeCircle(ctx, x, y, radius, color, lineWidth);
    }
    else {
        DrawFillCircle(ctx, x, y, radius, color);
    }
}

// #endregion

// #region other helper functions

// Given a color HTML name return the RGB value ('red' -> 'rgba(255, 0, 0, 1)')
function HTMLColorNameToRGB(color) {
    // Create a temporary element to use getComputedStyle for converting named colors to RGB
    const element = document.createElement('div');
    element.style.color = color;

    document.body.appendChild(element); // append temporarily

    // Get the computed color in RGB format
    const computedColor = window.getComputedStyle(element).color;

    document.body.removeChild(element);

    if (!computedColor) {
        console.warn(`Unable to transform color "${color}".`);
        return color;
    }

    return computedColor;
}

// Given a color return a desaturated version of it
function DesaturateColor(color, desaturateValue=0.5) {
    const rgb = this.HTMLColorNameToRGB(color);
  
    if (!rgb || rgb === 'rgba(0, 0, 0, 0)') {
        console.warn(`Unable to desaturate color "${color}".`);
        return color;
    }

    // Extract RGB values from the computed color string 'rgb(r, g, b)'
    const rgbValues = rgb.match(/\d+/g).map(Number);
    const [r, g, b] = rgbValues;

    // Calculate the luminance (average of the RGB channels)
    const avg = (r + g + b) / 3;
  
    // Adjust each RGB channel towards the average (this is the desaturation step)
    const newR = Math.round(r + (avg - r) * desaturateValue);
    const newG = Math.round(g + (avg - g) * desaturateValue);
    const newB = Math.round(b + (avg - b) * desaturateValue);
  
    // Return the desaturated color in RGB format
    return `rgb(${newR}, ${newG}, ${newB})`;
}

function GetCanvasAbsolutePosition() {
    const rect = canvas.getBoundingClientRect();
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    return {
        x: rect.left + scrollLeft,
        y: rect.top + scrollTop
    };
}

// #endgerion