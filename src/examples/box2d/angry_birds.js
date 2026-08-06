const BIRD_STATE = {
    IDLE: 0,
    DRAGGING: 1,
    FLYING: 2
};

class AngryBirdsClone extends Box2DGame {
    constructor(renderer) {
        // scale: 100 (1m = 100px), gravity: -9.8 m/s^2, doSleep: true
        super(renderer, 100, { x: 0, y: -9.8 }, true);
        
        this.Configure({
            screenWidth: 800,
            screenHeight: 600,
            drawColliders: false,
            imageSmoothingEnabled: true,
            fillWindow: true
        });

        this.slingshotPos = new Vector2(150, 400);
        this.maxDragDistance = 100;
        this.bird = null;
        this.state = BIRD_STATE.IDLE;
        this.settleTimer = 0;
        this.pigs = [];
        this.blocks = [];
    }

    Start() {
        super.Start();
        this.DestroyAllGameObjects();

        // Create static floor at Canvas Y = 500
        // Box2D coordinates: X = 4 (400px), Y = 1 (600 - 500 = 100px = 1m)
        CreateEdge(this.physicsWorld, 4, 1, {
            p1x: -4, p1y: 0, p2x: 4, p2y: 0,
            type: b2Body.b2_staticBody, 
            friction: 5.0
        });

        this.pigs = [];
        this.blocks = [];

        this.SpawnBird();
        this.BuildLevel();
    }

    SpawnBird() {
        this.bird = new Bird(this.slingshotPos, this.physicsWorld);
        this.gameObjects.push(this.bird);
        this.state = BIRD_STATE.IDLE;
        this.settleTimer = 0;
    }

    BuildLevel() {
        const bx = 600;
        const by = 500 - 30; // Rest on floor (Y=500), minus half-height of block

        const addBlock = (pos, w, h) => {
            const b = new Block(pos, w, h, this.physicsWorld);
            this.blocks.push(b);
            this.gameObjects.push(b);
        };

        const addPig = (pos) => {
            const p = new Pig(pos, this.physicsWorld);
            this.pigs.push(p);
            this.gameObjects.push(p);
        };

        // First floor
        addBlock(new Vector2(bx - 50, by), 20, 60);
        addBlock(new Vector2(bx + 50, by), 20, 60);
        addPig(new Vector2(bx, by + 10));
        
        // Ceiling 1
        addBlock(new Vector2(bx, by - 40), 140, 20);
        
        // Second floor
        addBlock(new Vector2(bx - 30, by - 80), 20, 60);
        addBlock(new Vector2(bx + 30, by - 80), 20, 60);
        addPig(new Vector2(bx, by - 70));

        // Ceiling 2
        addBlock(new Vector2(bx, by - 120), 100, 20);
    }

    Update(deltaTime) {
        super.Update(deltaTime);

        if (this.state === BIRD_STATE.IDLE) {
            // Check if mouse clicks near the bird
            if (Input.IsMouseDown()) {
                const dist = Vector2.Magnitude(Input.mouse, this.slingshotPos);
                if (dist < 40) {
                    this.state = BIRD_STATE.DRAGGING;
                }
            }
        } 
        else if (this.state === BIRD_STATE.DRAGGING) {
            // Calculate drag vector
            let dragVec = new Vector2(Input.mouse.x - this.slingshotPos.x, Input.mouse.y - this.slingshotPos.y);
            
            // Clamp drag to maximum stretch
            if (dragVec.Length() > this.maxDragDistance) {
                dragVec.Normalize().MultiplyScalar(this.maxDragDistance);
            }
            
            // Visually move the bird
            this.bird._position.Set(this.slingshotPos.x + dragVec.x, this.slingshotPos.y + dragVec.y);

            if (Input.IsMouseUp()) {
                // Launch the bird!
                this.state = BIRD_STATE.FLYING;
                this.bird.body.SetActive(true);
                
                // Sync the Box2D body to the visual dragged position
                this.bird.position = this.bird._position; 

                // Apply impulse opposite to the drag direction
                const impulseForce = 2.0;
                this.bird.ApplyImpulse(
                    -dragVec.x * impulseForce / this.physicsScale, 
                     dragVec.y * impulseForce / this.physicsScale
                );
            }
        } 
        else if (this.state === BIRD_STATE.FLYING) {
            let allAsleep = true;
            
            const dynamicObjects = [this.bird, ...this.pigs, ...this.blocks];

            // Check our tracked physics objects to see if the scene has settled
            for (let i = 0; i < dynamicObjects.length; i++) {
                const go = dynamicObjects[i];
                if (go && go.active && go.body) {
                    // If an object falls completely out of bounds, safely destroy it
                    if (go.position.x < -200 || go.position.x > this.screenWidth + 200 || go.position.y > this.screenHeight + 100) {
                        this.Destroy(go);
                        continue;
                    }
                    
                    if (go.body.IsAwake()) {
                        allAsleep = false;
                    }
                }
            }

            // Once everything is asleep, wait a moment and spawn the next bird
            if (allAsleep) {
                this.settleTimer += deltaTime;
                if (this.settleTimer > 2.0) {
                    if (this.bird && this.bird.active) {
                        this.Destroy(this.bird);
                    }
                    this.SpawnBird();
                }
            } else {
                this.settleTimer = 0;
            }
        }

        // Reset level binding
        if (Input.IsKeyDown(KEY_R)) {
            this.Start();
        }
    }

    Draw() {
        // Sky
        this.renderer.DrawFillBasicRectangle(0, 0, this.screenWidth, this.screenHeight, new Color(0.5, 0.8, 1.0));
        
        // Floor
        this.renderer.DrawFillBasicRectangle(0, 500, this.screenWidth, 100, new Color(0.3, 0.8, 0.3));

        // Slingshot base
        this.renderer.DrawFillBasicRectangle(this.slingshotPos.x - 5, this.slingshotPos.y + 10, 10, 90, new Color(0.4, 0.2, 0.05));

        // Rubber band (back layer)
        if (this.state === BIRD_STATE.DRAGGING) {
            this.renderer.DrawLine(this.slingshotPos.x - 15, this.slingshotPos.y, this.bird.position.x, this.bird.position.y, new Color(0.2, 0.1, 0), 4);
        }

        // Draw physics objects (Birds, Pigs, Blocks)
        super.Draw();

        // Rubber band (front layer)
        if (this.state === BIRD_STATE.DRAGGING) {
            this.renderer.DrawLine(this.slingshotPos.x + 15, this.slingshotPos.y, this.bird.position.x, this.bird.position.y, new Color(0.2, 0.1, 0), 4);
        }

        this.renderer.DrawFillText("Drag the red bird to shoot! Press 'R' to reset.", 20, 30, "18px Arial", Color.black, "left");
    }
}

class Bird extends Box2DGameObject {
    constructor(position, physicsWorld) {
        super(position, physicsWorld, PhysicsObjectType.Circle, {
            radius: 0.15, density: 2.0, friction: 0.5, restitution: 0.4,
            type: b2Body.b2_dynamicBody, angularDamping: 2.0, linearDamping: 0.2
        });
        this.drawRadius = 15;
        this.body.SetActive(false); // disable physics initially so it stays in the slingshot
    }
    Draw(renderer) {
        renderer.DrawFillCircle(this.position.x, this.position.y, this.drawRadius, Color.red);
        renderer.DrawStrokeCircle(this.position.x, this.position.y, this.drawRadius, Color.black, 2);
        // Simple Angry Face
        renderer.DrawFillCircle(this.position.x + 5, this.position.y - 3, 3, Color.white);
        renderer.DrawFillCircle(this.position.x + 5, this.position.y - 3, 1, Color.black);
        renderer.DrawLine(this.position.x + 1, this.position.y - 7, this.position.x + 10, this.position.y - 5, Color.black, 2); 
    }
}

class Pig extends Box2DGameObject {
    constructor(position, physicsWorld) {
        super(position, physicsWorld, PhysicsObjectType.Circle, {
            radius: 0.15, density: 1.0, friction: 0.5, restitution: 0.3,
            type: b2Body.b2_dynamicBody
        });
        this.drawRadius = 15;
    }
    Draw(renderer) {
        renderer.DrawFillCircle(this.position.x, this.position.y, this.drawRadius, Color.lime);
        renderer.DrawStrokeCircle(this.position.x, this.position.y, this.drawRadius, Color.black, 2);
        // Simple Pig Face
        renderer.DrawFillCircle(this.position.x + 4, this.position.y - 2, 2, Color.white);
        renderer.DrawFillCircle(this.position.x + 4, this.position.y - 2, 1, Color.black);
    }
}

class Block extends Box2DRectangleGO {
    constructor(position, width, height, physicsWorld) {
        super(position, physicsWorld, PhysicsObjectType.Box, {
            width: width / physicsWorld.scale, height: height / physicsWorld.scale,
            density: 0.5, friction: 0.8, restitution: 0.1, type: b2Body.b2_dynamicBody
        }, width, height, Color.orange);
    }
    Draw(renderer) {
        renderer.DrawFillRectangle(this.position.x, this.position.y, this.width, this.height, this.color, this.rotation);
        renderer.DrawStrokeRectangle(this.position.x, this.position.y, this.width, this.height, Color.black, 2, this.rotation);
    }
}

window.onload = () => {
    Init(AngryBirdsClone);
}