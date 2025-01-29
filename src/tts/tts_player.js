class PlayerShip extends SpriteObject {
    constructor(position, rotation, scale, img, sceneLimits) {
        super(position, rotation, scale, img);

        this.speed = 300;
        this.life = 100;

        this.movement = Vector2.Zero();

        this.boundingRadious = 24;
        this.boundingRadious2 = this.boundingRadious * this.boundingRadious;

        this.fireRate = 0.1;
        this.fireRateAux = 0;

        this.cannonOffset = new Vector2(10, 0);

        this.sceneLimits = sceneLimits;
    }

    Update(deltaTime) {
        // rotation
        this._rotation = Math.atan2(
            Input.mouse.y - this.position.y,
            Input.mouse.x - this.position.x
        ) + PIH;

        this.sprite.rotation = this._rotation;

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

        // apply the movement
        this.position.x += this.movement.x * this.speed * deltaTime;
        this.position.y += this.movement.y * this.speed * deltaTime;

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