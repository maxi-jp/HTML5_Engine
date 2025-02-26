class Enemy extends SpriteObject {
    constructor(initialPosition, img, player, sceneLimits) {
        super(initialPosition, 0, 1, img);

        this.player = player;
        this.sceneLimits = sceneLimits;

        this.speed = 100;
        this.life = 1;

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
}

const KamikazeState = {
    looking: 0,
    kamikaze: 1
}

class EnemyKamikaze extends Enemy {
    constructor(initialPosition, img, player, sceneLimits) {
        super(initialPosition, img, player, sceneLimits);

        this.state = KamikazeState.looking;

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

                break;

            case KamikazeState.kamikaze:

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
