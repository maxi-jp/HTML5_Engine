class Game {
    _audioActive = true;

    constructor(renderer) {
        this.config = {
            // Screen configuration
            screenWidth: 640,
            screenHeight: 480,
            imageSmoothingEnabled: true,
            
            // Audio configuration
            audioAnalyzer: false,
            
            // Debug configuration
            drawColliders: false
        };
        // config example:
        // {
        //     screenWidth: 1280,          // initial canvas width
        //     screenHeight: 720,          // initial canvas height
        //     imageSmoothingEnabled: true, // enable/disable image smoothing on the canvas context
        //     fillWindow: false,      // make the game canvas to fill the entire window
        //     matchNativeResolution: false, // if fillWindow=true this controls how the canvas behaves when filling window (true: updates the canvas internal resolution to match window size | false: keeps existing resolution and stretches to fit window)
        //     preserveAspectRatio: true,    // if fillWindow=true and matchNativeResolution=false, maintains canvas aspect ratio when scaling to fit window
        //     useDevicePixelRatio: false,   // Use device pixel ratio for crisp rendering on high DPI displays
        //     audioAnalyzer: true,    // if true it will create an audio analyzer when loading the audio assets
        //     analyzerfftSize: 128,   // size of the audio analyzer fft, default is 128
        //     analyzerSmoothing: 0.5, // smoothing of the audio analyzer, default is 0.5
        //     drawColliders: false,   // draw collision shapes for debugging
        // };

        this.graphicAssets = null;
        // graphicAssets format should be:
        // {
        //     asset_id: {
        //         path: "path/to/asset",
        //         img: null
        //     },
        //     another_asset_id: ...
        // };

        this.audioAssets = null;
        // audioAssets format should be:
        // {
        //     asset_id: {
        //         path: "path/to/asset",
        //         audio: null
        //     },
        //     another_asset_id: ...
        // };

        this.renderer = renderer;

        this.gameObjects = [];
        this.colliders = [];
        this.collidersById = new Map(); // Maps collider.id to Collider instance for quick lookups
        this.lastCollisions = new Set(); // ids of colliding pairs detected the last frame
        this.detectedCollisions = new Set(); // collisions detected on this frame
    }

    get screenWidth() {
        return this.renderer.width;
    }
    get screenHeight() {
        return this.renderer.height;
    }
    get screenHalfWidth() {
        return this.renderer.halfWidth;
    }
    get screenHalfHeight() {
        return this.renderer.halfHeight;
    }
    get audioActive() {
        return this._audioActive;
    }

    set screenWidth(value) {
        this.renderer.width = value;
    }
    set screenHeight(value) {
        this.renderer.height = value;
    }
    set audioActive(value) {
        this._audioActive = value;
    }

    Start() {
        // Set initial screen size from config
        this.renderer.width = this.config.screenWidth;
        this.renderer.height = this.config.screenHeight;
        
        // Configure renderer settings
        if (typeof(this.config.imageSmoothingEnabled) !== 'undefined')
            this.renderer.imageSmoothingEnabled = this.config.imageSmoothingEnabled;
        
        // Fill window if configured
        if (this.config.fillWindow) {
            this.renderer.SetCanvasFillWindow(
                this.config.matchNativeResolution || false, 
                this.config.useDevicePixelRatio || false,
                this.config.preserveAspectRatio !== false // default to true
            );
        }
        
        this.gameObjects = [];
        this.colliders = [];
        this.collidersById.clear();
        this.lastCollisions.clear();
        this.detectedCollisions.clear();
    }
    
    Update(deltaTime) {
        // Update active game objects
        this.gameObjects.forEach((gameObject) => {
            if (gameObject.active)
                gameObject.Update(deltaTime);
        });

        // Colliders onClick events
        this.colliders.forEach((collider) => {
            if (Input.mouse.down)
                if (collider.IsPointInside(Input.mouse.x, Input.mouse.y)) {
                collider.OnClick();
            }
        });

        // Collision Detection and Event Dispatching
        this.detectedCollisions.clear();

        for (let i = 0; i < this.colliders.length; i++) {
            for (let j = i + 1; j < this.colliders.length; j++) {
                const colliderA = this.colliders[i];
                const colliderB = this.colliders[j];

                // Ensure consistent pair ID regardless of order
                const pairId = colliderA.id < colliderB.id ?
                    `${colliderA.id}-${colliderB.id}` :
                    `${colliderB.id}-${colliderA.id}`;

                // Broad-phase: check if bounding circles overlap (performance optimization)
                if (CheckCollisionTwoCircles(colliderA.position, colliderA.boundingRadius, colliderB.position, colliderB.boundingRadius)) {
                    // Narrow-phase: detailed collision check
                    if (CollisionManager.Check(colliderA, colliderB)) {
                        this.detectedCollisions.add(pairId);

                        // new collision, not active the last frame
                        if (!this.lastCollisions.has(pairId)) {
                            const gameObjectA = colliderA.go;
                            const gameObjectB = colliderB.go;

                            if (gameObjectA) {
                                gameObjectA.OnCollisionEnter(colliderA, colliderB);
                            }
                            if (gameObjectB) {
                                gameObjectB.OnCollisionEnter(colliderB, colliderA);
                            }

                            colliderA.isColliding = colliderB.isColliding = true;
                            colliderA.color = colliderB.color = Collider.collisionColor;
                        }
                    }
                }
            }
        }

        // Check for ended collisions (collisions that were active but are no longer)
        for (const pairId of this.lastCollisions) {
            if (!this.detectedCollisions.has(pairId)) {
                // Collision has ended
                const [colliderAId, colliderBId] = pairId.split('-').map(Number);
                
                const colliderA = this.collidersById.get(colliderAId);
                const colliderB = this.collidersById.get(colliderBId);

                if (colliderA && colliderB) {
                    const gameObjectA = colliderA.go;
                    const gameObjectB = colliderB.go;

                    if (gameObjectA) {
                        gameObjectA.OnCollisionExit(colliderA, colliderB);
                    }
                    if (gameObjectB) {
                        gameObjectB.OnCollisionExit(colliderB, colliderA);
                    }

                    colliderA.isColliding = colliderB.isColliding = false;
                    colliderA.color = colliderB.color = Collider.defaultColor;
                }
            }
        }

        this.lastCollisions = this.detectedCollisions;
        this.detectedCollisions = new Set();
    }
    
    Draw() {
        this.gameObjects.forEach((gameObject) => {
            if (gameObject.active)
                gameObject.Draw(this.renderer);
        });

        if (this.config.drawColliders) {
            this.colliders.forEach((collider) => {
                collider.Draw(this.renderer);
            });
        }
    }

    Destroy(gameObject) {
        const index = this.gameObjects.indexOf(gameObject);
        if (index !== -1) {
            // check if the gameObject has a collider
            const collider = gameObject.collider;
            if (collider) {
                // remove the collider from the this.collider array
                this.RemoveCollider(collider);
            }

            if (typeof gameObject.Destroy === "function") {
                gameObject.Destroy();
            }

            gameObject.active = false;

            this.gameObjects.splice(index, 1);
        }
        else
            console.warn("Error when destroying the gameObjet: GO not found in the gameObjects array.", gameObject);
    }

    AddCollider(collider) {
        this.colliders.push(collider);
        this.collidersById.set(collider.id, collider);
    }

    RemoveCollider(collider) {
        const index = this.colliders.indexOf(collider);
        if (index !== -1) {
            this.colliders.splice(index, 1);
            this.collidersById.delete(collider.id);

            // check if the collider has collisions pending
            const idToRemove = collider.id;
            const cleanCollisionSet = (collisionSet) => {
                for (const pairId of collisionSet) {
                    // Pair ID is a string like "id1-id2".
                    const ids = pairId.split('-');
                    if (ids[0] == idToRemove || ids[1] == idToRemove) {
                        collisionSet.delete(pairId);
                    }
                }
            };

            cleanCollisionSet(this.lastCollisions);
            cleanCollisionSet(this.detectedCollisions);
        }
    }

    SetFillWindow(matchNativeResolution = true, useDevicePixelRatio = false, preserveAspectRatio = true) {
        this.renderer.SetCanvasFillWindow(matchNativeResolution, useDevicePixelRatio, preserveAspectRatio);
    }

    SetScreenSize(width, height) {
        this.renderer.SetScreenSize(width, height);
    }

    Configure(newConfig) {
        // Merge new configuration with existing config
        Object.assign(this.config, newConfig);
    }
}