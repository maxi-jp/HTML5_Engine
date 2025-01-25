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