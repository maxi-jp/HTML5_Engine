/**
 * Fighting Game - spark.js port (Engine-Native Implementation)
 * A 1v1 2D fighting game with sprite animations and collision detection
 * Uses SSAnimationObjectBasic for each animation state
 */

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
    this.animationsLoaded = false;
    
    // Combat system
    this.isAttacking = false;
    this.hitLanded = false; // Track if current attack already hit
    
    // Collider for being hit (50x150 px body)
    this.bodyCollider = null;
    
    // Attack box collider (created by game after initialization)
    this.attackCollider = null;
    this.attackBoxOffset = config.attackBox.offset;
    this.attackBoxWidth = config.attackBox.width;
    this.attackBoxHeight = config.attackBox.height;
    
    // Animation frame dimensions (calculated from first loaded image)
    this.frameWidth = 0;
    this.frameHeight = 0;
    
    // Load all animation sprite sheets
    this.loadAnimations(config.sprites);
  }
  
  /**
   * Load all animation sprite images and create SSAnimationObjectBasic for each
   */
  loadAnimations(spritesConfig) {
    console.log('Fighter: Loading animations...');
    const frameDuration = 5 / 60; // 5 frames at 60fps = ~0.083s per frame
    
    let loadedCount = 0;
    const totalAnims = Object.keys(spritesConfig).length;
    
    for (const [name, spriteData] of Object.entries(spritesConfig)) {
      const img = new Image();
      
      img.onload = () => {
        console.log(`Fighter: Animation '${name}' loaded`);
        // Calculate frame dimensions from the sprite sheet
        const frameW = img.width / spriteData.framesMax;
        const frameH = img.height;
        
        if (this.frameWidth === 0) {
          this.frameWidth = frameW;
          this.frameHeight = frameH;
        }
        
        // Create SSAnimationObjectBasic for this animation
        // Since each PNG is a single-row sprite sheet, we use frameCount = [framesMax]
        this.animationObjects[name] = new SSAnimationObjectBasic(
          this.position,
          0, // rotation
          this.scale,
          img,
          frameW,
          frameH,
          [spriteData.framesMax], // Single animation (row 0)
          frameDuration
        );
        
        loadedCount++;
        if (loadedCount === totalAnims) {
          this.animationsLoaded = true;
          console.log('Fighter: All animations loaded');
        }
      };
      
      img.onerror = () => {
        console.warn(`Fighter: Failed to load animation: ${spriteData.imageSrc}`);
        loadedCount++;
        if (loadedCount === totalAnims) {
          this.animationsLoaded = true;
          console.log('Fighter: All animations loaded (with errors)');
        }
      };
      
      img.src = spriteData.imageSrc;
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
    if (!this.animationsLoaded) return;
    
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
    if (!this.animationsLoaded) return;
    
    const currentAnim = this.animationObjects[this.currentAnimationName];
    if (currentAnim) {
      currentAnim.Draw(renderer);
    }
  }
}

// ── FightingGame Class ───────────────────────────────────────────────────────

class FightingGame extends Game {
  constructor(renderer) {
    super(renderer);
    this.Configure({
      screenWidth: 1024,
      screenHeight: 576
    });
    
    // Game state
    this.gameOver = false;
    this.gameWinner = null;
    this.matchTime = 60;
    this.matchTimeDisplay = 60;
    this.assetsReady = false;
    
    // Input actions and axes
    this.inputReady = false;
  }
  
  /**
   * Initialize input system with actions
   */
  setupInput() {
    // Player 1 actions
    Input.RegisterAction('P1_MoveLeft', [{ type: 'key', keyCode: 65 }]); // A
    Input.RegisterAction('P1_MoveRight', [{ type: 'key', keyCode: 68 }]); // D
    Input.RegisterAction('P1_Jump', [{ type: 'key', keyCode: 87 }]); // W
    Input.RegisterAction('P1_Attack', [{ type: 'key', keyCode: 32 }]); // Space
    
    // Player 2 actions
    Input.RegisterAction('P2_MoveLeft', [{ type: 'key', keyCode: 37 }]); // Arrow Left
    Input.RegisterAction('P2_MoveRight', [{ type: 'key', keyCode: 39 }]); // Arrow Right
    Input.RegisterAction('P2_Jump', [{ type: 'key', keyCode: 38 }]); // Arrow Up
    Input.RegisterAction('P2_Attack', [{ type: 'key', keyCode: 40 }]); // Arrow Down
    
    this.inputReady = true;
  }
  
  /**
   * Load game assets
   */
  async loadAssets() {
    return new Promise((resolve) => {
      const assets = [
        { name: 'background', path: 'src/examples/fighting_game/assets/background.png' },
        { name: 'shop', path: 'src/examples/fighting_game/assets/shop.png' }
      ];
      
      let loaded = 0;
      const images = {};
      
      assets.forEach(asset => {
        const img = new Image();
        img.onload = () => {
          console.log(`Asset loaded: ${asset.name} (${img.width}x${img.height})`);
          images[asset.name] = img;
          loaded++;
          if (loaded === assets.length) {
            this.assetsReady = true;
            console.log('All FightingGame assets loaded');
            resolve(images);
          }
        };
        img.onerror = () => {
          console.error(`Failed to load asset: ${asset.path}`);
          loaded++;
          if (loaded === assets.length) {
            this.assetsReady = true;
            resolve(images);
          }
        };
        img.src = asset.path;
      });
    });
  }
  
  Start() {
    console.log('FightingGame.Start() called');
    
    // Setup input system
    this.setupInput();
    
    // Load static assets and initialize game
    console.log('Loading assets...');
    this.loadAssets().then((images) => {
      console.log('Assets loaded:', images);
      this.initializeGame(images);
      console.log('Game initialized');
    });
  }
  
  /**
   * Initialize game after assets load
   */
  initializeGame(images) {
    // Create background
    const bgLayer = new SpriteBackgroundLayer(
      new Vector2(0, 0),
      images.background,
      1,
      1,
      0
    );
    this.gameObjects.push(bgLayer);
    
    // Create shop decoration layer
    const shopLayer = new SpriteBackgroundLayer(
      new Vector2(600, 128),
      images.shop,
      2.75,
      2.75,
      0
    );
    this.gameObjects.push(shopLayer);
    
    // Create Player 1 - Samurai Mack
    this.player = new Fighter(
      new Vector2(50, 330),
      {
        scale: 2.5,
        sprites: {
          idle: { imageSrc: 'src/examples/fighting_game/assets/samuraiMack/Idle.png', framesMax: 8 },
          run: { imageSrc: 'src/examples/fighting_game/assets/samuraiMack/Run.png', framesMax: 8 },
          jump: { imageSrc: 'src/examples/fighting_game/assets/samuraiMack/Jump.png', framesMax: 2 },
          fall: { imageSrc: 'src/examples/fighting_game/assets/samuraiMack/Fall.png', framesMax: 2 },
          attack1: { imageSrc: 'src/examples/fighting_game/assets/samuraiMack/Attack1.png', framesMax: 6 },
          takeHit: { imageSrc: 'src/examples/fighting_game/assets/samuraiMack/Take Hit - white silhouette.png', framesMax: 4 },
          death: { imageSrc: 'src/examples/fighting_game/assets/samuraiMack/Death.png', framesMax: 6 }
        },
        attackBox: {
          offset: { x: 100, y: 50 },
          width: 160,
          height: 50
        }
      }
    );
    this.gameObjects.push(this.player);
    
    // Create body collider for Player 1
    this.player.bodyCollider = new RectangleCollider(
      this.player.position,
      50,
      150,
      this.player
    );
    this.player.bodyCollider.fighter = this.player;
    this.player.bodyCollider.isBody = true;
    this.AddCollider(this.player.bodyCollider);
    
    // Create attack box collider for Player 1
    const p1AttackPos = new Vector2(
      this.player.position.x + this.player.attackBoxOffset.x + this.player.attackBoxWidth / 2,
      this.player.position.y + this.player.attackBoxOffset.y + this.player.attackBoxHeight / 2
    );
    this.player.attackCollider = new RectangleCollider(
      p1AttackPos,
      this.player.attackBoxWidth,
      this.player.attackBoxHeight,
      this.player
    );
    this.player.attackCollider.fighter = this.player;
    this.player.attackCollider.isAttackBox = true;
    this.AddCollider(this.player.attackCollider);
    
    // Create Player 2 - Kenji
    this.enemy = new Fighter(
      new Vector2(900, 330),
      {
        scale: 2.5,
        sprites: {
          idle: { imageSrc: 'src/examples/fighting_game/assets/kenji/Idle.png', framesMax: 4 },
          run: { imageSrc: 'src/examples/fighting_game/assets/kenji/Run.png', framesMax: 8 },
          jump: { imageSrc: 'src/examples/fighting_game/assets/kenji/Jump.png', framesMax: 2 },
          fall: { imageSrc: 'src/examples/fighting_game/assets/kenji/Fall.png', framesMax: 2 },
          attack1: { imageSrc: 'src/examples/fighting_game/assets/kenji/Attack1.png', framesMax: 4 },
          takeHit: { imageSrc: 'src/examples/fighting_game/assets/kenji/Take hit.png', framesMax: 3 },
          death: { imageSrc: 'src/examples/fighting_game/assets/kenji/Death.png', framesMax: 7 }
        },
        attackBox: {
          offset: { x: -170, y: 50 },
          width: 170,
          height: 50
        }
      }
    );
    this.gameObjects.push(this.enemy);
    
    // Create body collider for Player 2
    this.enemy.bodyCollider = new RectangleCollider(
      this.enemy.position,
      50,
      150,
      this.enemy
    );
    this.enemy.bodyCollider.fighter = this.enemy;
    this.enemy.bodyCollider.isBody = true;
    this.AddCollider(this.enemy.bodyCollider);
    
    // Create attack box collider for Player 2
    const p2AttackPos = new Vector2(
      this.enemy.position.x + this.enemy.attackBoxOffset.x + this.enemy.attackBoxWidth / 2,
      this.enemy.position.y + this.enemy.attackBoxOffset.y + this.enemy.attackBoxHeight / 2
    );
    this.enemy.attackCollider = new RectangleCollider(
      p2AttackPos,
      this.enemy.attackBoxWidth,
      this.enemy.attackBoxHeight,
      this.enemy
    );
    this.enemy.attackCollider.fighter = this.enemy;
    this.enemy.attackCollider.isAttackBox = true;
    this.AddCollider(this.enemy.attackCollider);
    
    // Start match timer
    this.startMatchTimer();
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
  
  /**
   * Main game update loop using Input API
   */
  Update(deltaTime) {
    // Call parent Update to update all gameObjects
    super.Update(deltaTime);
    
    if (!this.inputReady || !this.assetsReady) {
      return;
    }
    
    // Check if fighters are initialized and animations are loaded
    if (!this.player || !this.enemy) {
      return;
    }
    
    if (!this.player.animationsLoaded || !this.enemy.animationsLoaded) {
      return;
    }
    
    // Reset velocity each frame
    this.player.velocity.x = 0;
    this.enemy.velocity.x = 0;
    
    if (!this.gameOver) {
      // Player 1 controls using Input API
      if (Input.GetAction('P1_MoveLeft')) {
        this.player.velocity.x = -5;
        this.player.switchAnimation('run');
      } else if (Input.GetAction('P1_MoveRight')) {
        this.player.velocity.x = 5;
        this.player.switchAnimation('run');
      } else {
        this.player.switchAnimation('idle');
      }
      
      // Player 1 jump
      if (Input.GetActionDown('P1_Jump') && this.player.position.y >= 330) {
        this.player.velocity.y = -20;
      }
      
      // Player 1 attack
      if (Input.GetActionDown('P1_Attack')) {
        this.player.attack();
      }
      
      // Player 1 air animation
      if (this.player.velocity.y < 0 && this.player.currentAnimationName !== 'attack1') {
        this.player.switchAnimation('jump');
      } else if (this.player.velocity.y > 0 && this.player.currentAnimationName !== 'attack1') {
        this.player.switchAnimation('fall');
      }
      
      // Player 2 controls using Input API
      if (Input.GetAction('P2_MoveLeft')) {
        this.enemy.velocity.x = -5;
        this.enemy.switchAnimation('run');
      } else if (Input.GetAction('P2_MoveRight')) {
        this.enemy.velocity.x = 5;
        this.enemy.switchAnimation('run');
      } else {
        this.enemy.switchAnimation('idle');
      }
      
      // Player 2 jump
      if (Input.GetActionDown('P2_Jump') && this.enemy.position.y >= 330) {
        this.enemy.velocity.y = -20;
      }
      
      // Player 2 attack
      if (Input.GetActionDown('P2_Attack')) {
        this.enemy.attack();
      }
      
      // Player 2 air animation
      if (this.enemy.velocity.y < 0 && this.enemy.currentAnimationName !== 'attack1') {
        this.enemy.switchAnimation('jump');
      } else if (this.enemy.velocity.y > 0 && this.enemy.currentAnimationName !== 'attack1') {
        this.enemy.switchAnimation('fall');
      }
      
      // Reset attack states when animations complete
      this.resetAttackStates();
    }
  }
}
