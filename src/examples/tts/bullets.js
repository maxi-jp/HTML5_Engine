
class Bullet {

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

class BulletPool {
    constructor(owner, maxSize) {
        this.owner = owner;
        this.maxSize = maxSize;

        this.bullets = [];

        // initialize the bullet pool array
        for (let i = maxSize; i > 0; i--) {
            const bullet = new Bullet();
            bullet.owner = this.owner;

            this.bullets.push(bullet);
        }
    }

    Update(deltaTime) {
        this.bullets.forEach(bullet => {
            if (bullet.active)
                bullet.Update(deltaTime);
        });
    }

    Draw(ctx) {
        this.bullets.forEach(bullet => {
            if (bullet.active)
                bullet.Draw(ctx);
        });

        // draw the state of the bulletpool
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.strokeStyle = "white";
        for (let i = 0; i < this.bullets.length; i++) {
            if (this.bullets[i].active) {
                ctx.fillRect(10 + 20 * i, 10, 20, 20);
            }
            ctx.strokeRect(10 + 20 * i, 10, 20, 20);
        }
    }

    Activate() {
        let bullet = null;

        // search for the first bullet in the bullets array no-activated
        let i = 0;
        while(bullet == null && i < this.bullets.length) {
            if (!this.bullets[i].active) {
                bullet = this.bullets[i];
            }
            else {
                i++;
            }
        }
        
        if (bullet == null) {
            // theres is no bullet non-active in the pool
            // lets create a new one
            bullet = new Bullet();
            bullet.owner = this.owner;

            this.bullets.push(bullet);
        }

        bullet.active = true;
        
        return bullet;
    }
}
