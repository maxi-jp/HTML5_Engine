// ============================================================
// Particle System
// Particle, ParticleEmitter and ParticleSystem classes.
// Requires: utils_math.js (Vector2, RandomBetweenFloat, PI2)
// ============================================================

const emitterType = {
    point: 0,
    area: 1
};

const defaultParticleConfig = {
    maxParticleCount: 500,

    globalCompositeOperation: "source-over",

    emitterType: emitterType.area,

    // Area emitter bounds (used when emitterType === area)
    AREA_X1: 0,
    AREA_Y1: 0,
    AREA_X2: 800,
    AREA_Y2: 640,

    // Particle velocity (pixels/sec)
    MIN_INITIAL_VELOCITY: 10,
    MAX_INITIAL_VELOCITY: 60,

    // Normalised direction range [-1, 1]
    MIN_DIRECTION_X: -1,
    MAX_DIRECTION_X:  1,
    MIN_DIRECTION_Y: -1,
    MAX_DIRECTION_Y:  1,

    // Opacity fade speed (units/sec)
    MIN_OPACITY_DECREMENT_VELOCITY: 0.5,
    MAX_OPACITY_DECREMENT_VELOCITY: 2.0,

    // Initial scale range
    MIN_INITIAL_SCALE: 0.1,
    MAX_INITIAL_SCALE: 0.5,

    // Scale growth speed (units/sec)
    MIN_SCALE_VELOCITY: 0.5,
    MAX_SCALE_VELOCITY: 0.75,

    // Initial rotation range (radians)
    MIN_INITIAL_ROTATION: 0,
    MAX_INITIAL_ROTATION: PI2,

    // Rotation speed (radians/sec)
    MIN_ROTATION_VELOCITY: 0.05,
    MAX_ROTATION_VELOCITY: 0.15,

    // Time between particle spawns (seconds)
    MIN_TIME_TO_SPAWN_PARTICLE: 0.005,
    MAX_TIME_TO_SPAWN_PARTICLE: 0.05
};

// ─────────────────────────────────────────────────────────────────────────────
// Particle
// ─────────────────────────────────────────────────────────────────────────────
class Particle {
    constructor(img) {
        this.img = img;

        this.active    = false;
        this.appearing = false;

        this.position         = new Vector2(0, 0);
        this.direction        = new Vector2(0, 0);
        this.opacity          = 0.0;
        this.opacityVelocity  = 0.0;
        this.rotation         = 0.0;
        this.rotationVelocity = 0.0;
        this.scale            = 1.0;
        this.scaleVelocity    = 0.0;
    }

    /**
     * Activate the particle with initial parameters.
     * @param {Vector2} initialPosition
     * @param {number}  opacityVelocity
     * @param {number}  initialScale
     * @param {number}  scaleVelocity
     * @param {number}  initialRotation
     * @param {number}  rotationVelocity
     * @param {Vector2} direction        velocity vector (pixels/sec)
     */
    Activate(initialPosition, opacityVelocity, initialScale, scaleVelocity,
             initialRotation, rotationVelocity, direction) {
        this.position         = Vector2.Copy(initialPosition);
        this.opacity          = 0;
        this.opacityVelocity  = opacityVelocity;
        this.scale            = initialScale;
        this.scaleVelocity    = scaleVelocity;
        this.rotation         = initialRotation;
        this.rotationVelocity = rotationVelocity;
        this.direction        = direction;
        this.active           = true;
        this.appearing        = true;
    }

    Deactivate() {
        this.active = false;
    }

    Update(deltaTime) {
        if (this.appearing) {
            // Fade in
            this.opacity += this.opacityVelocity * 2.0 * deltaTime;
            if (this.opacity >= 1.0) {
                this.opacity   = 1.0;
                this.appearing = false;
            }
        }
        else {
            // Fade out
            this.opacity -= this.opacityVelocity * deltaTime;
            if (this.opacity <= 0.0) {
                this.Deactivate();
                return;
            }
        }

        // Update transform
        this.scale    += this.scaleVelocity    * deltaTime;
        this.rotation += this.rotationVelocity * deltaTime;
        this.position.x += this.direction.x   * deltaTime;
        this.position.y += this.direction.y   * deltaTime;
    }

    Draw(renderer) {
        renderer.DrawImage(
            this.img,
            this.position.x, this.position.y,
            this.scale, this.scale,
            this.rotation,
            { x: 0, y: 0 },
            this.opacity
        );
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ParticleEmitter
// ─────────────────────────────────────────────────────────────────────────────
class ParticleEmitter {
    /**
     * @param {Vector2} initialPosition  world-space position for point emitters
     * @param {Object}  config           particle system config (uses defaultParticleConfig shape)
     */
    constructor(initialPosition, config) {
        this.position = initialPosition ? Vector2.Copy(initialPosition) : new Vector2(0, 0);
        this.config   = config;

        if (this.config.emitterType === emitterType.area) {
            this.area = {
                x1: this.config.AREA_X1,
                y1: this.config.AREA_Y1,
                x2: this.config.AREA_X2,
                y2: this.config.AREA_Y2
            };
        }
    }

    /** Returns a Vector2 with the spawn position for the next particle. */
    GetSpawnPoint() {
        switch (this.config.emitterType) {
            case emitterType.point:
                return Vector2.Copy(this.position);

            case emitterType.area:
                return new Vector2(
                    RandomBetweenFloat(this.area.x1, this.area.x2),
                    RandomBetweenFloat(this.area.y1, this.area.y2)
                );
        }
    }

    /** Returns a velocity Vector2 for the next particle. */
    GetInitialVelocity() {
        const direction = new Vector2(
            RandomBetweenFloat(this.config.MIN_DIRECTION_X, this.config.MAX_DIRECTION_X),
            RandomBetweenFloat(this.config.MIN_DIRECTION_Y, this.config.MAX_DIRECTION_Y)
        );
        direction.Normalize();
        direction.MultiplyScalar(
            RandomBetweenFloat(this.config.MIN_INITIAL_VELOCITY, this.config.MAX_INITIAL_VELOCITY)
        );
        return direction;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ParticleSystem
// ─────────────────────────────────────────────────────────────────────────────
class ParticleSystem {
    /**
     * @param {HTMLImageElement} img       sprite used for every particle
     * @param {Object}           config    overrides for defaultParticleConfig
     * @param {Vector2}          position  initial emitter position (point emitters)
     */
    constructor(img, config, position) {
        this.img = img;

        // Merge defaults with provided config overrides
        this.config = Object.assign({}, defaultParticleConfig, config);

        // Create emitter
        this.emitter = new ParticleEmitter(
            position ? position : new Vector2(0, 0),
            this.config
        );

        // Build the particle pool
        this.particles = [];
        for (let i = 0; i < this.config.maxParticleCount; i++) {
            this.particles.push(new Particle(this.img));
        }

        // Randomise the first spawn time
        this.nextTimeToSpawnParticle = RandomBetweenFloat(
            this.config.MIN_TIME_TO_SPAWN_PARTICLE,
            this.config.MAX_TIME_TO_SPAWN_PARTICLE
        );
    }

    /** Move the emitter to a new world position. */
    SetPosition(x, y) {
        this.emitter.position.x = x;
        this.emitter.position.y = y;
    }

    Update(deltaTime) {
        this.nextTimeToSpawnParticle -= deltaTime;

        if (this.nextTimeToSpawnParticle <= 0.0) {
            // Reset timer
            this.nextTimeToSpawnParticle = RandomBetweenFloat(
                this.config.MIN_TIME_TO_SPAWN_PARTICLE,
                this.config.MAX_TIME_TO_SPAWN_PARTICLE
            );

            // Find the first inactive particle in the pool
            let particle = null;
            for (let i = 0; i < this.particles.length && particle === null; i++) {
                if (!this.particles[i].active)
                    particle = this.particles[i];
            }

            if (particle) {
                particle.Activate(
                    this.emitter.GetSpawnPoint(),
                    RandomBetweenFloat(this.config.MIN_OPACITY_DECREMENT_VELOCITY, this.config.MAX_OPACITY_DECREMENT_VELOCITY),
                    RandomBetweenFloat(this.config.MIN_INITIAL_SCALE,              this.config.MAX_INITIAL_SCALE),
                    RandomBetweenFloat(this.config.MIN_SCALE_VELOCITY,             this.config.MAX_SCALE_VELOCITY),
                    RandomBetweenFloat(this.config.MIN_INITIAL_ROTATION,           this.config.MAX_INITIAL_ROTATION),
                    RandomBetweenFloat(this.config.MIN_ROTATION_VELOCITY,          this.config.MAX_ROTATION_VELOCITY),
                    this.emitter.GetInitialVelocity()
                );
            }
            else {
                console.warn("ParticleSystem: pool exhausted – increase maxParticleCount.");
            }
        }

        // Update all active particles
        this.particles.forEach(particle => {
            if (particle.active)
                particle.Update(deltaTime);
        });
    }

    Draw(renderer) {
        // globalCompositeOperation is a Canvas 2D concept only
        if (renderer.ctx) {
            renderer.ctx.globalCompositeOperation = this.config.globalCompositeOperation;
        }

        this.particles.forEach(particle => {
            if (particle.active)
                particle.Draw(renderer);
        });

        // Restore defaults
        if (renderer.ctx) {
            renderer.ctx.globalCompositeOperation = 'source-over';
        }
    }

    /** Returns how many particles are currently alive. */
    get activeCount() {
        return this.particles.filter(p => p.active).length;
    }
}
