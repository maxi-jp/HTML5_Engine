class GameObject {
    _active = true;
    _position;
    _rotation = 0;
    _scale = 1;

    constructor(position) {
        this._position = Vector2.Copy(position);
    }

    get active() {
        return this._active;
    }
    get position() {
        return this._position;
    }
    get rotation() {
        return this._rotation;
    }
    get scale() {
        return this._scale;
    }

    set active(value) {
        this._active = value;
    }
    set position(value) {
        this._position = Vector2.Copy(value);
    }
    set rotation(value) {
        this._rotation = value;
    }
    set scale(value) {
        this._scale = value;
    }

    Start() {}
    Update(deltaTime){}
    Draw(ctx){}
}

class RectangleGO extends GameObject {
    constructor(position) {
        super(position);
        this.rectangle = new Rectangle(this._position, 100, 100, 'red');
    }

    Start() { }

    Update(deltaTime) { }

    Draw(ctx) {
        ctx.fillStyle = this.rectangle.color;
        ctx.save();
        ctx.translate(this._position.x, this._position.y);
        ctx.rotate(this._rotation);
        ctx.fillRect(-this.rectangle.width / 2, -this.rectangle.height / 2, this.rectangle.width, this.rectangle.height);
        ctx.restore();
    }
}

class Circle extends GameObject {
    constructor(position, radious, color) {
        super(position);
        this.radious = radious;
        this.color = color;
    }

    Draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.save();
        ctx.translate(this._position.x, this._position.y);
        ctx.rotate(this._rotation);
        ctx.beginPath();
        ctx.arc(0, 0, this.radious, 0, PI2, false);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

class Circumference extends GameObject {
    constructor(position, radious, color, lineWidth) {
        super(position);
        this.radious = radious;
        this.color = color;
        this.lineWidth = lineWidth
    }

    Draw(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.save();
        ctx.translate(this._position.x, this._position.y);
        ctx.rotate(this._rotation);
        ctx.beginPath();
        ctx.arc(0, 0, this.radious, 0, PI2, false);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
        ctx.lineWidth = 1;
    }
}

class SpriteObject extends GameObject {
    constructor(position, rotation, scale, img) {
        super(position);
        super.rotation = rotation;
        super.scale = scale;
        
        this.sprite = new Sprite(img, this._position, this._rotation, this._scale);
    }

    set img(newImg) {
        this.sprite.img = newImg;
    }

    set rotation(newRotation) {
        super.rotation = newRotation;
        this.sprite.rotation = this._rotation;
    }

    set scale(newScale) {
        super.scale = newScale;
        this.sprite.scale = this._scale;
    }

    Start() {}
    Update(deltaTime) {}

    Draw(ctx) {
        this.sprite.Draw(ctx);
    }

    DrawSection(ctx, sx, sy, sw, sh) {
        this.sprite.DrawSection(ctx, sx, sy, sw, sh);
    }
}

class SSAnimationObject extends SpriteObject {
    constructor(position, rotation, scale, img, frameWidth, frameHeight, frameCount, framesDuration)     {
        super(position, rotation, scale, img);

        this.framesDuration = framesDuration;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.frameCount = frameCount;
        this.actualAnimation = 0;
        this.actualFrame = 0;
        this.actualFrameCountTime = 0;
    }
    
    Start() {}

    Update(deltaTime) {
        this.actualFrameCountTime += deltaTime;
        if (this.actualFrameCountTime >= this.framesDuration) {
            // update the animation with the new frame
            this.actualFrame = (this.actualFrame + 1) % this.frameCount[this.actualAnimation];

            this.actualFrameCountTime = 0;
        }
    }

    Draw(ctx) {
        this.sprite.DrawSection(ctx, this.actualFrame * this.frameWidth, this.actualAnimation * this.frameHeight, this.frameWidth, this.frameHeight, 0, 0, this.frameWidth, this.frameHeight);
    }

    PlayAnimationLoop(animationId) {
        this.actualAnimation = animationId;

        // reset the frame count
        this.actualFrame = 0;
        this.actualFrameCountTime = 0;
    }
}