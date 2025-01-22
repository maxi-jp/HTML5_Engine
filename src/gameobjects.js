
class GameObject {
    _rotation = 0;
    _scale = 1;

    constructor(position) {
        this._position = Vector2.Copy(position);
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

class Rectangle extends GameObject {
    constructor(position) {
        super(position);
        this.with = 100;
        this.height = 100;
        this.color = 'red';
    }

    Start() {
        this._position.x = canvas.width / 2;
        this._position.y = canvas.height / 2;
    }

    Update(deltaTime) {
        this._rotation += deltaTime * 2;
    }

    Draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.save();
        ctx.translate(this._position.x, this._position.y);
        ctx.rotate(this._rotation);
        ctx.fillRect(-this.with / 2, -this.height / 2, this.with, this.height);
        ctx.restore();
    }
}

class SpriteObject extends GameObject {
    constructor(position, rotation, scale, img) {
        super(position);
        this._rotation = rotation;
        this._scale = scale;
        this.sprite = new Sprite(img, this._position, this._rotation, this._scale);
    }

    set img(newImg) {
        this.sprite.img = newImg;
    }

    set rotation(newRotation) {
        this._rotation = newRotation;
        this.sprite.rotation = this._rotation;
    }

    set scale(newScale) {
        this._scale = newScale;
        this.sprite.scale = this._scale;
    }

    Start() {}
    Update(deltaTime){}

    Draw(ctx) {
        this.sprite.Draw(ctx);
    }

    Draw(ctx) {
        this.sprite.Draw(ctx);
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