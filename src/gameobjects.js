class GameObject {
    _active = true;
    _position;
    _rotation = 0;
    _scale = new Vector2(1, 1);
    _pivot = { x: 0, y: 0 };
    _collider;

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
    get x() {
        return this._position.x;
    }
    get y() {
        return this._position.y;
    }
    get pivot() {
        return this._pivot;
    }
    get collider() {
        return this._collider;
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
    set x(value) {
        this._position.x = value;
    }
    set y(value) {
        this._position.y = value;
    }
    set pivot(value) {
        this._pivot.x = value.x;
        this._pivot.y = value.y;
    }
    set collider(value) {
        this._collider = value;
    }

    Start() { }

    Update(deltaTime) {
        this._collider?.UpdateFromGO();
    }

    Draw(ctx) { }
    OnCollisionEnter(myCollider, otherCollider) { }
    OnCollisionExit(myCollider, otherCollider) { }
    OnClick() { }
}

class RectangleGO extends GameObject {
    constructor(position, width=100, height=100, color=Color.red, stroke=false, lineWidth=1) {
        super(position);
        this.rectangle = new Rectangle(this._position, width, height, color, stroke, lineWidth);
    }

    get width() {
        return this.rectangle.width;
    }
    get height() {
        return this.rectangle.height;
    }

    set width(value) {
        this.rectangle.width = value;
    }
    set height(value) {
        this.rectangle.height = value;
    }

    Draw(renderer) {
        renderer.DrawRectangle(this.position.x, this.position.y, this.rectangle.width, this.rectangle.height, this.rectangle.color, this.rectangle.stroke, this.rectangle.lineWidth, this.rotation, this.pivot);
    }
}

class CircleGO extends GameObject {
    constructor(position, radius=100, color=Color.red, stroke=false, lineWidth=1) {
        super(position);
        this.circle = new Circle(this._position, radius, color, stroke=false, lineWidth=1)
    }

    Draw(renderer) {
        renderer.DrawCircle(this.position.x, this.position.y, this.circle.radius, this.circle.color, this.circle.stroke, this.circle.lineWidth);
    }
}

class SpriteObject extends GameObject {
    constructor(position, rotation, scale, img, alpha=1.0) {
        super(position);
        
        this.sprite = new Sprite(img, this._position, this._rotation, this._scale, alpha);
        this._rotation = rotation;
        this.scale = scale;

        this.flipX = false;
        this.flipY = false;
    }

    get img() {
        return this.sprite.img;
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

    get flipX() {
        return this.sprite.flipX;
    }
    get flipY() {
        return this.sprite.flipY;
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

    set pivot(value) {
        this._pivot = value.x;
        this._pivot = value.y;
        this.sprite.pivot.x = value.x;
        this.sprite.pivot.y = value.y;
    }

    Draw(renderer) {
        this.sprite.Draw(renderer);
    }

    DrawSection(renderer, sx, sy, sw, sh) {
        this.sprite.DrawSection(renderer, sx, sy, sw, sh);
    }
}

class SSAnimationObjectBasic extends SpriteObject {
    constructor(position, rotation, scale, img, frameWidth, frameHeight, frameCount, framesDuration) {
        super(position, rotation, scale, img);

        this.framesDuration = framesDuration;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.frameCount = frameCount;
        this.actualAnimation = 0;
        this.actualFrame = 0;
        this.actualFrameCountTime = 0;

        this.spritePosition = new Vector2(0, 0); // only used if debugMode
    }

    Update(deltaTime) {
        super.Update(deltaTime);

        this.actualFrameCountTime += deltaTime;
        if (this.actualFrameCountTime >= this.framesDuration) {
            // update the animation with the new frame
            this.actualFrame = (this.actualFrame + 1) % this.frameCount[this.actualAnimation];

            this.actualFrameCountTime = 0;
        }

        this.spritePosition.Set(
            this.position.x - this.frameWidth * this.scale.x * 0.5,
            this.position.y - this.frameHeight * this.scale.y * 0.5
        );
    }

    Draw(renderer) {
        this.sprite.DrawSection(renderer, this.actualFrame * this.frameWidth, this.actualAnimation * this.frameHeight, this.frameWidth, this.frameHeight, 0, 0, this.frameWidth, this.frameHeight);
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

    Update(deltaTime) {
        super.Update(deltaTime);

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

    Draw(renderer) {
        this.sprite.DrawSection(renderer, this.actualRectFrame.x, this.actualRectFrame.y, this.actualRectFrame.w, this.actualRectFrame.h, 0, 0, this.actualRectFrame.w, this.actualRectFrame.h);

        if (debugMode) {
            renderer.DrawStrokeBasicRectangle(this.spritePosition.x, this.spritePosition.y, this.actualRectFrame.w * this.scale.x, this.actualRectFrame.h * this.scale.y);
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
        this.lastState = { x: 0, y: 0, r: 0, s: 1 };
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
    get x() {
        return this._position.x;
    }
    get y() {
        return this._position.y;
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
    set x(value) {
        this._position.x = value;
    }
    set y(value) {
        this._position.y = value;
    }

    Start() {}
    Update(deltaTime) {
        // this.lastState.x = this.position.x;
        // this.lastState.y = this.position.y;
        // this.lastState.r = this.rotation;
        // this.lastState.s = this.scale;
    }

    PreDraw(renderer) {
        renderer.ApplyCameraTransform(this);
    }

    PostDraw(renderer) {
        renderer.RestoreCameraTransform();
    }
}

class FollowCameraBasic extends Camera {
    constructor(position, target, offset=Vector2.Zero()) {
        super(position);

        this.target = target;
        this.offset = offset;
    }

    Start() {
        this.position.Set(
            this.target.position.x - (canvas.width  / 2) + this.offset.x,
            this.target.position.y - (canvas.height / 2) + this.offset.y
        );
    }

    Update(deltaTime) {
        this.position.Set(
            this.target.position.x - (canvas.width  / 2) + this.offset.x,
            this.target.position.y - (canvas.height / 2) + this.offset.y
        );
    }
}

class FollowCamera extends Camera {
    constructor(position, target, minX, maxX, minY, maxY, smoothingSpeed=5, offset=Vector2.Zero()) {
        super(position);

        this.target = target;
        this.targetPosition = Vector2.Zero();

        this.minX = minX;
        this.maxX = maxX;
        this.minY = minY;
        this.maxY = maxY;

        this.smoothingSpeed = smoothingSpeed;
        this.offset = offset;

        // shake
        this.shakingValue = Vector2.Zero();
        this.shakingTime = 0;
        this.shakingSpeed = 40;
        this.shakingSize = 5;
        this.shakeInitRandom = Vector2.Zero();
    }

    Start() {
        this.position.Set(
            this.target.position.x - (canvas.width  / 2) + this.offset.x,
            this.target.position.y - (canvas.height / 2) + this.offset.y
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

        // TODO apply offset
        this.position.x += ((this.targetPosition.x - this.position.x) * smoothStep) + this.shakingValue.x;
        this.position.y += ((this.targetPosition.y - this.position.y) * smoothStep) + this.shakingValue.y;
    }

    Shake(time, speed, size) {
        this.shakingTime = time;
        this.shakingSpeed = speed;
        this.shakingSize = size;
        this.shakeInitRandom.Random();
    }
}

class Pool {
    static semiTransparentRed = new Color(1, 0, 0, 0.5);

    constructor(owner, maxSize, objectConstructor, constructorParams=[]) {
        this.owner = owner;
        this.maxSize = maxSize;
        this.objectConstructor = objectConstructor;
        this.constructorParams = constructorParams;

        this.objects = [];

        this.drawDebug = false;

        // initialize the bullet pool array
        for (let i = maxSize; i > 0; i--) {
            const object = new this.objectConstructor(...constructorParams);
            object.owner = this.owner;

            this.objects.push(object);
        }
    }

    Update(deltaTime) {
        this.objects.forEach(object => {
            if (object.active)
                object.Update(deltaTime);
        });
    }

    Draw(renderer) {
        this.objects.forEach(object => {
            if (object.active)
                object.Draw(renderer);
        });

        if (this.drawDebug) {
            // draw the state of the object pool
            renderer.ctx.fillStyle = Pool.semiTransparentRed;
            renderer.ctx.strokeStyle = Color.white;
            for (let i = 0; i < this.objects.length; i++) {
                if (this.objects[i].active) {
                    renderer.ctx.fillRect(10 + 20 * i, 10, 20, 20);
                }
                renderer.ctx.strokeRect(10 + 20 * i, 10, 20, 20);
            }
        }
    }

    Activate() {
        let object = null;

        // search for the first object in the objects array no-activated
        let i = 0;
        while(object == null && i < this.objects.length) {
            if (!this.objects[i].active) {
                object = this.objects[i];
            }
            else {
                i++;
            }
        }
        
        if (object == null) {
            // theres is no object non-active in the pool
            // lets create a new one
            object = this.objectConstructor(...this.constructorParams);
            object.owner = this.owner;

            this.objects.push(object);
        }

        object.active = true;
        
        return object;
    }
}

class BackgroundLayer {
    constructor(position, speed) {
        this.position = position;
        this.speed = speed;
        this.camera = null;

        this.initialPosition = new Vector2(position.x, position.y);
    }

    Update(deltaTime) {
        this.position.x = this.initialPosition.x + (this.camera.position.x * (1 - this.speed.x));
        this.position.y = this.initialPosition.y + (this.camera.position.y * (1 - this.speed.y));
    }

    Draw(ctx) {}
}

class StaticColorLayer {
    constructor(color) {
        this.color = color;
        this.camera = null;
    }

    Update() {}

    Draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.camera.x, this.camera.y, canvas.width, canvas.height);
    }
}

class StaticGradientLayer {
    constructor(direction, colorStops) {
        direction.Normalize();
        this.gradient = new LinearGradient(0, 0, direction.x * canvas.width, direction.y * canvas.height, colorStops);
        this.camera = null;
    }

    Update() {}

    Draw(ctx) {
        ctx.fillStyle = this.gradient.gradient;
        ctx.fillRect(this.camera.x, this.camera.y, canvas.width, canvas.height);
    }
}

class SpriteBackgroundLayer extends BackgroundLayer {
    constructor(img, position, rotation, scale, speed=Vector2.Zero(), section=null) {
        super(position, speed);

        this.sprite = null;
        if (section === null)
            this.sprite = new Sprite(img, position, rotation, scale);
        else
            this.sprite = new SpriteSection(img, position, rotation, scale, section);
    }

    Draw(ctx) {
        this.sprite.DrawBasic(ctx);
    }
}

class MultispritesBackgroundLayer extends BackgroundLayer {
    constructor(position, sprites, speed=Vector2.Zero()) {
        super(position, speed);
        
        this.sprites = sprites;
    }

    Start() {
        this.sprites.forEach(sprite => {
            sprite.initialPosition = new Vector2(sprite.x, sprite.y);
        });
    }

    Update(deltaTime) {
        super.Update(deltaTime);

        this.sprites.forEach(sprite => {
            sprite.position.Set(sprite.initialPosition.x + this.position.x, sprite.initialPosition.y + this.position.y);
        });
    }

    Draw(ctx) {
        this.sprites.forEach(sprite => {
            sprite.DrawBasic(ctx);
        });
    }
}

class TilesetBackgroundLayer extends BackgroundLayer {
    constructor(img, position, scale, speed=Vector2.Zero()) {
        super(position, speed);

        this.sprite = new Sprite(img, position, 0, scale);

        this.tilesetConfig = {
            1: {
                name: '',
                rect: new Rect(0, 0, 16, 16)
            }
        }

        this.tilesetMap = [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 1],
            [0, 0, 0, 1, 1, 0]
        ];
    }

    Update(deltaTime) {
        this.position.x = this.initialPosition.x + (this.camera.position.x * (1 - this.speed.x));
        this.position.y = this.initialPosition.y + (this.camera.position.y * (1 - this.speed.y));
    }

    Draw(ctx) {
        this.tilesetMap.forEach(tileRow => {
            tileRow.forEach(tile => {
                const rect = this.tilesetConfig[tile].rect;
                this.DrawSectionBasic(ctx, rect.x, rect.y, rect.w, rect.h);
            })
        });
    }
}

class BackgroundLayers {
    constructor(camera, layers=[]) {
        this.camera = camera;
        this.layers = layers;
    }

    InsertLayer(layer) {
        this.layers.push(layer);
        layer.camera = this.camera;
    }

    Start() {
        this.layers.forEach(layer => {
            layer.camera = this.camera;
            if (layer.Start)
                layer.Start()
        });
    }

    Update(deltaTime) {
        this.layers.forEach(layer => layer.Update(deltaTime));
    }

    Draw(ctx) {
        this.layers.forEach(layer => layer.Draw(ctx));
    }
}
