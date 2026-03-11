// Super Pang example project

// -------------------------------------------------------
// Ball sizes: large=48, medium=32, small=20, tiny=12
// When a ball is hit it splits into two smaller ones.
// Tiny balls are destroyed when hit.
// -------------------------------------------------------

const BALL_SIZES   = [48, 32, 20, 12];
const BALL_SPEEDS  = [110, 150, 190, 230]; // horizontal speed per size
const BALL_BOUNCEV = [-550, -480, -420, -360]; // vertical bounce speed per size
const GRAVITY      = 700;

const BALL_COLORS = [
    new Color(0.9, 0.2, 0.2),   // large  - red
    new Color(0.9, 0.5, 0.1),   // medium - orange
    new Color(0.2, 0.7, 0.2),   // small  - green
    new Color(0.2, 0.4, 0.9),   // tiny   - blue
];

// Game states
const STATE_PLAYING = 0;
const STATE_DEAD    = 1;
const STATE_WIN     = 2;

// -------------------------------------------------------
// SuperPang - main game class
// -------------------------------------------------------
class SuperPang extends Game {
    constructor(renderer) {
        super(renderer);

        this.config = {
            ...this.config,
            screenWidth: 640,
            screenHeight: 480,
            drawColliders: true
        }

        this.player = null;
        this.shot   = null;
        this.balls  = [];
        this.state  = STATE_PLAYING;
        this.score  = 0;
    }

    Start() {
        super.Start();

        this.state = STATE_PLAYING;
        this.score = 0;
        this.shot  = null;
        this.balls = [];

        // Spawn player centered at the bottom
        this.player = new PangPlayer(new Vector2(
            this.screenHalfWidth - 14,
            this.screenHeight - 60
        ));
        this.player.Start();
        this.gameObjects.push(this.player);

        // Spawn initial balls
        // this._spawnBall(new Vector2(150, 200), 0,  1);
        // this._spawnBall(new Vector2(480, 180), 0, -1);
    }

    _spawnBall(position, sizeIndex, dirX) {
        const ball = new PangBall(position, sizeIndex, dirX);
        ball.Start();
        this.gameObjects.push(ball);
        this.balls.push(ball);
    }

    // Called by PangBall when it is hit by a shot
    PopBall(ball) {
        // Destroy the shot
        this.DestroyShot();

        // Remove ball from game
        const idx = this.balls.indexOf(ball);
        if (idx !== -1)
            this.balls.splice(idx, 1);
        this.Destroy(ball);

        this.score += (this.balls.length === 0 ? 200 : 100) * (ball.sizeIndex + 1);

        // Spawn two smaller balls unless this is the smallest
        if (ball.sizeIndex < BALL_SIZES.length - 1) {
            const nextSize = ball.sizeIndex + 1;
            this._spawnBall(Vector2.Copy(ball.position), nextSize,  1);
            this._spawnBall(Vector2.Copy(ball.position), nextSize, -1);
        }

        // Check win condition
        if (this.balls.length === 0) {
            this.state = STATE_WIN;
        }
    }

    // Destroy the active shot
    DestroyShot() {
        if (this.shot) {
            this.Destroy(this.shot);
            this.shot = null;
        }
    }

    Update(deltaTime) {
        if (this.state === STATE_PLAYING) {
            super.Update(deltaTime);

            // Fire shot
            if (Input.IsKeyPressed(KEY_SPACE) && !this.shot) {
                const sx = this.player.position.x + this.player.width * 0.5;
                this.shot = new PangShot(sx);
                this.shot.Start();
                this.gameObjects.push(this.shot);
            }
        }

        // Restart on Enter after game over / win
        if (this.state !== STATE_PLAYING && Input.IsKeyPressed(KEY_ENTER)) {
            this.Start();
        }
    }

    Draw() {
        // Background
        this.renderer.DrawFillBasicRectangle(0, 0, this.screenWidth, this.screenHeight, new Color(0.1, 0.1, 0.2));

        // Floor line
        this.renderer.DrawLine(0, this.screenHeight - 4, this.screenWidth, this.screenHeight - 4, Color.white, 4);

        // Game objects (player, shot, balls)
        super.Draw();

        // Score
        this.renderer.DrawFillText(`Score: ${this.score}`, this.screenWidth - 10, 28, "bold 22px monospace", Color.white, "right", "top");

        // Overlays
        if (this.state === STATE_DEAD) {
            this._drawOverlay("GAME OVER", "Press ENTER to restart", new Color(0.8, 0.1, 0.1, 0.75));
        } else if (this.state === STATE_WIN) {
            this._drawOverlay("YOU WIN!", "Press ENTER to play again", new Color(0.1, 0.6, 0.1, 0.75));
        }
    }

    _drawOverlay(title, subtitle, bgColor) {
        this.renderer.DrawFillBasicRectangle(0, this.screenHalfHeight - 70, this.screenWidth, 140, bgColor);
        this.renderer.DrawFillText(title,    this.screenHalfWidth, this.screenHalfHeight - 18, "bold 52px monospace", Color.white, "center", "bottom");
        this.renderer.DrawFillText(subtitle, this.screenHalfWidth, this.screenHalfHeight + 36, "20px monospace",      Color.white, "center", "bottom");
    }
}

// -------------------------------------------------------
// PangPlayer - the player character
// -------------------------------------------------------
class PangPlayer extends GameObject {
    constructor(position) {
        super(position);

        this.width  = 28;
        this.height = 44;
        this.speed  = 240;
        this.color  = Color.blue;
        this.alive  = true;
    }

    Start() {
        // Create collider with zero-offset so UpdateFromGO works correctly
        const col = new RectangleCollider(Vector2.Zero(), this.width, this.height, this);
        this.collider = col;
        game.AddCollider(col);
    }

    Update(deltaTime) {
        if (!this.alive)
            return;

        let move = 0;
        if (Input.IsKeyPressed(KEY_LEFT)  || Input.IsKeyPressed(KEY_A))
            move -= 1;
        if (Input.IsKeyPressed(KEY_RIGHT) || Input.IsKeyPressed(KEY_D))
            move += 1;

        this.position.x += move * this.speed * deltaTime;
        // Clamp to screen bounds
        this.position.x = Math.max(0, Math.min(this.position.x, game.screenWidth - this.width));

        super.Update(deltaTime); // updates collider
    }

    Draw(renderer) {
        // Body
        renderer.DrawFillBasicRectangle(this.position.x, this.position.y, this.width, this.height, this.color);
        // Head
        const headR = this.width * 0.5;
        renderer.DrawFillCircle(this.position.x + this.width * 0.5, this.position.y - headR * 0.7, headR, this.color);
    }

    OnCollisionEnter(myCollider, otherCollider) {
        if (otherCollider.go instanceof PangBall) {
            this.alive = false;
            game.state = STATE_DEAD;
        }
    }
}

// -------------------------------------------------------
// PangShot - the harpoon/wire shot upward by the player
// -------------------------------------------------------
class PangShot extends GameObject {
    constructor(x) {
        super(new Vector2(x, game.screenHeight));
        this.width    = 4;
        this.top      = game.screenHeight; // current top of the wire
        this.speed    = 600;
        this._shotX   = x;
    }

    Start() {
        const sh = game.screenHeight;
        // Collider covers the full wire column; updated manually each frame
        const col = new RectangleCollider(new Vector2(this._shotX, sh * 0.5), this.width, sh, this);
        this.collider = col;
        game.AddCollider(col);
    }

    Update(dt) {
        this.top -= this.speed * dt;
        if (this.top <= 0) {
            this.top = 0;
            game.DestroyShot();
        }
        // Update collider manually to cover the wire from top to bottom
        const wireHeight = game.screenHeight - this.top;
        const wireCenterY = this.top + wireHeight * 0.5;
        this.collider.position.Set(this._shotX, wireCenterY);
        this.collider.rect.x = this._shotX - this.width * 0.5;
        this.collider.rect.y = this.top;
        this.collider.rect.w = this.width;
        this.collider.rect.h = wireHeight;
        this.collider.boundingRadius = Math.max(this.width, wireHeight) * 0.5;
        this.collider.boundingRadius2 = this.collider.boundingRadius * this.collider.boundingRadius;
    }

    Draw(renderer) {
        renderer.DrawFillBasicRectangle(
            this._shotX - this.width * 0.5, this.top,
            this.width, game.screenHeight - this.top,
            Color.yellow
        );
    }

    OnCollisionEnter(myCollider, otherCollider) {
        // Handled from PangBall side
    }
}

// -------------------------------------------------------
// PangBall - a bouncing ball that splits when hit
// -------------------------------------------------------
class PangBall extends GameObject {
    // sizeIndex: 0=large, 1=medium, 2=small, 3=tiny
    constructor(position, sizeIndex, dirX) {
        super(position);
        this.sizeIndex = sizeIndex;
        this.radius    = BALL_SIZES[sizeIndex];
        this.color     = BALL_COLORS[sizeIndex];
        this.vx        = BALL_SPEEDS[sizeIndex] * dirX;
        this.vy        = BALL_BOUNCEV[sizeIndex]; // start moving upward
    }

    Start() {
        // Create collider with zero-offset so UpdateFromGO works correctly
        const col = new CircleCollider(Vector2.Zero(), this.radius, this);
        this.collider = col;
        game.AddCollider(col);
    }

    Update(dt) {
        this.vy += GRAVITY * dt;

        this.position.x += this.vx * dt;
        this.position.y += this.vy * dt;

        const sw = game.screenWidth;
        const sh = game.screenHeight;

        // Bounce off walls
        if (this.position.x - this.radius < 0) {
            this.position.x = this.radius;
            this.vx = Math.abs(this.vx);
        } else if (this.position.x + this.radius > sw) {
            this.position.x = sw - this.radius;
            this.vx = -Math.abs(this.vx);
        }

        // Bounce off floor (always bounce back to the same height)
        if (this.position.y + this.radius >= sh) {
            this.position.y = sh - this.radius;
            this.vy = BALL_BOUNCEV[this.sizeIndex];
        }

        // Bounce off ceiling
        if (this.position.y - this.radius < 0) {
            this.position.y = this.radius;
            this.vy = Math.abs(this.vy);
        }

        super.Update(dt); // updates collider
    }

    Draw(renderer) {
        renderer.DrawFillCircle(this.position.x, this.position.y, this.radius, this.color);
        // Highlight
        renderer.DrawFillCircle(
            this.position.x - this.radius * 0.3,
            this.position.y - this.radius * 0.3,
            this.radius * 0.25,
            new Color(1, 1, 1, 0.4)
        );
    }

    OnCollisionEnter(myCollider, otherCollider) {
        if (otherCollider.go instanceof PangShot) {
            game.PopBall(this);
        }
    }
}

// Entry point
window.onload = function() {
    Init(SuperPang);
};
