class Enemy extends SpriteObject {
    constructor(initialPosition, img, player, sceneLimits) {
        super(initialPosition, 0, 1, img);

        this.player = player;
        this.sceneLimits = sceneLimits;

        this.speed = 100;
        this.life = 1;
        this.score = 1;

        this.boundingRadious = 18;
        this.boundingRadious2 = this.boundingRadious * this.boundingRadious;
    }

    Update(deltaTime) {
        // always face the player
        this.rotation = Math.atan2(
            this.player.position.y - this.position.y,
            this.player.position.x - this.position.x
        ) + PIH;

        // move forwards
        this.position.x += Math.cos(this.rotation - PIH) * this.speed * deltaTime;
        this.position.y += Math.sin(this.rotation - PIH) * this.speed * deltaTime;
    }

    Draw(ctx) {
        super.DrawSection(ctx, 149, 182, 31, 46);

        DrawFillCircle(ctx, this.position.x, this.position.y, this.boundingRadious, "rgba(255, 0, 0, 0.25)");
    }

    Damage(damage) {
        this.life -= damage;
        if (this.life <= 0) {
            this.life = 0;
            return true;
        }
        return false;
    }
}

const KamikazeState = {
    looking: 0,
    kamikaze: 1
}

class EnemyKamikaze extends Enemy {
    constructor(initialPosition, img, player, sceneLimits) {
        super(initialPosition, img, player, sceneLimits);

        this.state = KamikazeState.looking;

        this.lookingTime = 2;
        this.lookingTimeAux = 0;

        this.speed = 800;
        this.score = 2;

        this.thrustFireSprite = new Sprite(img, initialPosition, 0, 0.66);
        this.thrustFireSprite.alpha = 1;
        this.thrustFirePosition = new Vector2(-40, 0);
    }

    Update(deltaTime) {
        this.thrustFireSprite.rotation = this.rotation;
        const firePosition = RotatePointAroundPoint({x: this.position.x + this.thrustFirePosition.x, y: this.position.y + this.thrustFirePosition.y}, this.position, this.rotation - PIH);
        this.thrustFireSprite.position.Set(firePosition.x, firePosition.y);

        this.thrustFireSprite.alpha = (Math.cos(totalTime * 20) + 1) / 2;
        this.thrustFireSprite.alpha += (Math.cos(totalTime * 54.67) + 1) / 2;


        switch(this.state) {
            case KamikazeState.looking:
                // look for the player
                this.rotation = Math.atan2(
                    this.player.position.y - this.position.y,
                    this.player.position.x - this.position.x
                ) + PIH;

                this.lookingTimeAux += deltaTime;
                if (this.lookingTimeAux >= this.lookingTime) {
                    // state transition to kamikaze
                    this.state = KamikazeState.kamikaze;
                    this.lookingTimeAux = 0;
                }

                break;

            case KamikazeState.kamikaze:
                // move forwards
                this.position.x += Math.cos(this.rotation - PIH) * this.speed * deltaTime;
                this.position.y += Math.sin(this.rotation - PIH) * this.speed * deltaTime;

                // check scene limits
                // left wall
                if (this.position.x < this.sceneLimits.position.x + this.boundingRadious) {
                    this.position.x = this.sceneLimits.position.x + this.boundingRadious;
                    this.state = KamikazeState.looking;
                }
                // right wall
                if (this.position.x > this.sceneLimits.position.x + this.sceneLimits.width - this.boundingRadious) {
                    this.position.x = this.sceneLimits.position.x + this.sceneLimits.width - this.boundingRadious;
                    this.state = KamikazeState.looking;
                }
                // top wall
                if (this.position.y < this.sceneLimits.position.y + this.boundingRadious) {
                    this.position.y = this.sceneLimits.position.y + this.boundingRadious;
                    this.state = KamikazeState.looking;
                }
                // bottom wall
                if (this.position.y > this.sceneLimits.position.y + this.sceneLimits.height - this.boundingRadious) {
                    this.position.y = this.sceneLimits.position.y + this.sceneLimits.height - this.boundingRadious;
                    this.state = KamikazeState.looking;
                }

                break;
        }
    }

    Draw(ctx) {
        ctx.globalAlpha = this.thrustFireSprite.alpha;
        this.thrustFireSprite.DrawSection(ctx, 180, 182, 32, 76);

        ctx.globalAlpha = 1;
        super.Draw(ctx);
    }
}

class EnemyAsteroid extends Enemy {
    constructor(initialPosition, img, player, sceneLimits, direction, small) {
        super(initialPosition, img, player, sceneLimits);
        
        this.speed = 20;
        this.rotationSpeed = RandomBetweenFloat(-2, 2);
        this.score = 1;

        if (typeof(direction) === 'undefined') {
            this.direction = new Vector2(player.position.x - this.position.x, player.position.y - this.position.y);
            this.direction.Normalize();
        }
        else
            this.direction = direction;

        this.small = typeof(small) !== 'undefined' ? small : false;

        this.boundingRadious = this.small ? 16 : 22;
        this.boundingRadious2 = this.boundingRadious * this.boundingRadious;
    }

    Update(deltaTime) {
        this.rotation += this.rotationSpeed * deltaTime;

        // move forwards
        this.position.x += this.direction.x * this.speed * deltaTime;
        this.position.y += this.direction.y * this.speed * deltaTime;
    }

    Draw(ctx) {
        if (this.small)
            super.DrawSection(ctx, 144, 476, 32, 32);
        else
            super.DrawSection(ctx, 144, 428, 48, 48);

        DrawFillCircle(ctx, this.position.x, this.position.y, this.boundingRadious, "rgba(255, 0, 0, 0.25)");
    }

    Damage(damage) {
        const dead = super.Damage(damage);
        if (dead && !this.small) {
            // spawn two small asteroids
            const smallAsteroidA = new EnemyAsteroid(Vector2.Copy(this.position), this.sprite.img, this.player, this.sceneLimits, new Vector2(-this.direction.y, this.direction.x), true);

            const smallAsteroidB = new EnemyAsteroid(Vector2.Copy(this.position), this.sprite.img, this.player, this.sceneLimits, new Vector2(this.direction.y, -this.direction.x), true);
            
            game.AddEnemy(smallAsteroidA);
            game.AddEnemy(smallAsteroidB);
        }

        return dead;
    }
}