class MyGame extends Game {
    constructor(renderer) {
        super(renderer);

        this.graphicAssets = {
            derpy_mario: {
                path: "mygame/assets/derpy_mario.png",
                img: null
            },
        };

        this.redBox = null;
        this.player = null;
    }

    Start() {
        super.Start();

        // Setup input actions
        Input.RegisterAxis("MoveHorizontal", [
            { type: 'key', positive: KEY_D, negative: KEY_A },
            { type: 'key', positive: KEY_RIGHT, negative: KEY_LEFT },
            { type: 'gamepadaxis', stick: 'LS', axis: 0 }, // Left Stick X
            { type: 'gamepadbutton', positive: 'DPAD_RIGHT', negative: 'DPAD_LEFT' }
        ]);

        Input.RegisterAxis("MoveVertical", [
            { type: 'key', positive: KEY_S, negative: KEY_W },
            { type: 'key', positive: KEY_DOWN, negative: KEY_UP },
            { type: 'gamepadaxis', stick: 'LS', axis: 1 }, // Left Stick Y
            { type: 'gamepadbutton', positive: 'DPAD_DOWN', negative: 'DPAD_UP' }
        ]);

        Input.RegisterAction("Rotate", [
            { type: 'key', code: KEY_SPACE },
            { type: 'key', code: KEY_F }
        ]);

        // gameobjects
        this.redBox = new RectangleGO(new Vector2(this._screenHalfWidth, this._screenHalfHeight), 100, 100, Color.red);
        this.gameObjects.push(this.redBox);

        this.player = new Player(new Vector2(this._screenHalfWidth, this._screenHalfHeight), this.graphicAssets.derpy_mario.img);
        this.gameObjects.push(this.player);
    }

    Update(deltaTime) {
        this.redBox.rotation += 0.25;
        this.redBox.y = this._screenHalfHeight + Math.sin(totalTime * 5) * 100;
        this.redBox.x = this._screenHalfWidth + Math.cos(totalTime * 5) * 100;

        super.Update(deltaTime);
    }

    Draw() {
        this.renderer.DrawBasicRectangle(0, 0, this._screenWidth, this._screenHeight);

        super.Draw();
    }
}

class Player extends SpriteObject {
    constructor(position, img) {
        super(position, 0, 0.5, img);

        this.speed = 100;
    }

    Update(deltaTime) {
        // input basic events
        // if (Input.IsKeyPressed(KEY_LEFT))
        //     this.x -= this.speed * deltaTime;
        // if (Input.IsKeyPressed(KEY_RIGHT))
        //     this.x += this.speed * deltaTime;
        // if (Input.IsKeyPressed(KEY_UP))
        //     this.y -= this.speed * deltaTime;
        // if (Input.IsKeyPressed(KEY_DOWN))
        //     this.y += this.speed * deltaTime;

        // Input action events
        this.x += Input.GetAxis("MoveHorizontal") * this.speed * deltaTime;
        this.y += Input.GetAxis("MoveVertical") * this.speed * deltaTime;

        if (Input.GetActionDown("Rotate") || Input.GetActionUp("Rotate")) {
            this.rotation += PIH;
        }
    }
}

// initialize the game
window.onload = () => {
    Init(MyGame);
}
