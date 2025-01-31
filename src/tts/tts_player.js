class PlayerShip extends SpriteObject {
    constructor(position, rotation, scale, img, sceneLimits) {
        super(position, rotation, scale, img);

        this.speed = 300;
        this.velocity = Vector2.Zero();
        this.friction = 0.95; // friction factor to simulate inertia
        this.speedRotation = 10; // interpolation factor for LerpRotation
        this.speedMult = 1.5; // speed multiplier when LSHIFT is pressed

        this.life = 100;

        this.movement = Vector2.Zero();
        this.targetPosition = Vector2.Copy(position);
        this.targetRotation = 0;

        this.boundingRadious = 24;
        this.boundingRadious2 = this.boundingRadious * this.boundingRadious;

        this.fireRate = 0.1;
        this.fireRateAux = 0;

        this.cannonOffset = new Vector2(10, 0);

        this.sceneLimits = sceneLimits;

        this.camera = null;
    }

    Update(deltaTime) {
        // rotation
        this.targetRotation = Math.atan2(
            Input.mouse.y - this.position.y + this.camera.position.y,
            Input.mouse.x - this.position.x + this.camera.position.x
        ) + PIH;

        // apply a smooth rotation
        this.rotation = LerpRotation(this.rotation, this.targetRotation, this.speedRotation * deltaTime);

        // movement
        this.movement.Set(0, 0);

        if (Input.IsKeyPressed(KEY_A)) {
            this.movement.x -= 1;
        }
        if (Input.IsKeyPressed(KEY_D)) {
            this.movement.x += 1;
        }
        if (Input.IsKeyPressed(KEY_W)) {
            this.movement.y -= 1;
        }
        if (Input.IsKeyPressed(KEY_S)) {
            this.movement.y += 1;
        }
        this.movement.Normalize();
        
        // speed multiply
        if (Input.IsKeyPressed(KEY_LSHIFT)) {
            this.movement.MultiplyScalar(this.speedMult);
        }

        // apply the movement
        this.velocity.Add(this.movement.MultiplyScalar(this.speed * deltaTime));
        this.velocity.MultiplyScalar(this.friction); // apply friction to simulate inertia

        this.targetPosition.Set(
            this.position.x + this.velocity.x,
            this.position.y + this.velocity.y
        );
        this.position.Interpolate(this.targetPosition, 0.1);

        // check scene limits
        // left wall
        if (this.position.x < this.sceneLimits.position.x + this.boundingRadious)
            this.position.x = this.sceneLimits.position.x + this.boundingRadious;
        // right wall
        if (this.position.x > this.sceneLimits.position.x + this.sceneLimits.width - this.boundingRadious)
            this.position.x = this.sceneLimits.position.x + this.sceneLimits.width - this.boundingRadious;
        // top wall
        if (this.position.y < this.sceneLimits.position.y + this.boundingRadious)
            this.position.y = this.sceneLimits.position.y + this.boundingRadious;
        // bottom wall
        if (this.position.y > this.sceneLimits.position.y + this.sceneLimits.height - this.boundingRadious)
            this.position.y = this.sceneLimits.position.y + this.sceneLimits.height - this.boundingRadious;
    }

    Draw(ctx) {
        super.DrawSection(ctx, 52, 244, 48, 48);
    }
}