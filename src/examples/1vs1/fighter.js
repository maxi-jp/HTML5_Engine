class Fighter extends SSAnimationObjectBasic {
    constructor({ position, velocity, color = 'red', offset }, img, scale = 1, framesMax = 8, sprites, attackBox = { offset: {}, width: undefined, height: undefined }) {
        // Call the parent constructor (SSAnimationObjectBasic)
        // Pass the pre-loaded image object directly.
        super(position, 0, scale, img, 0, 0, [framesMax], 0.1);

        // Fighter properties
        this.velocity = velocity;
        this.width = 50;
        this.height = 150;
        this.lastKey;
        this.attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            offset: attackBox.offset,
            width: attackBox.width,
            height: attackBox.height
        };
        this.color = color;
        this.isAttacking;
        this.health = 100;
        this.framesMax = framesMax;
        this.framesCurrent = 0;
        this.framesElapsed = 0;
        this.framesHold = 5;
        this.sprites = sprites;
        this.dead = false;

        // The SSAnimationObjectBasic requires these properties to be set
        // this.img is the pre-loaded image from the super constructor.
        this.frameWidth = this.img.width / this.framesMax;
        this.frameHeight = this.img.height;
        this.frameCount = [this.framesMax];
    }

    Update(deltaTime) {
        // Call the parent update method to handle animation
        super.Update(deltaTime);

        // Update attack box position
        this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
        this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

        // Apply gravity
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Stop falling when reaching the ground
        if (this.position.y + this.height + this.velocity.y >= 480 - 96) {
            this.velocity.y = 0;
            this.position.y = 334;
        } else {
            this.velocity.y += 0.7; // Gravity
        }
    }

    Draw(renderer) {
        // Draw the fighter sprite
        super.Draw(renderer);

        // Uncomment to draw attack box for debugging
        if (this.isAttacking) {
            renderer.DrawFillRectangle(
                this.attackBox.position.x,
                this.attackBox.position.y,
                this.attackBox.width,
                this.attackBox.height,
                'green'
            );
        }
    }

    attack() {
        this.switchSprite('attack1');
        this.isAttacking = true;
    }

    takeHit() {
        this.health -= 20;

        if (this.health <= 0) {
            this.switchSprite('death');
        } else {
            this.switchSprite('takeHit');
        }
    }

    switchSprite(sprite) {
        if (this.img === this.sprites.death.image) {
            if (this.actualFrame === this.sprites.death.framesMax - 1) {
                this.dead = true;
            }
            return;
        }

        // Do not interrupt attack animation
        if (this.img === this.sprites.attack1.image && this.actualFrame < this.sprites.attack1.framesMax - 1) {
            return;
        }

        // Do not interrupt take hit animation
        if (this.img === this.sprites.takeHit.image && this.actualFrame < this.sprites.takeHit.framesMax - 1) {
            return;
        }

        switch (sprite) {
            case 'idle':
                if (this.img !== this.sprites.idle.image) {
                    this.img = this.sprites.idle.image;
                    this.framesMax = this.sprites.idle.framesMax;
                    this.actualFrame = 0;
                    this.frameWidth = this.img.width / this.framesMax;
                    this.frameCount = [this.framesMax];
                }
                break;
            case 'run':
                if (this.img !== this.sprites.run.image) {
                    this.img = this.sprites.run.image;
                    this.framesMax = this.sprites.run.framesMax;
                    this.actualFrame = 0;
                    this.frameWidth = this.img.width / this.framesMax;
                    this.frameCount = [this.framesMax];
                }
                break;
            case 'jump':
                if (this.img !== this.sprites.jump.image) {
                    this.img = this.sprites.jump.image;
                    this.framesMax = this.sprites.jump.framesMax;
                    this.actualFrame = 0;
                    this.frameWidth = this.img.width / this.framesMax;
                    this.frameCount = [this.framesMax];
                }
                break;
            case 'fall':
                if (this.img !== this.sprites.fall.image) {
                    this.img = this.sprites.fall.image;
                    this.framesMax = this.sprites.fall.framesMax;
                    this.actualFrame = 0;
                    this.frameWidth = this.img.width / this.framesMax;
                    this.frameCount = [this.framesMax];
                }
                break;
            case 'attack1':
                if (this.img !== this.sprites.attack1.image) {
                    this.img = this.sprites.attack1.image;
                    this.framesMax = this.sprites.attack1.framesMax;
                    this.actualFrame = 0;
                    this.frameWidth = this.img.width / this.framesMax;
                    this.frameCount = [this.framesMax];
                }
                break;
            case 'takeHit':
                if (this.img !== this.sprites.takeHit.image) {
                    this.img = this.sprites.takeHit.image;
                    this.framesMax = this.sprites.takeHit.framesMax;
                    this.actualFrame = 0;
                    this.frameWidth = this.img.width / this.framesMax;
                    this.frameCount = [this.framesMax];
                }
                break;
            case 'death':
                if (this.img !== this.sprites.death.image) {
                    this.img = this.sprites.death.image;
                    this.framesMax = this.sprites.death.framesMax;
                    this.actualFrame = 0;
                    this.frameWidth = this.img.width / this.framesMax;
                    this.frameCount = [this.framesMax];
                }
                break;
        }
    }
}