class Game {
    constructor() {
        this.graphicAssets = null;
        // graphicAssets format should be:
        // {
        //     asset_id: {
        //         path: "path/to/asset",
        //         img: null
        //     },
        //     another_asset_id: ...
        // };

        this.gameObjects = [];
    }

    Start() { }
    
    Update(deltaTime) {
        this.gameObjects.forEach((gameObject) => {
            if (gameObject.active)
                gameObject.Update(deltaTime);
        });
    }
    
    Draw(ctx) {
        this.gameObjects.forEach((gameObject) => {
            if (gameObject.active)
                gameObject.Draw(ctx);
        });
    }
}