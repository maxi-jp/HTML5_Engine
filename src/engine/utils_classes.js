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
    static Transparent() {
        return new Color(0, 0, 0, 0);
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
    static transparent = Color.Transparent();

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

        this.pivot = { x: 0, y: 0 };
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
        renderer.DrawImage(this.img, this.position.x, this.position.y, this._computedScale.x, this._computedScale.y, this.rotation, this.pivot, this.alpha);
    }

    DrawBasic(renderer) {
        renderer.DrawImageBasic(this.img, this.position.x + this.pivot.x, this.position.y + this.pivot.y, this.img.width * this.scale.x, this.img.height * this.scale.y, this.alpha);
    }
    
    DrawSection(renderer, sx, sy, sw, sh) {
        renderer.DrawImageSection(this.img, this.position.x, this.position.y, sx, sy, sw, sh, this._computedScale.x, this._computedScale.y, this.rotation, this.pivot, this.alpha);
    }

    DrawSectionBasic(renderer, sx, sy, sw, sh) {
        renderer.DrawImageSectionBasic(this.img, this.position.x + this.pivot.x, this.position.y + this.pivot.y, sx, sy, sw, sh, this._computedScale.x, this._computedScale.y, this.alpha);
    }

    DrawAt(renderer, x, y) {
        renderer.DrawImage(this.img, x, y, this._computedScale.x, this._computedScale.y, this.rotation, this.pivot, this.alpha);
    }

    DrawBasicAt(renderer, x, y) {
        renderer.DrawImageBasic(this.img, x, y, this.img.width * this.scale.x, this.img.height * this.scale.y, this.alpha);
    }
    
    DrawSectionAt(renderer, sx, sy, sw, sh, x, y) {
        renderer.DrawImageSection(this.img, x, y, sx, sy, sw, sh, this._computedScale.x, this._computedScale.y, this.rotation, this.pivot, this.alpha);
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
    constructor(renderer, direction, colorStops=[]) {
        this.renderer = renderer;
        this.direction = direction.Normalize();
        this.angle = this.direction.Angle();
        this.colorStops = [];

        // for 2d ctx
        this.gradient = null;

        // for WebGL
        this.gradientStart = Vector2.Zero();
        this.gradientEnd = Vector2.Zero();
        this.webglTexture = null;

        this.lastX = 0;
        this.lastY = 0;
        this.lastW = 0;
        this.lastH = 0;

        colorStops.forEach(cs => this.AddColorStop(cs[0], cs[1]));

        if (this.renderer.ctx) {
            this.gradient = renderer.ctx.createLinearGradient(0, 0, 0, 0);
            colorStops.forEach(cs => {
                this.gradient.addColorStop(cs[0], cs[1].toString());
            });
        }
        else if (this.renderer instanceof WebGLRenderer) {
            this.webglTexture = GradientRectShader.CreateGradientTexture(renderer.gl, this.colorStops);
        }
    }

    UpdateSize(x, y, w, h) {
        if (this.lastX === x && this.lastY === y && this.lastW === w && this.lastH === h) {
            return;
        }

        this.lastX = x;
        this.lastY = y;
        this.lastW = w;
        this.lastH = h;

        const cx = x + w / 2;
        const cy = y + h / 2;
        const dx = this.direction.x;
        const dy = this.direction.y;

        // Calculate the projected half-length of the rectangle's diagonal onto the gradient direction
        const halfLength = (Math.abs(w * dx) + Math.abs(h * dy)) / 2;

        const x0 = cx - halfLength * dx;
        const y0 = cy - halfLength * dy;
        const x1 = cx + halfLength * dx;
        const y1 = cy + halfLength * dy;

        if (this.renderer.ctx) {
            this.gradient = this.renderer.ctx.createLinearGradient(x0, y0, x1, y1);
            this.colorStops.forEach(cs => {
                this.gradient.addColorStop(cs.offset, cs.color.toString());
            });
        }
        else if (this.renderer instanceof WebGLRenderer) {
            this.gradientStart.Set(x0, y0);
            this.gradientEnd.Set(x1, y1);
        }
    }

    AddColorStop(offset, color) {
        this.colorStops.push({ offset, color: color });
    }

    SetColorStop(offsetId, color) {
        this.colorStops[offsetId].color = color;
        if (this.renderer.ctx) {
            // Recalculate gradient with the last known dimensions to update colors
            const cx = this.lastX + this.lastW / 2;
            const cy = this.lastY + this.lastH / 2;
            const dx = this.direction.x;
            const dy = this.direction.y;

            // Calculate the projected half-length of the rectangle's diagonal onto the gradient direction
            const halfLength = (Math.abs(this.lastW * dx) + Math.abs(this.lastH * dy)) / 2;

            const x0 = cx - halfLength * dx;
            const y0 = cy - halfLength * dy;
            const x1 = cx + halfLength * dx;
            const y1 = cy + halfLength * dy;

            this.gradient = this.renderer.ctx.createLinearGradient(x0, y0, x1, y1);

            this.colorStops.forEach(cs => {
                this.gradient.addColorStop(cs.offset, cs.color.toString());
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
        this.pivot = { x: -width/2, y: -height/2 };
    }

    Draw(renderer) {
        renderer.DrawRectangle(this.position.x, this.position.y, this.width, this.height, this.color, this.stroke, this.lineWidth, 0, this.pivot);
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
        this._text = text;
        this._font = font;
        this._color = color;

        this.position = position;
        this.align = align;
        this.baseline = baseline;
        this.stroke = stroke;
        this.lineWidth = lineWidth;

        this._textureNeedsUpdate = true; // Flag to indicate if texture needs re-rendering
        this._webglTexture = null;

        if (renderer instanceof WebGLRenderer) {
            this._webglTexture = renderer.CreateTextTexture();
        }

        this._textureWidth = 0;
        this._textureHeight = 0;
        this._textureX = 0;
        this._textureY = 0;
    }

    get text() {
        return this._text;
    }
    get font() {
        return this._font;
    }
    get color() {
        return this._color;
    }

    set text(value) {
        if (this._text !== value) {
            this._text = value;
            this._textureNeedsUpdate = true;
        }
    }

    set font(value) {
        if (this._font !== value) {
            this._font = value;
            this._textureNeedsUpdate = true;
        }
    }

    set color(value) {
        if (this._color !== value) {
            this._color = value;
            this._textureNeedsUpdate = true;
        }
    }

    Draw(renderer) {
        // Only update texture if text, font, color, etc. changed, or if explicitly flagged
        if (renderer instanceof WebGLRenderer) {
            if (this._textureNeedsUpdate) {
                const { width, height, x: tx, y: ty } = renderer.PrepareText(this._text, this.position.x, this.position.y, this._font, this._color, this.align, this.baseline, this.stroke, this.lineWidth);

                if (!this._webglTexture) {
                    this._webglTexture = renderer.CreateTextTexture();
                }

                renderer.gl.bindTexture(renderer.gl.TEXTURE_2D, this._webglTexture);
                renderer.gl.texImage2D(renderer.gl.TEXTURE_2D, 0, renderer.gl.RGBA, renderer.gl.RGBA, renderer.gl.UNSIGNED_BYTE, renderer.textCanvas);
                
                this._textureWidth = width;
                this._textureHeight = height;
                this._textureX = tx;
                this._textureY = ty;

                this._textureNeedsUpdate = false; // Mark as updated
            }

            renderer.DrawTextCached(this._webglTexture, this._textureX, this._textureY, this._textureWidth, this._textureHeight);
        }
        else {
            renderer.DrawText(this._text, this.position.x, this.position.y, this._font, this._color, this.align, this.baseline, this.stroke, this.lineWidth);
        }
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
        // Circle-Polygon collision
        else if (colliderA instanceof CircleCollider && colliderB instanceof PolygonCollider) {
            return CheckCollisionCirclePolygon(colliderA.position, colliderA.boundingRadius, colliderB.transformedPoints);
        }
        // Polygon-Circle collision (swap order for consistency)
        else if (colliderA instanceof PolygonCollider && colliderB instanceof CircleCollider) {
            return CheckCollisionCirclePolygon(colliderB.position, colliderB.boundingRadius, colliderA.transformedPoints);
        }
        // Polygon-Rectangle collision
        else if (colliderA instanceof PolygonCollider && colliderB instanceof RectangleCollider) {
            return CheckCollisionPolygonPolygon(colliderA.transformedPoints, colliderB.rect.points, false);
        }
        // Rectangle-Polygon collision
        else if (colliderA instanceof RectangleCollider && colliderB instanceof PolygonCollider) {
            return CheckCollisionPolygonPolygon(colliderB.transformedPoints, colliderA.rect.points, false);
        }
        // Polygon-Polygon collision
        else if (colliderA instanceof PolygonCollider && colliderB instanceof PolygonCollider) {
            return CheckCollisionPolygonPolygon(colliderA.transformedPoints, colliderB.transformedPoints, false);
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
    static bRAdColor = new Color(0, 0, 0, 0.1); // grey transparent for the bounding radius

    static nextColliderId = 0; // for unique IDs

    _go;

    constructor(position, boundingRadius, gameObject=null) {
        this.boundingRadius = boundingRadius;
        this.boundingRadius2 = this.boundingRadius * this.boundingRadius;
        this.isColliding = false;

        this.color = Collider.defaultColor;

        this.id = Collider.nextColliderId++;

        if (gameObject) {
            this._go = gameObject;
            this.positionOffset = Vector2.Copy(position);
            this.position = position;
        }
        else {
            this.position = position;
        }

        this.onCollisionEnterCallback = null;
        this.onCollisionExitCallback = null;
        this.onClickCallback = null;
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

    set go(value) {
        this._go = value;
        if (!this.positionOffset)
            this.positionOffset = Vector2.Zero();
    }
    set gameObject(value) {
        this._go = value;
        if (!this.positionOffset)
            this.positionOffset = Vector2.Zero();
    }

    Draw(renderer) { }

    UpdateFromGO() {
        this.position.Set(this._go.position.x + this.positionOffset.x, this._go.position.y + this.positionOffset.y);
    }

    UpdatePosition(newPosition) {
        this.position.Set(newPosition.x, newPosition.y);
    }
    
    OnCollisionEnter(otherCollider) {
        if (this.onCollisionEnterCallback)
            this.onCollisionEnterCallback(otherCollider);
        if (this._go)
            this._go.OnCollisionEnter(otherCollider);
    }

    OnCollisionExit(otherCollider) {
        if (this.onCollisionExitCallback)
            this.onCollisionExitCallback(otherCollider);
        if (this._go)
            this._go.OnCollisionExit(otherCollider);
    }

    OnClick() {
        if (this.onClickCallback)
            this.onClickCallback();
        if (this._go)
            this._go.OnClick();
    }

    IsPointInside(x, y) { return false; }
}

class RectangleCollider extends Collider {
    constructor(position, width, height, gameObject=null) {
        // const pos = gameObject ? new Vector2(position.x + width / 2, position.y + height / 2) : new Vector2(position.x, position.y);
        const boundingRadius = Math.sqrt(width * width + height * height) / 2;

        super(position, boundingRadius, gameObject);
        this.position.onChange = (vec) => {
            this.rect.x = vec.x - this.rect.halfWidth;
            this.rect.y = vec.y - this.rect.halfHeight;
        };
        this.rect = new Rect(position.x - width / 2, position.y - height / 2, width, height);
    }

    Draw(renderer) {
        renderer.DrawFillCircle(this.position.x, this.position.y, this.boundingRadius, Collider.bRAdColor);
        
        renderer.DrawFillRectangle(this.rect.x + this.rect.halfWidth, this.rect.y + this.rect.halfHeight, this.rect.w, this.rect.h, this.color);
    }

    IsPointInside(x, y) {
        return CheckPointInsideRectangle(x, y, this.rect.x, this.rect.y, this.rect.w, this.rect.h);
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

    IsPointInside(x, y) {
        return CheckPointInsideCircle(x, y, this.position, this.boundingRadius2);
    }
}

class PolygonCollider extends Collider {
    constructor(position, rotation, points, gameObject=null) {
        super(position, 0, gameObject);
        this.rotation = rotation;
        this.points = points;
        this.transformedPoints = new Array(this.points.length);
        for (let i = 0; i < this.points.length; i++) {
            this.transformedPoints[i] = Vector2.Copy(this.points[i]);
        }
        this._calculateBoundingRadius();
        this.UpdatePositionAndRotation(position, rotation);
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
    
    UpdateFromGO() {
        this.UpdatePositionAndRotation(this._go.position, this._go.rotation);
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

        const cosA = Math.cos(this.rotation);
        const sinA = Math.sin(this.rotation);

        // Transform local points to world space
        for (let i = 0; i < this.points.length; i++) {
            const p = this.points[i]; // The original local point, relative to (0,0)

            // Rotate the local point around the local origin (0,0)
            const rotatedX = (cosA * p.x) - (sinA * p.y);
            const rotatedY = (sinA * p.x) + (cosA * p.y);

            // Translate the rotated point by the collider's world position
            this.transformedPoints[i].Set(rotatedX + this.position.x, rotatedY + this.position.y);
        }
    }

    Draw(renderer) {
        renderer.DrawFillCircle(this.position.x, this.position.y, this.boundingRadius, Collider.bRAdColor);
        renderer.DrawPolygon(this.transformedPoints, this.color);
    }

    IsPointInside(x, y) {
        if (CheckPointInsideCircle(x, y, this.position, this.boundingRadius2))
            return CheckPointInsidePolygon(x, y, this.transformedPoints);
        else
            return false;
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