class Bullet {
    // TODO transform this class to inherit SpriteObject
    constructor() {
        this.position = {
            x: 0,
            y: 0
        }
        this.rotation = 0;

        this.width = 8;
        this.speed = 700;
        this.damage = 1;
        this.owner = null;

        this.active = false;
    }

    Update(deltaTime) {
        this.position.x += Math.cos(this.rotation) * this.speed * deltaTime;
        this.position.y += Math.sin(this.rotation) * this.speed * deltaTime;
    }

    Draw(ctx) {
        ctx.save();

        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);

        ctx.fillStyle = "yellow";
        ctx.fillRect(-this.width, -1, this.width, 2);

        ctx.restore();
    }
}
