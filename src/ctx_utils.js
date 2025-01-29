// #region Helper CTX classes

class Sprite {
    constructor(img, position, rotation, scale) {
        this.img = img;
        this.img.halfWidth = img.width / 2;
        this.img.halfHeight = img.height / 2;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
    }

    Draw(ctx) {
        ctx.save();

        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);

        ctx.drawImage(this.img, -this.img.halfWidth, -this.img.halfHeight);

        ctx.restore();
    }

    DrawSection(ctx, sx, sy, sw, sh) {
        ctx.save();

        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        
        // ctx.strokeStyle = "red";
        // ctx.strokeRect(-sw/2, -sh/2, sw, sh);

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
    constructor(position, width, height, color, stroke=false) {
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

class TextLabel {
    constructor(text, position, font, color="black", align="center", baseline="middle", stroke=false) {
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

// #endregion

// #region HelperCTXFunctions

function DrawRectangle(ctx, x, y, width, height, color, stroke=false, lineWidth=1) {
    if (stroke) {
        DrawFillRectangle(ctx, x, y, width, height, color);
    }
    else {
        DrawStrokeRectangle(ctx, x, y, width, height, color, lineWidth);
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

function DrawText(ctx, text, x, y, font, color="black", align="center", baseline="middle", stroke=false) {
    if (stroke) {
        DrawStrokeText(ctx, text, x, y, font, color, align, baseline);
    }
    else {
        DrawFillText(ctx, text, x, y, font, color, align, baseline);
    }
}

function DrawFillText(ctx, text, x, y, font, color="black", align="center", baseline="middle") {
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

function DrawStrokeText(ctx, text, x, y, font, color="black", align="center", baseline="middle") {
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.strokeStyle = color;
    ctx.strokeText(text, x, y);
}

// #endregion

// #region other helper functions

// Given a color return a desaturated version of it
function DesaturateColor(color, desaturateValue=0.5) {
    // Create a temporary element to use getComputedStyle for converting named colors to RGB
    const element = document.createElement('div');
    element.style.color = color;
  
    document.body.appendChild(element); // append temporarily

    // Get the computed color in RGB format
    const computedColor = window.getComputedStyle(element).color;

    document.body.removeChild(element);
  
    if (!computedColor || computedColor === 'rgba(0, 0, 0, 0)') {
        console.warn(`Unable to desaturate color "${color}".`);
        return color;
    }

    // Extract RGB values from the computed color string 'rgb(r, g, b)'
    const rgbValues = computedColor.match(/\d+/g).map(Number);
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

// #endgerion