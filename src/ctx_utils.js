// #region Helper CTX classes

class Color {
    _r = 0;
    _g = 0;
    _b = 0;
    _a = 1;

    constructor(r, g, b, a=1) {
        this._r = r;
        this._g = g;
        this._b = b;
        this._a = a;
        this.string = this.toString();
    }

    get r() {
        return this._r;
    }

    get g() {
        return this._g;
    }

    get b() {
        return this._b;
    }

    get a() {
        return this._a;
    }

    set r(value) {
        this._r = value;
        this.string = this.toString();
    }

    set g(value) {
        this._g = value;
        this.string = this.toString();
    }

    set b(value) {
        this._b = value;
        this.string = this.toString();
    }

    set a(value) {
        this._a = value;
        this.string = this.toString();
    }

    static Black() {
        return new Color(0, 0, 0, 1);
    }

    static White() {
        return new Color(255, 255, 255, 1);
    }

    static Red() {
        return new Color(255, 0, 0, 1);
    }

    static Green() {
        return new Color(0, 255, 0, 1);
    }

    static Blue() {
        return new Color(0, 0, 255, 1);
    }

    static Copy(color) {
        return new Color(color.r, color.g, color.b, color.a);
    }

    static FromRGB(r, g, b) {
        return new Color(r, g, b);
    }

    static FromRGBA(r, g, b, a) {
        return new Color(r, g, b, a);
    }

    static FromHex(hex) {
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);
        return new Color(r, g, b);
    }

    static FromHexA(hex) {
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);
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
            Math.round((stepMin1 * from.r) + (step * to.r)),
            Math.round((stepMin1 * from.g) + (step * to.g)),
            Math.round((stepMin1 * from.b) + (step * to.b)),
            Math.round((stepMin1 * from.a) + (step * to.a))
        );
    }

    Desaturate(desaturateValue=0.5) {
        const avg = (this.r + this.g + this.b) / 3;
        this.r = Math.round(this.r + (avg - this.r) * desaturateValue);
        this.g = Math.round(this.g + (avg - this.g) * desaturateValue);
        this.b = Math.round(this.b + (avg - this.b) * desaturateValue);

        return this;
    }

    toString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
}

class Sprite {
    _scale = new Vector2(1, 1);
    _flipX = false;
    _flipY = false;
    _computedScale = new Vector2(1, 1);

    constructor(img, position, rotation, scale) {
        this.img = img;
        this.img.halfWidth = img.width / 2;
        this.img.halfHeight = img.height / 2;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        
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

    Draw(ctx) {
        ctx.save();

        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        ctx.scale(this._computedScale.x, this._computedScale.y);

        ctx.drawImage(this.img, -this.img.halfWidth, -this.img.halfHeight);

        ctx.restore();
    }

    DrawSection(ctx, sx, sy, sw, sh) {
        ctx.save();

        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        ctx.scale(this._computedScale.x, this._computedScale.y);
        
        if (debugMode) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(-sw/2, -sh/2, sw, sh);
        }

        ctx.drawImage(this.img, sx, sy, sw, sh, -sw/2, -sh/2, sw, sh);

        ctx.restore();
    }
}

class LinearGradient {
    constructor(x0, y0, x1, y1, colorStops) {
        this.gradient = ctx.createLinearGradient(x0, y0, x1, y1);
        colorStops.forEach(colorStop => {
            this.addColorStop(colorStop[0], colorStop[1]);
        });
    }

    addColorStop(offset, color) {
        this.gradient.addColorStop(offset, color);
    }
}

class RadialGradient {
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
    constructor(position, width, height, color="black", stroke=false) {
        this.position = position;
        this.width = width;
        this.height = height;
        this.color = color;
        this.stroke = stroke;
    }

    Draw(ctx) {
        DrawRectangle(ctx, this.position.x, this.position.y, this.width, this.height, this.color, this.stroke);
    }
}

class Circle {
    constructor(position, radius, color, stroke=false) {
        this.position = position;
        this.radius = radius;
        this.color = color;
        this.stroke = stroke;
    }

    Draw(ctx) {
        DrawCircle(ctx, this.position.x, this.position.y, this.radius, this.color, this.stroke);
    }
}

class TextLabel {
    constructor(text, position, font, color="black", align="center", baseline="bottom", stroke=false) {
        this.text = text;
        this.position = position;
        this.font = font;
        this.color = color;
        this.align = align;
        this.baseline = baseline;
        this.stroke = stroke;
    }

    Draw(ctx) {
        DrawText(ctx, this.text, this.position.x, this.position.y, this.font, this.color, this.align, this.baseline, this.stroke);
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

    Draw(ctx) {
        DrawText(ctx, this.text, this.position.x, this.position.y, this.font, this.fillColor, this.align, this.baseline, false);
        DrawText(ctx, this.text, this.position.x, this.position.y, this.font, this.strokeColor, this.align, this.baseline, true);
    }
}

// #endregion

// #region HelperCTXFunctions

function DrawRectangle(ctx, x, y, width, height, color, stroke=false, lineWidth=1) {
    if (stroke) {
        DrawStrokeRectangle(ctx, x, y, width, height, color, lineWidth);
    }
    else {
        DrawFillRectangle(ctx, x, y, width, height, color);
    }
}

function DrawFillRectangle(ctx, x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function DrawStrokeRectangle(ctx, x, y, width, height, color, lineWidth=1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x, y, width, height);
}

function DrawText(ctx, text, x, y, font, color="black", align="center", baseline="alphabetic", stroke=false) {
    if (stroke) {
        DrawStrokeText(ctx, text, x, y, font, color, align, baseline);
    }
    else {
        DrawFillText(ctx, text, x, y, font, color, align, baseline);
    }
}

function DrawFillText(ctx, text, x, y, font, color="black", align="center", baseline="alphabetic") {
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

function DrawStrokeText(ctx, text, x, y, font, color="black", align="center", baseline="alphabetic") {
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.strokeStyle = color;
    ctx.strokeText(text, x, y);
}

function DrawSegment(ctx, x1, y1, x2, y2, color, lineWidth=1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function DrawPolygon(ctx, coordinates, strokeColor="black", lineWidth=1, fill=false, fillColor="black") {
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
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, PI2, false);
    ctx.fill();
    ctx.closePath();
}

function DrawStrokeCircle(ctx, x, y, radius, color, lineWidth=1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, PI2, false);
    ctx.stroke();
    ctx.closePath();
}

function DrawCircle(ctx, x, y, radius, color, stroke=false, lineWidth=1) {
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