// ── Fighter Class ────────────────────────────────────────────────────────────

class Fighter extends GameObject {
    constructor(position, config) {
        super(position);
        
        // Fighter state
        this.velocity = new Vector2(0, 0);
        this.config = config;
        this.health = 100;
        this.dead = false;
        this.scale = config.scale;
        this.actions = config.actions;
        this.speed = config.speed;
        this.jumpSpeed = config.jumpSpeed;
        this.attackFrame = config.attackFrame;
        
        // Animation system - uses SSAnimationObjectBasic for each animation state
        this.animationObjects = {};
        this.currentAnimation = null;
        this.currentAnimationName = 'idle';
        
        // Combat system
        this.isAttacking = false;
        this.hitLanded = false; // Track if current attack already hit
        
        // Attack box collider (created by game after initialization)
        this.attackCollider = null;
        this.attackBoxOffset = config.attackBox.offset;
        this.attackBoxWidth = config.attackBox.width;
        this.attackBoxHeight = config.attackBox.height;
        
        // Load all animation sprite sheets
        this.CreateAnimations(config.spriteData);
    }

    Start() {
        // initialize body collider
        this.collider = new RectangleCollider(new Vector2(0, -70), this.config.bodyCollider.w, this.config.bodyCollider.h, this);
        game.AddCollider(this.collider);

        // initialize attack collider
        const p1AttackPos = new Vector2(
            this.position.x + this.attackBoxOffset.x,
            this.position.y + this.attackBoxOffset.y
        );
        this.attackCollider = new RectangleCollider(
            p1AttackPos,
            this.attackBoxWidth,
            this.attackBoxHeight,
            this
        );
        game.AddCollider(this.attackCollider);
        
        // Start with the attack collider disabled
        this.attackCollider.enabled = false;
    }
    
    /**
     * Update physics and animation
     */
    Update(deltaTime) {
        super.Update(deltaTime);

        this.velocity.x = 0;

        // Input
        if (!game.gameOver) {
            // Player controls using Input API
            if (Input.GetAction(this.actions.left)) {
                this.velocity.x = -this.speed;
            }
            if (Input.GetAction(this.actions.right)) {
                this.velocity.x = this.speed;
            }

            // Player jump
            if (Input.GetActionDown(this.actions.jump) && this.position.y >= game.floorY) {
                this.velocity.y = -this.jumpSpeed;
            }
            
            // Player attack
            if (Input.GetActionDown(this.actions.attack)) {
                this.Attack();
            }
        }
        
        // Apply Gravity
        this.velocity.y += game.gravity * deltaTime;
        
        // Apply velocity to position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        
        // Floor collision (after moving)
        if (this.position.y >= game.floorY) {
            this.position.y = game.floorY;
            this.velocity.y = 0;
        }
        
        // Handle Air/Ground Animations
        if (this.velocity.y < 0) {
            this.SwitchAnimation('jump');
        }
        else if (this.velocity.y > 0 && this.position.y < game.floorY) {
            this.SwitchAnimation('fall');
        }
        else if (this.velocity.x !== 0) {
            this.SwitchAnimation('run');
        }
        else {
            this.SwitchAnimation('idle');
        }
        
        // Update attack box collider position relative to fighter
        this.attackCollider.position.Set(
            this.position.x + this.attackBoxOffset.x,
            this.position.y + this.attackBoxOffset.y
        );
        
        // Update current animation object
        this.currentAnimation.position.Set(this.position.x, this.position.y);
        this.currentAnimation.Update(deltaTime);
        
        // Manage attack collider state: 
        // Only enable it exactly on the attack frame if a hit hasn't landed yet
        this.attackCollider.enabled = this.isAttacking && !this.hitLanded && this.animationObjects[this.currentAnimationName].actualFrame === this.attackFrame;

        // Check if death animation completed
        if (this.currentAnimationName === 'death' &&
                this.currentAnimation.actualFrame >= this.currentAnimation.frameCount[0] - 1) {
            this.dead = true;
        }

        // Reset attack state when attack animation completes
        if (this.isAttacking && this.currentAnimationName === 'attack1' &&
            this.currentAnimation.actualFrame >= this.currentAnimation.frameCount[0] - 1) {
            this.isAttacking = false;
        }
    }
    
    Draw(renderer) {
        this.animationObjects[this.currentAnimationName].Draw(renderer);
    }

    OnCollisionEnter(myCollider, otherCollider) {
        // Determine who the enemy is
        const enemy = (this === game.player) ? game.enemy : game.player;
        
        // Check if our attack box hit the enemy's body collider
        if (myCollider === this.attackCollider && otherCollider === enemy.collider) {
            if (this.isAttacking && !this.hitLanded) {
                console.log("Hit!");
                this.hitLanded = true;
                enemy.TakeHit();
                
                // Notify the game to update UI and check win conditions
                game.OnFighterHit(enemy);
            }
        }
    }
    
    /**
     * Load all animation sprite images and create SSAnimationObjectBasic for each
     */
    CreateAnimations(spritesConfig) {
        const frameDuration = 5 / 60; // 5 frames at 60fps = ~0.083s per frame
        
        let loadedCount = 0;
        
        for (const [name, spriteData] of Object.entries(spritesConfig)) {
            // Calculate frame dimensions from the sprite sheet
            const frameW = game.graphicAssets[spriteData.assetKey].img.width / spriteData.framesMax;
            const frameH = game.graphicAssets[spriteData.assetKey].img.height;
                
            // Create SSAnimationObjectBasic objects for each animation
            // Since each PNG is a single-row sprite sheet, we use frameCount = [framesMax]
            this.animationObjects[name] = new SSAnimationObjectBasic(
                this.position,
                0, // rotation
                this.scale,
                game.graphicAssets[spriteData.assetKey].img,
                frameW,
                frameH,
                [spriteData.framesMax], // Single animation (row 0)
                frameDuration
            );
            this.animationObjects[name].pivot = spriteData.pivot;
        }

        this.currentAnimationName = 'idle';
        this.currentAnimation = this.animationObjects[this.currentAnimationName];
        this.currentAnimation.PlayAnimationLoop(0, true);
    }
    
    /**
     * Switch to a different animation
     * Respects animation priority (death > attack > takeHit)
     */
    SwitchAnimation(animName) {
        if (this.currentAnimationName === animName)
            return;
        
        // Death animation cannot be interrupted
        if (this.currentAnimationName === 'death')
            return;
        
        // Attack animation cannot be interrupted until complete
        if (this.currentAnimationName === 'attack1') {
            if (this.currentAnimation.actualFrame < this.currentAnimation.frameCount[0] - 1)
                return;
        }
        
        // TakeHit animation cannot be interrupted until complete
        if (this.currentAnimationName === 'takeHit') {
            if (this.currentAnimation.actualFrame < this.currentAnimation.frameCount[0] - 1)
                return;
        }
        
        // Switch to new animation and reset it
        this.currentAnimationName = animName;
        this.currentAnimation = this.animationObjects[animName];
        if (animName === 'idle')
            this.currentAnimation.PlayAnimationLoop(0, false); // play row 0, not reset frame
        else if (animName === 'death')
            this.currentAnimation.PlayAnimationOnce(0, true); // play row 0 with no loop, reset frame
        else
            this.currentAnimation.PlayAnimationLoop(0, true); // Always play row 0, reset to frame 0

        // force an update of the animation object position
        this.currentAnimation.position.Set(this.position.x, this.position.y);
    }
    
    Attack() {
        this.SwitchAnimation('attack1');
        this.isAttacking = true;
        this.hitLanded = false; // Reset hit flag for new attack
    }
    
    TakeHit() {
        console.log("Damage received!");

        this.isAttacking = false;
        this.health -= 20;

        if (this.health <= 0) {
            this.health = 0;
            this.SwitchAnimation('death');
        }
        else {
            this.SwitchAnimation('takeHit');
        }
    }
}