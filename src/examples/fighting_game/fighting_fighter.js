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
        
        // Animation system - uses SSAnimationObjectBasic for each animation state
        this.animationObjects = {};
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
        this.CreateAnimations(config.sprites);
    }

    Start() {
        // initialize body collider
        this.collider = new RectangleCollider(Vector2.Zero(), this.config.bodyCollider.w, this.config.bodyCollider.h, this);
        game.AddCollider(this.collider);

        // initialize attack collider
        // TODO doing this...
        this.attackCollider = new RectangleCollider(Vector2.Zero(), this.attackBoxWidth, this.attackBoxHeight);

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
        game.AddCollider(this.attackCollider);
    }
    
    /**
     * Load all animation sprite images and create SSAnimationObjectBasic for each
     */
    CreateAnimations(spritesConfig) {
        const frameDuration = 5 / 60; // 5 frames at 60fps = ~0.083s per frame
        
        let loadedCount = 0;
        
        for (const [name, spriteData] of Object.entries(spritesConfig)) {
            // Calculate frame dimensions from the sprite sheet
            const frameW = spriteData.img.width / spriteData.framesMax;
            const frameH = spriteData.img.height;
                
            // Create SSAnimationObjectBasic for this animation
            // Since each PNG is a single-row sprite sheet, we use frameCount = [framesMax]
            this.animationObjects[name] = new SSAnimationObjectBasic(
                this.position,
                0, // rotation
                this.scale,
                spriteData.img,
                frameW,
                frameH,
                [spriteData.framesMax], // Single animation (row 0)
                frameDuration
            );
        }
    }
    
    /**
     * Switch to a different animation
     * Respects animation priority (death > attack > takeHit)
     */
    switchAnimation(animName) {
        if (!this.animationObjects[animName]) return;
        if (this.currentAnimationName === animName) return;
        
        // Death animation cannot be interrupted
        if (this.currentAnimationName === 'death') return;
        
        // Attack animation cannot be interrupted until complete
        if (this.currentAnimationName === 'attack1') {
            const anim = this.animationObjects['attack1'];
            if (anim && anim.actualFrame < anim.frameCount[0] - 1) return;
        }
        
        // TakeHit animation cannot be interrupted until complete
        if (this.currentAnimationName === 'takeHit') {
            const anim = this.animationObjects['takeHit'];
            if (anim && anim.actualFrame < anim.frameCount[0] - 1) return;
        }
        
        // Switch to new animation and reset it
        this.currentAnimationName = animName;
        const newAnim = this.animationObjects[animName];
        if (newAnim) {
            newAnim.PlayAnimationLoop(0, true); // Always play row 0, reset to frame 0
        }
    }
    
    /**
     * Get current animation frame for collision detection
     */
    getCurrentFrame() {
        const anim = this.animationObjects[this.currentAnimationName];
        return anim ? anim.actualFrame : 0;
    }
    
    /**
     * Perform attack action
     */
    attack() {
        this.switchAnimation('attack1');
        this.isAttacking = true;
        this.hitLanded = false; // Reset hit flag for new attack
    }
    
    /**
     * Take damage from opponent
     */
    takeHit() {
        this.health -= 20;
        if (this.health <= 0) {
            this.health = 0;
            this.switchAnimation('death');
        } else {
            this.switchAnimation('takeHit');
        }
    }
    
    /**
     * Update physics and animation
     */
    Update(deltaTime) {
        super.Update(deltaTime);
        
        // Apply velocity
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        
        // Gravity
        const GROUND_Y = 330;
        const GRAVITY = 0.7;
        
        if (this.position.y >= GROUND_Y) {
            this.position.y = GROUND_Y;
            this.velocity.y = 0;
        } else {
            this.velocity.y += GRAVITY;
        }
        
        // Update attack box collider position relative to fighter
        if (this.attackCollider) {
            const attackPos = new Vector2(
                this.position.x + this.attackBoxOffset.x + this.attackBoxWidth / 2,
                this.position.y + this.attackBoxOffset.y + this.attackBoxHeight / 2
            );
            this.attackCollider.position.Set(attackPos);
        }
        
        // Update current animation object
        const currentAnim = this.animationObjects[this.currentAnimationName];
        if (currentAnim) {
            currentAnim.position = this.position;
            currentAnim.Update(deltaTime);
            
            // Check if death animation completed
            if (this.currentAnimationName === 'death' &&
                    currentAnim.actualFrame >= currentAnim.frameCount[0] - 1) {
                this.dead = true;
            }
        }
        
        // Update body collider
        if (this.bodyCollider) {
            this.bodyCollider.position.Set(this.position);
        }
    }
    
    /**
     * Draw the current animation
     */
    Draw(renderer) {
        this.animationObjects[this.currentAnimationName].Draw(renderer);
    }
}