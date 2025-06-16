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
    }
    
    Update(deltaTime) {
        this.gameObjects.forEach((gameObject) => {
            if (gameObject.active)
                gameObject.Update(deltaTime);
        });
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
            if (typeof gameObject.Destroy === "function") {
                gameObject.Destroy();
            }

            gameObject.active = false;

            this.gameObjects.splice(index, 1);
        }
        else
            console.warn("Error when destroying the gameObjet: GO not found in the gameObjects array.", gameObject);
    }
}