class GameObject {
    _active = true;
    _position;
    _rotation = 0;
    _scale = new Vector2(1, 1);

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
        if (typeof(value) === 'number')
            this._scale.Set(value, value);
        else
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

class SpriteObject extends GameObject {
    constructor(position, rotation, scale, img) {
        super(position);
        
        this.sprite = new Sprite(img, this._position, this._rotation, this._scale);
        this._rotation = rotation;
        this.scale = scale;

        this.flipX = false;
        this.flipY = false;
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

    set img(newImg) {
        this.sprite.img = newImg;
    }

    set position(newPosition) {
        this._position = newPosition;
        this.sprite.position = this._position;
    }

    set rotation(newRotation) {
        this._rotation = newRotation;
        this.sprite.rotation = this._rotation;
    }

    set scale(newScale) {
        if (typeof(newScale) === 'number')
            this._scale.Set(newScale, newScale);
        else
            this._scale = newScale;
        this.sprite.scale = this._scale;
    }

    set flipX(value) {
        this.sprite.flipX = value;
    }
    set flipY(value) {
        this.sprite.flipY = value;
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

class SSAnimationObjectBasic extends SpriteObject {
    constructor(position, rotation, scale, img, frameWidth, frameHeight, frameCount, framesDuration)     {
        super(position, rotation, scale, img);

        this.framesDuration = framesDuration;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.frameCount = frameCount;
        this.actualAnimation = 0;
        this.actualFrame = 0;
        this.actualFrameCountTime = 0;

        this.spritePosition = new Vector2(0, 0);
    }
    
    Start() {}

    Update(deltaTime) {
        this.actualFrameCountTime += deltaTime;
        if (this.actualFrameCountTime >= this.framesDuration) {
            // update the animation with the new frame
            this.actualFrame = (this.actualFrame + 1) % this.frameCount[this.actualAnimation];

            this.actualFrameCountTime = 0;
        }

        this.spritePosition.Set(
            this.position.x - this.actualRectFrame.w * this.scale.x * 0.5,
            this.position.y - this.actualRectFrame.h * this.scale.y * 0.5
        );
    }

    Draw(ctx) {
        this.sprite.DrawSection(ctx, this.actualFrame * this.frameWidth, this.actualAnimation * this.frameHeight, this.frameWidth, this.frameHeight, 0, 0, this.frameWidth, this.frameHeight);

        if (debugMode) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.spritePosition.x, this.spritePosition.y, this.actualRectFrame.w * this.scale.x, this.actualRectFrame.h * this.scale.y);
        }
    }

    PlayAnimationLoop(animationId, resetToFrame0=true) {
        this.actualAnimation = animationId;

        if (resetToFrame0 || this.actualFrame >= this.frameCount[this.actualAnimation].length) {
            // reset the frame count
            this.actualFrame = 0;
            this.actualFrameCountTime = 0;
        }
    }
}

class SSAnimationObjectComplex extends SpriteObject {
    constructor(position, rotation, scale, img, animationsRectangles, framesDurations) {
        super(position, rotation, scale, img);

        this.animationsRectangles = animationsRectangles;
        this.framesDurations = framesDurations;
        
        this.actualAnimationIndex = 0;
        this.actualFrame = 0;
        this.actualRectFrame = this.animationsRectangles[this.actualAnimationIndex][this.actualFrame];
        this.actualFrameCountTime = 0;

        this.spritePosition = new Vector2(0, 0);
    }
    
    Start() {}

    Update(deltaTime) {
        this.actualFrameCountTime += deltaTime;
        if (this.actualFrameCountTime >= this.framesDurations[this.actualAnimationIndex]) {
            // update the animation with the new frame
            this.actualFrame = (this.actualFrame + 1) % this.animationsRectangles[this.actualAnimationIndex].length;
            this.actualRectFrame = this.animationsRectangles[this.actualAnimationIndex][this.actualFrame];

            this.actualFrameCountTime = 0;
        }

        this.spritePosition.Set(
            this.position.x - this.actualRectFrame.w * this.scale.x * 0.5,
            this.position.y - this.actualRectFrame.h * this.scale.y * 0.5
        );
    }

    Draw(ctx) {
        this.sprite.DrawSection(ctx, this.actualRectFrame.x, this.actualRectFrame.y, this.actualRectFrame.w, this.actualRectFrame.h, 0, 0, this.actualRectFrame.w, this.actualRectFrame.h);

        if (debugMode) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.spritePosition.x, this.spritePosition.y, this.actualRectFrame.w * this.scale.x, this.actualRectFrame.h * this.scale.y);
        }
    }

    PlayAnimationLoop(animationId, resetToFrame0=true) {
        this.actualAnimationIndex = animationId;

        if (resetToFrame0 || this.actualFrame >= this.animationsRectangles[this.actualAnimationIndex].length) {
            // reset the frame count
            this.actualFrame = 0;
            this.actualFrameCountTime = 0;
        }

        this.actualRectFrame = this.animationsRectangles[this.actualAnimationIndex][this.actualFrame];
    }
}

class Camera {
    _position;
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
    Update(deltaTime) {}

    PreDraw(ctx) {
        ctx.save();
    }

    PostDraw(ctx) {
        ctx.restore();
    }
}

class FollowCameraBasic extends Camera {
    constructor(position, target) {
        super(position);

        this.target = target;
    }

    Start() {
        this.position.Set(
            this.target.position.x - canvas.width / 2,
            this.target.position.y - canvas.height / 2
        );
    }

    Update(deltaTime) {
        this.position.Set(
            this.target.position.x - canvas.width / 2,
            this.target.position.y - canvas.height / 2
        );
    }

    PreDraw(ctx) {
        super.PreDraw(ctx);
        ctx.translate(-this.position.x, -this.position.y);
    }
}

class FollowCamera extends Camera {
    constructor(position, target, minX, maxX, minY, maxY, smoothingSpeed=5) {
        super(position);

        this.target = target;
        this.targetPosition = Vector2.Zero();

        this.minX = minX;
        this.maxX = maxX;
        this.minY = minY;
        this.maxY = maxY;

        this.smoothingSpeed = smoothingSpeed;

        // shake
        this.shakingValue = Vector2.Zero();
        this.shakingTime = 0;
        this.shakingSpeed = 40;
        this.shakingSize = 5;
        this.shakeInitRandom = Vector2.Zero();
    }

    Start() {
        this.position.Set(
            this.target.position.x - canvas.width / 2,
            this.target.position.y - canvas.height / 2
        );
    }

    Update(deltaTime) {
        this.targetPosition.x = this.target.position.x - canvas.width / 2;
        this.targetPosition.y = this.target.position.y - canvas.height / 2;

        if (this.targetPosition.x < this.minX)
            this.targetPosition.x = this.minX;
        if (this.targetPosition.x > this.maxX)
            this.targetPosition.x = this.maxX;

        if (this.targetPosition.y < this.minY)
            this.targetPosition.y = this.minY;
        if (this.targetPosition.y > this.maxY)
            this.targetPosition.y = this.maxY;

        this.shakingValue.Set(0, 0);
        if (this.shakingTime > 0) {
            this.shakingTime -= deltaTime;

            this.shakingValue.x = Math.cos(this.shakeInitRandom.x + this.shakingTime * this.shakingSpeed) * this.shakingSize;
            this.shakingValue.y = Math.sin(this.shakeInitRandom.y + this.shakingTime * this.shakingSpeed) * this.shakingSize;
        }

        const smoothStep = this.smoothingSpeed * deltaTime;

        this.position.x += ((this.targetPosition.x - this.position.x) * smoothStep) + this.shakingValue.x;
        this.position.y += ((this.targetPosition.y - this.position.y) * smoothStep) + this.shakingValue.y;
    }

    PreDraw(ctx) {
        super.PreDraw(ctx);
        ctx.translate(-this.position.x, -this.position.y);
    }

    Shake(time, speed, size) {
        this.shakingTime = time;
        this.shakingSpeed = speed;
        this.shakingSize = size;
        this.shakeInitRandom.Random();
    }
}