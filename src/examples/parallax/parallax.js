class Parallax extends Game {
    constructor(renderer) {
        super(renderer);

        this.config = { imageSmoothingEnabled: false };

        this.graphicAssets = {
            mountain: {
                path: "src/examples/parallax/assets/mountain.png",
                img: null
            },
            trees: {
                path: "src/examples/parallax/assets/trees.png",
                img: null
            },
            tileset: {
                path: "src/examples/parallax/assets/Textures.png",
                img: null
            }
        };

        this.box = null;
        this.camera = null;
        this.background = null;

        this.floorLevelY = 50;
    }

    Start() {
        super.Start();
        this.box = new RectangleGO(new Vector2(this.screenHalfWidth, this.screenHeight - 100), 60, 100);
        this.gameObjects.push(this.box);

        // create the camera
        this.camera = new FollowCameraBasic(Vector2.Zero(), this.box, new Vector2(100, -160));
        this.camera.Start();

        // create the parallax background -----------------------------------------------------
        // layer 0: static black
        const bgLayer0 = new StaticColorLayer(Color.black);
        // layer 1: a "night sky" gradient (transparent to dark blue "#365B93")  (0.2, 1)
        const bgLayer1 = new StaticGradientLayer(this.renderer, new Vector2(this.screenWidth, this.screenHeight), [[0, Color.white], [1, Color.black]]);
        // layer 2: mountains in a full-size-sprite
        const bgLayerMountain = new SpriteBackgroundLayer(this.graphicAssets.mountain.img, new Vector2(-100, canvas.height - this.graphicAssets.mountain.img.height - 30), 0, 1, new Vector2(0.05, 0.01));
        // layer 3: a set of individual sprite trees
        const bgLayerTrees = new MultispritesBackgroundLayer(
            new Vector2(0, 216),
            [
                new SpriteSection(this.graphicAssets.trees.img, new Vector2(0, -4), 0, 1, new Rect(0, 0, 193, 240)), // tree 1
                new SpriteSection(this.graphicAssets.trees.img, new Vector2(300, 0), 0, 1, new Rect(193, 0, 194, 240)), // tree 2
                new SpriteSection(this.graphicAssets.trees.img, new Vector2(600, 0), 0, 1, new Rect(386, 0, 142, 240)), // tree 3
                new SpriteSection(this.graphicAssets.trees.img, new Vector2(900, 0), 0, 1, new Rect(528, 0, 216, 240)) // tree 4
            ],
            new Vector2(0.8, 0.8)
        );
        // layer 4: a set of tiles
        // TODO 
        // const bgLayerTiles = new TilesetBackgroundLayer();
        // finally componse all the layers in the background
        this.background = new BackgroundLayers(this.camera, [bgLayer0, bgLayer1]);//, bgLayerMountain, bgLayerTrees]);
        this.background.Start();
    }

    Update(deltaTime) {
        // update physics and gameObjects
        super.Update(deltaTime);

        if (Input.IsKeyPressed(KEY_A))
            this.box.position.x -= 100 * deltaTime;
        if (Input.IsKeyPressed(KEY_D))
            this.box.position.x += 100 * deltaTime;
        if (Input.IsKeyPressed(KEY_W))
            this.box.position.y -= 100 * deltaTime;
        if (Input.IsKeyPressed(KEY_S) && (this.box.position.y <= this.floorLevelY))
            this.box.position.y += 100 * deltaTime;

        // update the camera
        this.camera.Update(deltaTime);

        // update the background
        this.background.Update(deltaTime);
    }

    Draw() {
        this.camera.PreDraw(this.renderer);

        // draw the background
        this.background.Draw(this.renderer);

        // draw the gameObjects
        super.Draw();

        this.camera.PostDraw(this.renderer);

        // var grad = this.renderer.ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        // grad.addColorStop(0, "white");
        // grad.addColorStop(1, "black");
        // this.renderer.ctx.fillStyle = grad;
        // this.renderer.ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}
