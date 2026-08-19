/**
 * Fighting Game - a spark.js port of an example game built by Chris Courses
 * 1v1 2D fighting game
 * Original project: https://github.com/chriscourses/fighting-game
 */

// ── FightingGame Class ───────────────────────────────────────────────────────

class FightingGame extends Game {
    constructor(renderer) {
        super(renderer);

        this.Configure({
            screenWidth: 1024,
            screenHeight: 576,
            imageSmoothingEnabled: false,
            drawColliders: true
        });

        this.graphicAssets = {
            background: { path: 'src/examples/fighting_game/assets/background.png', img: null },
            shop:       { path: 'src/examples/fighting_game/assets/shop.png',       img: null },

            kenji_idle:    { path: 'src/examples/fighting_game/assets/kenji/Idle.png',     img: null },
            kenji_run:     { path: 'src/examples/fighting_game/assets/kenji/Run.png',      img: null },
            kenji_jump:    { path: 'src/examples/fighting_game/assets/kenji/Jump.png',     img: null },
            kenji_fall:    { path: 'src/examples/fighting_game/assets/kenji/Fall.png',     img: null },
            kenji_attack1: { path: 'src/examples/fighting_game/assets/kenji/Attack1.png',  img: null },
            kenji_attack2: { path: 'src/examples/fighting_game/assets/kenji/Attack2.png',  img: null },
            kenji_takeHit: { path: 'src/examples/fighting_game/assets/kenji/Take hit.png', img: null },
            kenji_death:   { path: 'src/examples/fighting_game/assets/kenji/Death.png',    img: null },
            
            mack_idle:    { path: 'src/examples/fighting_game/assets/samuraiMack/Idle.png',     img: null },
            mack_run:     { path: 'src/examples/fighting_game/assets/samuraiMack/Run.png',      img: null },
            mack_jump:    { path: 'src/examples/fighting_game/assets/samuraiMack/Jump.png',     img: null },
            mack_fall:    { path: 'src/examples/fighting_game/assets/samuraiMack/Fall.png',     img: null },
            mack_attack1: { path: 'src/examples/fighting_game/assets/samuraiMack/Attack1.png',  img: null },
            mack_attack2: { path: 'src/examples/fighting_game/assets/samuraiMack/Attack2.png',  img: null },
            mack_takeHit: { path: 'src/examples/fighting_game/assets/samuraiMack/Take hit - white silhouette.png', img: null },
            mack_death:   { path: 'src/examples/fighting_game/assets/samuraiMack/Death.png',    img: null },
        }
        
        // Game state
        this.gameOver = false;
        this.gameWinner = null;
        this.matchTime = 60;
        this.matchTimeDisplay = 60;

        // Background objects
        this.bgLayer = null;
        this.shopLayer = null;
        this.bgLayers = null;

        this.player = null;
        this.enemy  = null;
        this.rect = null; // a red rectangle to test the camera

        this.floorY = 0;this.screenHeight - 140

        this.camera = null;
    }
    
    Start() {
        super.Start();

        // Setup input system
        this.SetupInput();

        this.floorY = this.screenHeight - 96;

        this.rect = new RectangleGO(new Vector2(this.screenHalfWidth, this.floorY), 40, 80, Color.red);
        this.rect.pivot.y = 40;
        this.gameObjects.push(this.rect);

        this.camera = new FollowCamera(Vector2.Copy(this.rect.position), this.rect, -100, 100, 160, 200, 5, new Vector2(0, -this.screenHalfHeight + 96));
        
        // Initialize background
        this.bgLayer = new SpriteBackgroundLayer(this.graphicAssets.background.img, Vector2.Zero(), 0, 1, new Vector2(1, 1));
        this.shopLayer = new SpriteBackgroundLayer(this.graphicAssets.shop.img, new Vector2(600, 128), 0, 2.75, new Vector2(0.95, 0.98));
        this.bgLayers = new BackgroundLayers(this.camera, [this.bgLayer, this.shopLayer]);
        this.bgLayers.Start();

        // Create Player 1 - Samurai Mack
        this.player = new Fighter(
            new Vector2(50, 330),
            {
                scale: 2.5,
                sprites: {
                    idle:    { img: this.graphicAssets.mack_idle.img,    framesMax: 8 },
                    run:     { img: this.graphicAssets.mack_run.img,     framesMax: 8 },
                    jump:    { img: this.graphicAssets.mack_jump.img,    framesMax: 2 },
                    fall:    { img: this.graphicAssets.mack_fall.img,    framesMax: 2 },
                    attack1: { img: this.graphicAssets.mack_attack1.img, framesMax: 6 },
                    attack2: { img: this.graphicAssets.mack_attack2.img, framesMax: 6 },
                    takeHit: { img: this.graphicAssets.mack_takeHit.img, framesMax: 4 },
                    death:   { img: this.graphicAssets.mack_death.img,   framesMax: 6 }
                },
                bodyCollider: { w: 50, h: 150 },
                attackBox: {
                    offset: { x: 100, y: 50 },
                    width: 160,
                    height: 50
                }
            }
        );
        this.gameObjects.push(this.player);
        this.player.Start();

        // Create attack box collider for Player 1
        // const p1AttackPos = new Vector2(
        //     this.player.position.x + this.player.attackBoxOffset.x + this.player.attackBoxWidth / 2,
        //     this.player.position.y + this.player.attackBoxOffset.y + this.player.attackBoxHeight / 2
        // );
        // this.player.attackCollider = new RectangleCollider(
        //     p1AttackPos,
        //     this.player.attackBoxWidth,
        //     this.player.attackBoxHeight,
        //     this.player
        // );
        // this.player.attackCollider.fighter = this.player;
        // this.player.attackCollider.isAttackBox = true;
        // this.AddCollider(this.player.attackCollider);

        // Create Player 2 - Kenji
        this.enemy = new Fighter(
            new Vector2(900, 330),
            {
                scale: 2.5,
                sprites: {
                    idle:    { img: this.graphicAssets.kenji_idle.img,    framesMax: 4 },
                    run:     { img: this.graphicAssets.kenji_run.img,     framesMax: 8 },
                    jump:    { img: this.graphicAssets.kenji_jump.img,    framesMax: 2 },
                    fall:    { img: this.graphicAssets.kenji_fall.img,    framesMax: 2 },
                    attack1: { img: this.graphicAssets.kenji_attack1.img, framesMax: 4 },
                    attack2: { img: this.graphicAssets.kenji_attack2.img, framesMax: 4 },
                    takeHit: { img: this.graphicAssets.kenji_takeHit.img, framesMax: 3 },
                    death:   { img: this.graphicAssets.kenji_death.img,   framesMax: 7 }
                },
                bodyCollider: { w: 50, h: 150 },
                attackBox: {
                    offset: { x: -170, y: 50 },
                    width: 170,
                    height: 50
                }
            }
        );
        this.gameObjects.push(this.enemy);
        this.enemy.Start();
        
        // // Create attack box collider for Player 2
        // const p2AttackPos = new Vector2(
        //     this.enemy.position.x + this.enemy.attackBoxOffset.x + this.enemy.attackBoxWidth / 2,
        //     this.enemy.position.y + this.enemy.attackBoxOffset.y + this.enemy.attackBoxHeight / 2
        // );
        // this.enemy.attackCollider = new RectangleCollider(
        //     p2AttackPos,
        //     this.enemy.attackBoxWidth,
        //     this.enemy.attackBoxHeight,
        //     this.enemy
        // );
        // this.enemy.attackCollider.fighter = this.enemy;
        // this.enemy.attackCollider.isAttackBox = true;
        // this.AddCollider(this.enemy.attackCollider);
        
        // Start match timer
        this.startMatchTimer();
    }
    
    Update(deltaTime) {
        // debug move the red rectangle
        const rectSpeed = 200;
        if (Input.IsKeyPressed(KEY_A))
            this.rect.position.x -= rectSpeed * deltaTime;
        if (Input.IsKeyPressed(KEY_D))
            this.rect.position.x += rectSpeed * deltaTime;
        if (Input.IsKeyPressed(KEY_W))
            this.rect.position.y -= rectSpeed * deltaTime;
        if (Input.IsKeyPressed(KEY_S))
            this.rect.position.y += rectSpeed * deltaTime;

        super.Update(deltaTime);

        this.bgLayers.Update(deltaTime);

        this.camera.Update(deltaTime);
        
        // Reset velocity each frame
        // this.player.velocity.x = 0;
        // this.enemy.velocity.x = 0;
        
        // if (!this.gameOver) {
        //     // Player 1 controls using Input API
        //     if (Input.GetAction('P1_MoveLeft')) {
        //         this.player.velocity.x = -5;
        //         this.player.switchAnimation('run');
        //     } else if (Input.GetAction('P1_MoveRight')) {
        //         this.player.velocity.x = 5;
        //         this.player.switchAnimation('run');
        //     } else {
        //         this.player.switchAnimation('idle');
        //     }
            
        //     // Player 1 jump
        //     if (Input.GetActionDown('P1_Jump') && this.player.position.y >= 330) {
        //         this.player.velocity.y = -20;
        //     }
            
        //     // Player 1 attack
        //     if (Input.GetActionDown('P1_Attack')) {
        //         this.player.attack();
        //     }
            
        //     // Player 1 air animation
        //     if (this.player.velocity.y < 0 && this.player.currentAnimationName !== 'attack1') {
        //         this.player.switchAnimation('jump');
        //     } else if (this.player.velocity.y > 0 && this.player.currentAnimationName !== 'attack1') {
        //         this.player.switchAnimation('fall');
        //     }
            
        //     // Player 2 controls using Input API
        //     if (Input.GetAction('P2_MoveLeft')) {
        //         this.enemy.velocity.x = -5;
        //         this.enemy.switchAnimation('run');
        //     } else if (Input.GetAction('P2_MoveRight')) {
        //         this.enemy.velocity.x = 5;
        //         this.enemy.switchAnimation('run');
        //     } else {
        //         this.enemy.switchAnimation('idle');
        //     }
            
        //     // Player 2 jump
        //     if (Input.GetActionDown('P2_Jump') && this.enemy.position.y >= 330) {
        //         this.enemy.velocity.y = -20;
        //     }
            
        //     // Player 2 attack
        //     if (Input.GetActionDown('P2_Attack')) {
        //         this.enemy.attack();
        //     }
            
        //     // Player 2 air animation
        //     if (this.enemy.velocity.y < 0 && this.enemy.currentAnimationName !== 'attack1') {
        //         this.enemy.switchAnimation('jump');
        //     } else if (this.enemy.velocity.y > 0 && this.enemy.currentAnimationName !== 'attack1') {
        //         this.enemy.switchAnimation('fall');
        //     }
            
        //     // Reset attack states when animations complete
        //     this.resetAttackStates();
        // }
    }

    Draw() {
        this.camera.PreDraw(this.renderer);

        this.bgLayers.Draw(this.renderer);
        
        super.Draw();

        this.camera.PostDraw(this.renderer);
    }

    /**
     * Handle collision detection callback from engine
     * Called when any registered collider collides with another
     */
    OnCollisionEnter(myCollider, otherCollider) {
        // Check if an attack box hit a body collider
        if (myCollider.isAttackBox && otherCollider.isBody) {
            const attacker = myCollider.fighter;
            const defender = otherCollider.fighter;
            
            // Don't let fighter hit themselves
            if (attacker === defender) return;
            
            // Check if attacker is attacking and on the right frame
            if (!attacker.isAttacking || attacker.hitLanded) return;
            
            const currentFrame = attacker.getCurrentFrame();
            
            // Player 1 hits on frame 4, Player 2 hits on frame 2
            const hitFrame = (attacker === this.player) ? 4 : 2;
            
            if (currentFrame === hitFrame) {
                defender.takeHit();
                attacker.hitLanded = true; // Prevent multiple hits from same attack
                this.updateHealthBars();
                
                // Check win conditions
                if (defender.health <= 0) {
                    this.endMatch();
                }
            }
        }
    }

    SetupInput() {
        // Player 1 actions: WASD + Space
        Input.RegisterAction('P1_MoveLeft', [{ type: 'key', keyCode: KEY_A }]);
        Input.RegisterAction('P1_MoveRight', [{ type: 'key', keyCode: KEY_D }]);
        Input.RegisterAction('P1_Jump', [{ type: 'key', keyCode: KEY_W }]);
        Input.RegisterAction('P1_Attack', [{ type: 'key', keyCode: KEY_SPACE }]);
        
        // Player 2 actions: Arrow Keys + down to attack
        Input.RegisterAction('P2_MoveLeft', [{ type: 'key', keyCode: KEY_LEFT }]);
        Input.RegisterAction('P2_MoveRight', [{ type: 'key', keyCode: KEY_RIGHT }]);
        Input.RegisterAction('P2_Jump', [{ type: 'key', keyCode: KEY_UP }]);
        Input.RegisterAction('P2_Attack', [{ type: 'key', keyCode: KEY_DOWN }]);
    }
    
    /**
     * Add collider to the game
     */
    addCollider(collider) {
        // Manual collider tracking since we handle custom collision
        if (!this.customColliders) {
            this.customColliders = [];
        }
        this.customColliders.push(collider);
    }
    
    /**
     * Start the 60-second match timer using engine timers
     */
    startMatchTimer() {
        const tickTimer = () => {
            if (this.matchTime > 0 && !this.gameOver) {
                this.matchTime--;
                this.matchTimeDisplay = this.matchTime;
                this.updateTimerDisplay();
                this.Invoke(tickTimer, 1.0);
            } else if (!this.gameOver) {
                this.endMatch();
            }
        };
        tickTimer();
    }
    
    /**
     * Update timer display in DOM
     */
    updateTimerDisplay() {
        const timerEl = document.querySelector('#timer');
        if (timerEl) {
            timerEl.textContent = this.matchTimeDisplay;
        }
    }
    
    /**
     * Update health bars in DOM
     */
    updateHealthBars() {
        const playerHealth = document.querySelector('#playerHealth .health-bar');
        const enemyHealth = document.querySelector('#enemyHealth .health-bar');
        
        if (playerHealth) {
            playerHealth.style.width = this.player.health + '%';
        }
        if (enemyHealth) {
            enemyHealth.style.width = this.enemy.health + '%';
        }
    }
    
    /**
     * Reset attack state when animation completes
     */
    resetAttackStates() {
        // Reset player attack flag when attack animation completes
        if (this.player.isAttacking && this.player.currentAnimationName === 'attack1') {
            const attackAnim = this.player.animationObjects['attack1'];
            if (attackAnim && this.player.getCurrentFrame() >= attackAnim.frameCount[0] - 1) {
                this.player.isAttacking = false;
                this.player.hitLanded = false;
            }
        }
        
        // Reset enemy attack flag when attack animation completes
        if (this.enemy.isAttacking && this.enemy.currentAnimationName === 'attack1') {
            const attackAnim = this.enemy.animationObjects['attack1'];
            if (attackAnim && this.enemy.getCurrentFrame() >= attackAnim.frameCount[0] - 1) {
                this.enemy.isAttacking = false;
                this.enemy.hitLanded = false;
            }
        }
    }
    
    /**
     * End the match and determine winner
     */
    endMatch() {
        this.gameOver = true;
        
        let message = 'Tie';
        if (this.player.health > this.enemy.health) {
            message = 'Player 1 Wins';
        } else if (this.enemy.health > this.player.health) {
            message = 'Player 2 Wins';
        }
        
        const displayEl = document.querySelector('#displayText');
        if (displayEl) {
            displayEl.textContent = message;
            displayEl.style.display = 'flex';
        }
    }
}

window.onload = () => {
    Init(FightingGame, "canvas");
};