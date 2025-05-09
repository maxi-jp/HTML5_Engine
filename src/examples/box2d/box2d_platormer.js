class Box2DPlatformer extends Box2DGame {
    constructor() {
        super(100, { x: 0, y: -9.8 }, false); // 1 pixel = 1/100 meter, gravity in m/s^2, allow bodies to sleep

        this.graphicAssets = {
            ball: {
                path: "src/examples/box2d/assets/ball.png",
                img: null
            }
        };

        this.player = null;
    }

    Start() {
        // create the physics simulated this.physicsWorld
        super.Start();

        // phisics objects
        // static floor
        this.floor = CreateEdge(
            this.physicsWorld,
            3.2, // x coordinate
            0.5, // y coordinate
            {
                p1x: -3.2, // start point x
                p1y: 0,    // start point y
                p2x: 3.2,  // end point x,
                p2y: 0,    // end point y
                type: b2Body.b2_staticBody
            } // physic options
        );
        this.floor.SetUserData("floor");
        // left wall
        CreateEdge(this.physicsWorld, 0, 0, {
            p1x: 0, p1y: 0, p2x: 0, p2y: 4.8,
            type: b2Body.b2_staticBody,
            friction: 0.02
        });
        // right wall
        CreateEdge(this.physicsWorld, 6.4, 0, {
            p1x: 0, p1y: 0, p2x: 0, p2y: 4.8,
            type: b2Body.b2_staticBody
        });
        // top wall
        CreateEdge(this.physicsWorld, 3.2, 4.8, {
            p1x: -3.2, p1y: 0, p2x: 3.2, p2y: 0,
            type: b2Body.b2_staticBody
        });

        // create the player
        this.player = new Player(new Vector2(100, 200), this.graphicAssets.ball.img, this.physicsWorld, new Vector2(0.33, 0.33));
        this.player.Start();
    }

    Update(deltaTime) {
        // update physics and gameObjects
        super.Update(deltaTime);
        
        this.player.Update(deltaTime);
    }

    Draw(ctx) {
        super.Draw(ctx);

        this.player.Draw(ctx);
    }
}

const PlayerAnimationState = {
    IDLE : 0,
    MOVE : 1,
    JUMP : 2
}

class Player extends Box2DSpriteObject {
    constructor(position, img, physicsWorld) {
        super(position, 0, 0.25, img, PhysicsObjectType.Box, physicsWorld, {
            width: 0.4,
            height: 0.5,
            type: b2Body.b2_dynamicBody,
            density: 1.0,
            friction: 0.5,
            restitution: 0.0,
            linearDamping: 1,
            fixedRotation: true
        });

        this.onFloor = false;

        this.isGoingLeft = false;

        // movement attr
        this.maxHorizontalVel = 3;
        this.maxVerticalVel = 10;
        this.jumpForce = 6;

        // movement flags
        this.moveLeft = false;
        this.moveRight = false;

        this.canJump = false;

        // player animation state machine
        this.animState = PlayerAnimationState.IDLE;
        this.animLastState = PlayerAnimationState.IDLE;
    }

    Start() {
        super.Start();
    }

    Update(deltaTime) {
        super.Update(deltaTime);

        // clear movement flag
        this.moving = false;

        if (Input.IsKeyPressed(KEY_LEFT) || Input.IsKeyPressed(KEY_A))
            this.moveLeft = true;

        if (Input.IsKeyPressed(KEY_RIGHT) || Input.IsKeyPressed(KEY_D))
            this.moveRight = true;

        this.moving = this.moveLeft || this.moveRight;

        if (Input.IsKeyPressed(KEY_UP) || Input.IsKeyPressed(KEY_W) || Input.IsKeyPressed(KEY_SPACE)) {
            // want to begin jump during this frame
            this.Jump();
        }

        // movement
        if (this.moveRight) {
            // move animation (only if idle animation running)
            if (this.animState === PlayerAnimationState.IDLE) {
                // copy the past state
                this.animLastState = this.animState;
                this.animState = PlayerAnimationState.MOVE;

                // this.animation.PlayAnimationLoop(PlayerAnimationState.MOVE);
            }

            this.ApplyVelocity(new b2Vec2(1, 0));
            this.moveRight = false;
            this.isGoingLeft = false;
        }

        if (this.moveLeft) {
            // move animation (only if idle animation running)
            if (this.animState === PlayerAnimationState.IDLE) {
                // copy the past state
                this.animLastState = this.animState;
                this.animState = PlayerAnimationState.MOVE;

                // this.animation.PlayAnimationLoop(PlayerAnimationState.MOVE);
            }

            this.ApplyVelocity(new b2Vec2(-1, 0));
            this.moveLeft = false;
            this.isGoingLeft = true;
        }

        // return to idle (if !moving && !jumping && !attacking && !dying && !onWard)
        if (!this.jumping && !this.moving && this.animState !== PlayerAnimationState.IDLE)
        {
            // copy the past state
            this.animLastState = this.animState;
            // new state: idle
            this.animState = PlayerAnimationState.IDLE;

            // play the idle animation
            // this.animation.PlayAnimationLoop(PlayerAnimationState.IDLE);
        }
    }

    Draw(ctx) {
        //super.Draw(ctx);
    }

    OnContactDetected(other) {
        if (other === "floor") {
            const playerLinearVelocity = this.body.GetLinearVelocity();
        
            this.body.SetLinearVelocity(new b2Vec2(playerLinearVelocity.x, 0));

            this.canJump = true;
            this.onFloor = true;

            this.jumping = false;

            this.animLastState = this.animState;
            this.animState = PlayerAnimationState.IDLE;

            // play the idle animation
            // this.animation.PlayAnimationLoop(PlayerAnimationState.IDLE);
        }
    }

    ApplyVelocity(vel) {
        let bodyVel = this.body.GetLinearVelocity();
        bodyVel.Add(vel);

        // horizontal movement cap
        if (Math.abs(bodyVel.x) > this.maxHorizontalVel)
            bodyVel.x = this.maxHorizontalVel * bodyVel.x / Math.abs(bodyVel.x);

        // vertical movement cap
        if (Math.abs(bodyVel.y) > this.maxVerticalVel)
            bodyVel.y = this.maxVerticalVel * bodyVel.y / Math.abs(bodyVel.y);

        this.body.SetLinearVelocity(bodyVel);
    }

    Jump() {
        if (Math.abs(this.body.GetLinearVelocity().y) > 0.1 || !this.canJump)
            return false;

        this.canJump = false;

        this.ApplyVelocity(new b2Vec2(0, this.jumpForce));
        this.onFloor = false;
        this.jumping = true;

        this.animState = PlayerAnimationState.JUMP;
        // this.animation.PlayAnimationLoop(PlayerAnimationState.JUMP);
    }
}

// initialize the game
if (game === null)
    game = new Box2DPlatformer();