class Game {
    _screenWidth = 640;
    _screenHeight = 480;
    _screenHalfWidth = 0;
    _screenHalfHeight = 0;

    _audioActive = true;

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
        canvas.width = this._screenWidth;
    }
    set screenHeight(value) {
        this._screenHeight = value;
        this._screenHalfHeight = this._screenHeight / 2;
        canvas.height = this._screenHeight;
    }
    set audioActive(value) {
        this._audioActive = value;
    }

    Start() {
        canvas.width = this._screenWidth;
        canvas.height = this._screenHeight;
        this.gameObjects = [];
    }
    
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