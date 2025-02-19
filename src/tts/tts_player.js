class PlayerShip extends SpriteObject {
    constructor(position, rotation, scale, img, sceneLimits) {
        super(position, rotation, scale, img);

        this.camera = null;

        this.speed = 300;
        this.life = 100;

        this.movement = Vector2.Zero();

        this.boundingRadious = 24;
        this.boundingRadious2 = this.boundingRadious * this.boundingRadious;

        this.fireRate = 0.1;
        this.fireRateAux = 0;

        this.cannonOffset = new Vector2(24, 0);

        this.bulletPool = new BulletPool(this, 10);

        this.sceneLimits = sceneLimits;
    }

    Start() {
        this.camera = game.camera;
        this.life = 100;
    }

    Update(deltaTime) {
        // rotation
        if (Input.gamepads[0]) {
            const rightStickValue = Input.GetGamepadStickValue(0, 1);
            if (Math.abs(rightStickValue.x) > 0.33 || Math.abs(rightStickValue.y) > 0.33) {
                this.rotation = Math.atan2(
                    rightStickValue.y,
                    rightStickValue.x
                ) + PIH;
            }
        }
        else {
            this.rotation = Math.atan2(
                Input.mouse.y - this.position.y + this.camera.position.y,
                Input.mouse.x - this.position.x + this.camera.position.x
            ) + PIH;
        }

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

        if (Input.gamepads[0]) {
            const leftStickValue = Input.GetGamepadStickValue(0, 0);
            if (Math.abs(leftStickValue.x) > 0.15 || Math.abs(leftStickValue.y) > 0.15) {
                this.movement.x += leftStickValue.x;
                this.movement.y += leftStickValue.y;
            }
        }
        //this.movement.Normalize();

        // apply the movement
        this.position.x += this.movement.x * this.speed * deltaTime;
        this.position.y += this.movement.y * this.speed * deltaTime;

        // shooting!
        this.fireRateAux -= deltaTime;

        if (this.fireRateAux <= 0 && (
            Input.IsKeyPressed(KEY_SPACE) || Input.IsMousePressed()
        )) {
            const bullet = this.bulletPool.Activate();
            if (bullet) {
                // TODO play shoot audio

                let cannonPosition = new Vector2(
                    this.position.x + this.cannonOffset.x,
                    this.position.y + this.cannonOffset.y
                );
                cannonPosition = RotatePointAroundPoint(cannonPosition, this.position, this.rotation - PIH);
                bullet.position.x = cannonPosition.x;
                bullet.position.y = cannonPosition.y;
                bullet.rotation = this.rotation - PIH;

                this.fireRateAux = this.fireRate;
            }
        }

        // update the bullets
        this.bulletPool.Update(deltaTime);

        // check bullets scene limits
        this.bulletPool.bullets.forEach(bullet => {
            if (bullet.active) {
                if (bullet.position.x < this.sceneLimits.position.x ||
                    bullet.position.x > this.sceneLimits.position.x + this.sceneLimits.width ||
                    bullet.position.y < this.sceneLimits.position.y ||
                    bullet.position.y > this.sceneLimits.position.y + this.sceneLimits.height
                ) {
                    bullet.active = false;
                }
            }
        });

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

        // draw the bullets
        this.bulletPool.Draw(ctx);
    }
}