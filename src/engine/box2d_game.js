// ============================================================
// Box2DGame
// Game subclass that owns a Box2D physics world and steps it
// each frame before updating game objects.
// Globals provided: Box2DGame
// Requires: game.js (Game), box2d_helper.js (CreateBox2DWorld)
// ============================================================

/**
 * Game subclass that integrates a Box2D physics world.
 * Extend this instead of `Game` when the game needs rigid-body physics.
 *
 * @example
 * class MyPhysicsGame extends Box2DGame {
 *   constructor(renderer) {
 *     super(renderer, 30, { x: 0, y: -9.8 }, true);
 *   }
 * }
 */
class Box2DGame extends Game {
    /**
     * @param {Renderer} renderer - The renderer instance created by the engine.
     * @param {number}   scale    - Pixels per meter (e.g. 30 means 30 px = 1 m).
     * @param {{x:number, y:number}} gravity  - Gravity vector in m/s².
     * @param {boolean}  doSleep  - Whether Box2D may put inactive bodies to sleep.
     */
    constructor(renderer, scale, gravity, doSleep) {
        super(renderer);
        
        this.physicsWorld = null;
        this.physicsScale = scale; // 1 pixel = 1/scale meter
        this.physicsGravity = gravity; // gravity in m/s^2
        this.physicsDoSleep = doSleep; // allow bodies to sleep
    }

    Start() {
        super.Start();

        // create the physics simulated world
        this.physicsWorld = CreateBox2DWorld(this.renderer, this.physicsGravity, this.physicsDoSleep, this.physicsScale);
    }

    Update(deltaTime) {
        // update physics
        // Step(timestep , velocity iterations, position iterations)
        this.physicsWorld.Step(deltaTime, 8, 3);
        this.physicsWorld.ClearForces();

        // update gameObjects
        super.Update(deltaTime);
    }

    Draw() {
        // draw gameObjects
        super.Draw();

        if (this.config.drawColliders) {
            // box2d world debug
            DrawWorldDebug(this.renderer, this.physicsWorld);
        }
    }
}
