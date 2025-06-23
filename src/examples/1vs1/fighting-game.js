class FightingGame extends Game {
    constructor(renderer) {
        super(renderer);

        // Set screen dimensions
        this.screenWidth = 1024;
        this.screenHeight = 576;

        this.config.imageSmoothingEnabled = false;

        // Add all required graphic assets here for pre-loading
        this.graphicAssets = {
            background: { path: './src/examples/1vs1/assets/background.png', img: null },
            shop: { path: './src/examples/1vs1/assets/shop.png', img: null },
            samuraiMack_idle: { path: './src/examples/1vs1/assets/samuraiMack/Idle.png', img: null },
            samuraiMack_run: { path: './src/examples/1vs1/assets/samuraiMack/Run.png', img: null },
            samuraiMack_jump: { path: './src/examples/1vs1/assets/samuraiMack/Jump.png', img: null },
            samuraiMack_fall: { path: './src/examples/1vs1/assets/samuraiMack/Fall.png', img: null },
            samuraiMack_attack1: { path: './src/examples/1vs1/assets/samuraiMack/Attack1.png', img: null },
            samuraiMack_takeHit: { path: './src/examples/1vs1/assets/samuraiMack/Take Hit - white silhouette.png', img: null },
            samuraiMack_death: { path: './src/examples/1vs1/assets/samuraiMack/Death.png', img: null },
            kenji_idle: { path: './src/examples/1vs1/assets/kenji/Idle.png', img: null },
            kenji_run: { path: './src/examples/1vs1/assets/kenji/Run.png', img: null },
            kenji_jump: { path: './src/examples/1vs1/assets/kenji/Jump.png', img: null },
            kenji_fall: { path: './src/examples/1vs1/assets/kenji/Fall.png', img: null },
            kenji_attack1: { path: './src/examples/1vs1/assets/kenji/Attack1.png', img: null },
            kenji_takeHit: { path: './src/examples/1vs1/assets/kenji/Take hit.png', img: null },
            kenji_death: { path: './src/examples/1vs1/assets/kenji/Death.png', img: null }
        };

        this.timer = 60;
        this.timerId;
        this.displayText = document.querySelector('#displayText');

        this.background = null;
        this.shop = null;
        this.playerA = null;
        this.playerB = null;
    }

    Start() {
        super.Start();

        // Create background
        this.background = new SpriteObject(
            new Vector2(this.screenHalfWidth, this.screenHalfHeight),
            0,
            1,
            this.graphicAssets.background.img
        );
        this.gameObjects.push(this.background);

        this.shop = new SpriteObject(
            new Vector2(this.screenHalfWidth, this.screenHeight - 96 - 128 / 2),
            0,
            2.75,
            this.graphicAssets.shop.img
        );
        this.gameObjects.push(this.shop);


        // Create Player, passing pre-loaded images
        this.playerA = new Fighter({
            position: new Vector2(200, 100),
            velocity: new Vector2(0, 0),
            offset: { x: 0, y: 0 }
        },
            this.graphicAssets.samuraiMack_idle.img,
            2.5,
            8,
            {
                idle: { image: this.graphicAssets.samuraiMack_idle.img, framesMax: 8 },
                run: { image: this.graphicAssets.samuraiMack_run.img, framesMax: 8 },
                jump: { image: this.graphicAssets.samuraiMack_jump.img, framesMax: 2 },
                fall: { image: this.graphicAssets.samuraiMack_fall.img, framesMax: 2 },
                attack1: { image: this.graphicAssets.samuraiMack_attack1.img, framesMax: 6 },
                takeHit: { image: this.graphicAssets.samuraiMack_takeHit.img, framesMax: 4 },
                death: { image: this.graphicAssets.samuraiMack_death.img, framesMax: 6 }
            },
            {
                offset: { x: 215, y: 157 },
                width: 160,
                height: 50
            }
        );
        this.gameObjects.push(this.playerA);


        // Create Enemy, passing pre-loaded images
        this.playerB = new Fighter({
            position: new Vector2(this.screenWidth - 250, 100),
            velocity: new Vector2(0, 0),
            color: 'blue',
            offset: { x: -50, y: 0 }
        },
            this.graphicAssets.kenji_idle.img,
            2.5,
            4,
            {
                idle: { image: this.graphicAssets.kenji_idle.img, framesMax: 4 },
                run: { image: this.graphicAssets.kenji_run.img, framesMax: 8 },
                jump: { image: this.graphicAssets.kenji_jump.img, framesMax: 2 },
                fall: { image: this.graphicAssets.kenji_fall.img, framesMax: 2 },
                attack1: { image: this.graphicAssets.kenji_attack1.img, framesMax: 4 },
                takeHit: { image: this.graphicAssets.kenji_takeHit.img, framesMax: 3 },
                death: { image: this.graphicAssets.kenji_death.img, framesMax: 7 }
            },
            {
                offset: { x: -170, y: 168 },
                width: 170,
                height: 50
            }
        );
        this.gameObjects.push(this.playerB);

        this.decreaseTimer();
    }

    Update(deltaTime) {
        super.Update(deltaTime);

        // Player movement
        this.playerA.velocity.x = 0;
        if (Input.IsKeyPressed(KEY_A)) {
            this.playerA.velocity.x = -5;
            this.playerA.switchSprite('run');
        } else if (Input.IsKeyPressed(KEY_D)) {
            this.playerA.velocity.x = 5;
            this.playerA.switchSprite('run');
        } else {
            this.playerA.switchSprite('idle');
        }

        if (this.playerA.velocity.y < 0) {
            this.playerA.switchSprite('jump');
        } else if (this.playerA.velocity.y > 0) {
            this.playerA.switchSprite('fall');
        }

        if (Input.IsKeyDown(KEY_W)) {
            if (this.playerA.position.y === 334) { // Allow jump only from ground
                 this.playerA.velocity.y = -20;
            }
        }
        
        if (Input.IsKeyDown(KEY_SPACE)) {
            this.playerA.attack();
        }

        // Enemy movement (basic AI)
        this.playerB.velocity.x = 0;
        this.playerB.switchSprite('idle');


        // Collision detection & health update
        if (this.rectangularCollision({ rectangle1: this.playerA, rectangle2: this.playerB }) && this.playerA.isAttacking && this.playerA.actualFrame === 4) {
            this.playerB.takeHit();
            this.playerA.isAttacking = false;
            document.querySelector('#enemyHealth').style.width = this.playerB.health + '%';
        }
        if (this.playerA.isAttacking && this.playerA.actualFrame === 4) {
             this.playerA.isAttacking = false;
        }


        if (this.rectangularCollision({ rectangle1: this.playerB, rectangle2: this.playerA }) && this.playerB.isAttacking && this.playerB.actualFrame === 2) {
            this.playerA.takeHit();
            this.playerB.isAttacking = false;
            document.querySelector('#playerHealth').style.width = this.playerA.health + '%';
        }
         if (this.playerB.isAttacking && this.playerB.actualFrame === 2) {
             this.playerB.isAttacking = false;
        }

        // End game based on health
        if (this.playerB.health <= 0 || this.playerA.health <= 0) {
            this.determineWinner({ player: this.playerA, enemy: this.playerB, timerId: this.timerId });
        }
    }
    
    Draw() {
        // Clear canvas
        this.renderer.DrawFillRectangle(0, 0, this.screenWidth, this.screenHeight, 'black');
        super.Draw();
    }


    rectangularCollision({ rectangle1, rectangle2 }) {
        return (
            rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x &&
            rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
            rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
            rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
        );
    }

    determineWinner({ player, enemy, timerId }) {
        clearTimeout(timerId);
        this.displayText.style.display = 'flex';
        if (player.health === enemy.health) {
            this.displayText.innerHTML = 'Tie';
        } else if (player.health > enemy.health) {
            this.displayText.innerHTML = 'Player 1 Wins';
        } else if (player.health < enemy.health) {
            this.displayText.innerHTML = 'Player 2 Wins';
        }
    }

    decreaseTimer() {
        if (this.timer > 0) {
            this.timerId = setTimeout(() => this.decreaseTimer(), 1000);
            this.timer--;
            document.querySelector('#timer').innerHTML = this.timer;
        }

        if (this.timer === 0) {
            this.determineWinner({ player: this.playerA, enemy: this.playerB, timerId: this.timerId });
        }
    }
}
