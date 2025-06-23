class Game {
    _screenWidth = 640;
    _screenHeight = 480;
    _screenHalfWidth = 0;
    _screenHalfHeight = 0;

    _audioActive = true;

    constructor(renderer) {
        this.config = {};
        // config example:
        // {
        //     imageSmoothingEnabled: true, // enable/disable image smoothing on the canvas context
        //     audioAnalyzer: true,    // if true it will create an audio analyzer when loading the audio assets
        //     analyzerfftSize: 128,   // size of the audio analyzer fft, default is 128
        //     analyzerSmoothing: 0.5, // smoothing of the audio analyzer, default is 0.5
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

        this._screenHalfWidth = this._screenWidth / 2;
        this._screenHalfHeight = this._screenHeight / 2;
    }

    get screenWidth() {
        return this._screenWidth;
    }
    get screenHeight() {
        return this._screenHeight;
    }
    get screenHalfWidth() {
        return this._screenHalfWidth;
    }
    get screenHalfHeight() {
        return this._screenHalfHeight;
    }
    get audioActive() {
        return this._audioActive;
    }

    set screenWidth(value) {
        this._screenWidth = value;
        this._screenHalfWidth = this._screenWidth / 2;
        this.renderer.width = this._screenWidth;
    }
    set screenHeight(value) {
        this._screenHeight = value;
        this._screenHalfHeight = this._screenHeight / 2;
        this.renderer.height = this._screenHeight;
    }
    set audioActive(value) {
        this._audioActive = value;
    }

    Start() {
        this.renderer.width = this._screenWidth;
        this.renderer.height = this._screenHeight;
        if (typeof(this.config.imageSmoothingEnabled) !== 'undefined')
            this.renderer.imageSmoothingEnabled = this.config.imageSmoothingEnabled;
        
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
}