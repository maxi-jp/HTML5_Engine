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

        // Map and tileset assets (paths relative to HTML file location)
        this.tiledAssets = {
            map: { path: "src/examples/rts/assets/rts_map.json", data: null }
        };

        this.graphicAssets = {
            rts_tileset: { path: "src/examples/rts/assets/rts_tileset.png", img: null }
        };
        
        // Camera controls
        this.edgePanSpeed = 800;        // Pixels per second
        this.keyboardPanSpeed = 500;    // Slower keyboard pan for precise control
        this.edgePanMargin = 20;        // Pixels from screen edge to trigger panning
        this.cameraBounds = null;       // Will be set after map loads
    }

    Start() {
        super.Start();
        console.log("RTSGame Started - Phase 1 Session 1.1");

        // Parse the Tiled map and create the tilesets
        const mapData = TiledLoader.Parse(this.tiledAssets.map.data, this.graphicAssets);
        this.tilesets = TiledLoader.CreateTilesets(mapData, Vector2.Zero(), 1);
        
        this.tilesets.forEach(tileset => {
            this.AddGameObject(tileset);
        });

        // Store map dimensions for camera bounds
        this.mapWidth = mapData.width * mapData.tileWidth;
        this.mapHeight = mapData.height * mapData.tileHeight;
        this.cameraBounds = new Rect(0, 0, this.mapWidth, this.mapHeight);
        
        console.log(`Map loaded: ${mapData.width}x${mapData.height} tiles (${this.mapWidth}x${this.mapHeight} pixels)`);

        // Initialize the camera at the center of the screen
        this.camera = new RTSCamera(new Vector2(this.screenHalfWidth, this.screenHalfHeight), this, this.mapWidth, this.mapHeight, {
            keyboardPanSpeed: this.keyboardPanSpeed,
            edgePanSpeed: this.edgePanSpeed,
            edgeMargin: this.edgePanMargin,
            minZoom: 0.5,
            maxZoom: 2.0,
            zoomStep: 0.1,
            edgeExponent: 1.75,
            debugEnabled: true
        });
        this.camera.Start();
        
        console.log("Phase 1 Session 1.1 complete: Map rendering initialized");
    }

    Update(deltaTime) {
        super.Update(deltaTime);
        
        // Update camera controls and zoom
        this.camera.Update(deltaTime);
        
        // TODO Phase 1 Session 1.3: GridMap parsing
        // TODO Phase 1 Session 1.4: SelectionManager updates
    }

    Draw() {
        // Draw a base background color before rendering the map
        this.renderer.DrawFillBasicRectangle(0, 0, this.screenWidth, this.screenHeight, Color.black);
        
        // Apply camera transform for world-space rendering
        this.camera.PreDraw(this.renderer);
        
        super.Draw();
        
        // Restore screen-space transform for UI
        this.camera.PostDraw(this.renderer);

        if (this.camera && this.camera.DrawDebug) {
            this.camera.DrawDebug(this.renderer);
        }
    }
}