class RTSGame extends Game {
    constructor(renderer) {
        super(renderer);

        // Phase 1 Configuration
        this.Configure({
            screenWidth: 1024,
            screenHeight: 768,
            fillWindow: true,
            preserveAspectRatio: true,
            imageSmoothingEnabled: false, // Disabled for a crisp, classic RTS pixel-art look
            drawColliders: false,         // Will be tied to our custom debugMode flag later
        });

        // Map and tileset assets
        this.tiledAssets = {
            map: { path: "assets/rts_map.json", data: null }
        };

        this.graphicAssets = {
            tileset: { path: "assets/rts_tileset.png", img: null }
        };
    }

    Start() {
        super.Start();
        console.log("RTSGame Started - Phase 1 Initialization");

        // Parse the Tiled map and create the tilesets
        const mapData = TiledLoader.Parse(this.tiledAssets.map.data, this.graphicAssets);
        this.tilesets = TiledLoader.CreateTilesets(mapData, Vector2.Zero(), 1);
        
        this.tilesets.forEach(tileset => {
            this.gameObjects.push(tileset);
        });

        // Initialize the camera in the top-left corner
        this.camera = new Camera(new Vector2(this.screenHalfWidth, this.screenHalfHeight));
        this.camera.Start();
    }

    Update(deltaTime) {
        super.Update(deltaTime);
        
        this.camera.Update(deltaTime);
        
        // TODO: Camera panning logic, GridMap parsing, and SelectionManager updates
    }

    Draw() {
        // Draw a base background color before rendering the map
        this.renderer.DrawFillBasicRectangle(0, 0, this.screenWidth, this.screenHeight, Color.black);
        
        // Apply camera transform for world-space rendering
        this.camera.PreDraw(this.renderer);
        
        super.Draw();
        
        // Restore screen-space transform for UI
        this.camera.PostDraw(this.renderer);
    }
}