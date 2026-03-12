// ============================================================
// Particle System – example / demo
// Controls:
//   A – Smoke (area, default config)
//   S – Smoke following the mouse (point emitter)
//   D – Rain
//   F – Snow
// ============================================================

// ── Pre-set particle configurations ─────────────────────────

const smokeAreaConfig = {
    // inherits defaultParticleConfig – just a nice smoke cloud over the whole canvas
};

const smokePointConfig = {
    maxParticleCount: 200,
    globalCompositeOperation: "overlay",
    emitterType: emitterType.point,

    MIN_INITIAL_VELOCITY: 10,
    MAX_INITIAL_VELOCITY: 60,

    MIN_DIRECTION_X: -1,
    MAX_DIRECTION_X:  1,
    MIN_DIRECTION_Y: -1,
    MAX_DIRECTION_Y:  1,

    MIN_OPACITY_INCREMENT_VELOCITY: 1.0,
    MAX_OPACITY_INCREMENT_VELOCITY: 4.0,
    MIN_OPACITY_DECREMENT_VELOCITY: 0.5,
    MAX_OPACITY_DECREMENT_VELOCITY: 2.0,

    MIN_INITIAL_SCALE: 0.05,
    MAX_INITIAL_SCALE: 0.5,

    MIN_SCALE_VELOCITY: 0.25,
    MAX_SCALE_VELOCITY: 0.5,

    MIN_INITIAL_ROTATION: 0,
    MAX_INITIAL_ROTATION: PI2,

    MIN_ROTATION_VELOCITY: 0.05,
    MAX_ROTATION_VELOCITY: 0.15,

    MIN_TIME_TO_SPAWN_PARTICLE: 0.01,
    MAX_TIME_TO_SPAWN_PARTICLE: 0.1
};

const rainConfig = {
    maxParticleCount: 1000,
    globalCompositeOperation: "source-over",
    emitterType: emitterType.area,

    AREA_X1: -200, AREA_Y1: -100,
    AREA_X2:  700, AREA_Y2: -100,

    MIN_INITIAL_VELOCITY: 400,
    MAX_INITIAL_VELOCITY: 800,

    MIN_DIRECTION_X: 0.15,
    MAX_DIRECTION_X: 0.25,
    MIN_DIRECTION_Y: 1,
    MAX_DIRECTION_Y: 1,

    MIN_OPACITY_INCREMENT_VELOCITY: 1.0,
    MAX_OPACITY_INCREMENT_VELOCITY: 2.0,
    MIN_OPACITY_DECREMENT_VELOCITY: 0.1,
    MAX_OPACITY_DECREMENT_VELOCITY: 1.0,

    MIN_INITIAL_SCALE: 0.25,
    MAX_INITIAL_SCALE: 0.33,

    MIN_SCALE_VELOCITY: 0,
    MAX_SCALE_VELOCITY: 0,

    MIN_INITIAL_ROTATION: -0.05,
    MAX_INITIAL_ROTATION:  0.05,

    MIN_ROTATION_VELOCITY: 0.001,
    MAX_ROTATION_VELOCITY: 0.01,

    MIN_TIME_TO_SPAWN_PARTICLE: 0.001,
    MAX_TIME_TO_SPAWN_PARTICLE: 0.002
};

const snowConfig = {
    maxParticleCount: 1000,
    globalCompositeOperation: "source-over",
    emitterType: emitterType.area,

    AREA_X1: -100, AREA_Y1: -100,
    AREA_X2:  750, AREA_Y2: -100,

    MIN_INITIAL_VELOCITY: 30,
    MAX_INITIAL_VELOCITY: 60,

    MIN_DIRECTION_X: -0.25,
    MAX_DIRECTION_X:  0.25,
    MIN_DIRECTION_Y: 1,
    MAX_DIRECTION_Y: 1,

    MIN_OPACITY_INCREMENT_VELOCITY: 0.1,
    MAX_OPACITY_INCREMENT_VELOCITY: 0.30,
    MIN_OPACITY_DECREMENT_VELOCITY: 0.05,
    MAX_OPACITY_DECREMENT_VELOCITY: 0.15,

    MIN_INITIAL_SCALE: 0.05,
    MAX_INITIAL_SCALE: 0.25,

    MIN_SCALE_VELOCITY: 0,
    MAX_SCALE_VELOCITY: 0.01,

    MIN_INITIAL_ROTATION: 0,
    MAX_INITIAL_ROTATION: PI2,

    MIN_ROTATION_VELOCITY: 0.1,
    MAX_ROTATION_VELOCITY: 0.5,

    MIN_TIME_TO_SPAWN_PARTICLE: 0.001,
    MAX_TIME_TO_SPAWN_PARTICLE: 0.002
};

// ── Game setup ───────────────────────────────────────────────

class ParticlesExample extends Game {
    constructor(renderer) {
        super(renderer);

        this.Configure({
            screenWidth:  800,
            screenHeight: 640,
            imageSmoothingEnabled: true
        });

        this.graphicAssets = {
            smoke:     { path: "./src/examples/particles/assets/smoke.png",     img: null },
            smoke2:    { path: "./src/examples/particles/assets/smoke2.png",    img: null },
            snow:      { path: "./src/examples/particles/assets/snow.png",      img: null },
            waterdrop: { path: "./src/examples/particles/assets/waterdrop.png", img: null }
        };

        this._particleSystem = null;
        this._mode = 'area-smoke';

        this.bgColor = Color.FromHex("#1a1a2e");
        this.semiTransparentBlack = new Color(0, 0, 0, 0.75);
    }

    Start() {
        super.Start();
        this._particleSystem = new ParticleSystem(
            this.graphicAssets.smoke.img,
            smokeAreaConfig
        );
        this._mode = 'area-smoke';
    }

    Update(deltaTime) {
        // Switch particle system modes
        if (Input.IsKeyPressed(KEY_A)) {
            this._particleSystem = new ParticleSystem(
                this.graphicAssets.smoke.img,
                smokeAreaConfig
            );
            this._mode = 'area-smoke';
        }
        if (Input.IsKeyPressed(KEY_S)) {
            this._particleSystem = new ParticleSystem(
                this.graphicAssets.smoke.img,
                smokePointConfig,
                new Vector2(Input.mouse.x, Input.mouse.y)
            );
            this._mode = 'point-smoke';
        }
        if (Input.IsKeyPressed(KEY_D)) {
            this._particleSystem = new ParticleSystem(
                this.graphicAssets.waterdrop.img,
                rainConfig
            );
            this._mode = 'rain';
        }
        if (Input.IsKeyPressed(KEY_F)) {
            this._particleSystem = new ParticleSystem(
                this.graphicAssets.snow.img,
                snowConfig
            );
            this._mode = 'snow';
        }

        // Point emitter follows the mouse
        if (this._mode === 'point-smoke') {
            this._particleSystem.SetPosition(Input.mouse.x, Input.mouse.y);
        }

        this._particleSystem.Update(deltaTime);
    }

    Draw() {
        // Dark background
        this.renderer.DrawFillBasicRectangle(
            0, 0,
            this.screenWidth, this.screenHeight,
            this.bgColor
        );

        this._particleSystem.Draw(this.renderer);
        this._drawHUD(this.renderer.ctx);
    }

    _drawHUD(ctx) {
        this.renderer.DrawFillBasicRectangle(8, 8, 320, 100, this.semiTransparentBlack);
        this.renderer.DrawFillText("A - Area smoke (default)", 16, 28, "13px monospace", Color.white, "left");
        this.renderer.DrawFillText("S - Smoke following mouse", 16, 46, "13px monospace", Color.white, "left");
        this.renderer.DrawFillText("D - Rain", 16, 64, "13px monospace", Color.white, "left");
        this.renderer.DrawFillText("F - Snow", 16, 82, "13px monospace", Color.white, "left");
        const ps = this._particleSystem;
        this.renderer.DrawFillText(`Particles alive: ${ps.activeCount} / ${ps.config.maxParticleCount}`, 16, 100, "13px monospace", Color.white, "left");
    }
}

window.onload = () => {
    Init(ParticlesExample);
};
