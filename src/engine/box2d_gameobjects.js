class Box2DGameObject extends GameObject {
    constructor(position, physicsWorld, type, bodyOptions) {
        super(position);

        this.world = physicsWorld;

        // Create the Box2D body
        this.body = CreatePhysicsObject(physicsWorld, type, position.x / physicsWorld.scale, position.y / physicsWorld.scale, bodyOptions);
        this.body.SetUserData(this);

        this.hasContact = false; // true if the body has colide with another object
        this.contactUserData = null; // the user data of the object that has colide with this object
        this.hasContactEnded = false; // true if the body has end the collision with another object
        this.contactEndedUserData = null; // the user data of the object that has ended a collision with this object

        this.objectsColliding = []; // TODO insert colliding objects into this array when colliding and removing when contactEnded
    }

    get position() {
        // const pos = this.body.GetPosition();
        // this.position.Set(pos.x, pos.y);
        return this._position;
    }

    set position(value) {
        this.body.SetPosition(new b2Vec2(value.x / this.world.scale, (canvas.height - value.y) / this.world.scale));
    }

    get rotation() {
        return -this.body.GetAngle();
    }

    set rotation(value) {
        this.body.SetAngle(-value);
    }

    Start() {
        this.objectsColliding = [];
    }

    Update(deltaTime) {
        // Sync the GameObject's position and rotation with the Box2D body
        const pos = this.body.GetPosition();
        this._position.Set(pos.x * this.world.scale, canvas.height - (pos.y * this.world.scale));
        this._rotation = -this.body.GetAngle();

        // consume Box2D collision events
        if (this.hasContact) {
            // Consume the contact
            this.hasContact = false;
            this.OnContactDetected(this.contactUserData);
        }

        if (this.hasContactEnded) {
            // Consume the contact ended
            this.hasContactEnded = false;
            this.OnContactDetectEnded(this.contactEndedUserData);
        }
    }

    // DO NOT OVERRIDE: Used internally by Box2D contact system
    OnContactDetectedBox2D(other) {
        if (this.hasContact)
            return; // already detected a contact

        this.contactUserData = other;
        this.hasContact = true;
    }

    // DO NOT OVERRIDE: Used internally by Box2D contact system
    OnEndContactDetectedBox2D(other) {
        if (this.hasContactEnded)
            return;

        this.contactEndedUserData = other;
        this.hasContactEnded = true;
    }

    OnContactDetected(other) { }
    OnContactDetectEnded(other) { }

    Destroy() {
        this.world.DestroyBody(this.body);
        this.body = null;
    }
}

class Box2DRectangleGO extends Box2DGameObject {
    constructor(position, physicsWorld, type, bodyOptions, width, height, color = "red") {
        super(position, physicsWorld, type, bodyOptions);

        this.width = width;
        this.height = height;
        this.halfWidth = width / 2;
        this.halfHeight = height / 2;
        this.color = color;
    }

    Draw(renderer) {
        // TODO get the scale
        renderer.DrawFillRectangle(this.position.x * 100, this.position.y * 100, this.width * 100, this.height * 100, Color.black, this.rotation);
        ctx.save();
    }
}

class Box2DSpriteObject extends Box2DGameObject {
    constructor(position, rotation, scale, img, type, physicsWorld, bodyOptions) {
        super(position, physicsWorld, type, bodyOptions);

        this.rotation = rotation;
        
        this.sprite = new Sprite(img, this.position, this.rotation, scale);
    }

    get scale() {
        return this.sprite.scale;
    }
    set scale(value) {
        this.sprite.scale = value;
    }

    Update(deltaTime) {
        super.Update(deltaTime);
        this.sprite.position = this.position;
        this.sprite.rotation = this.rotation;
    }

    Draw(renderer) {
        this.sprite.Draw(renderer);
    }

    DrawSection(renderer, sx, sy, sw, sh) {
        this.sprite.DrawSection(renderer, sx, sy, sw, sh);
    }
}

class Box2DSSAnimationObjectBasic extends Box2DGameObject {
    constructor(position, rotation, scale, img, frameWidth, frameHeight, frameCount, framesDuration, type, physicsWorld, bodyOptions) {
        super(position, physicsWorld, type, bodyOptions);

        this.animation = new SSAnimationObjectBasic(
            this.position,
            rotation,
            scale,
            img,
            frameWidth,
            frameHeight,
            frameCount,
            framesDuration
        );
    }

    get scale() {
        return this.animation.scale;
    }
    set scale(value) {
        this.animation.scale = value;
    }

    Update(deltaTime) {
        super.Update(deltaTime);
        this.animation.position = this.position;
        this.animation.rotation = this.rotation;
        this.animation.Update(deltaTime);
    }

    Draw(renderer) {
        this.animation.Draw(renderer);
    }

    PlayAnimationLoop(animationId, resetToFrame0=true) {
        this.animation.PlayAnimationLoop(animationId, resetToFrame0);
    }
}

class Box2DSSAnimationObjectComplex extends Box2DGameObject {
    constructor(position, rotation, scale, img, animationsRectangles, framesDuration, type, physicsWorld, bodyOptions) {
        super(position, physicsWorld, type, bodyOptions);

        this.animation = new SSAnimationObjectComplex(
            this.position,
            rotation,
            scale,
            img,
            animationsRectangles,
            framesDuration
        );
    }

    get scale() {
        return this.animation.scale;
    }
    set scale(value) {
        this.animation.scale = value;
    }

    Update(deltaTime) {
        super.Update(deltaTime);
        this.animation.position = this.position;
        this.animation.rotation = this.rotation;
        this.animation.Update(deltaTime);
    }

    Draw(renderer) {
        this.animation.Draw(renderer);
    }

    PlayAnimationLoop(animationId, resetToFrame0=true) {
        this.animation.PlayAnimationLoop(animationId, resetToFrame0);
    }
}