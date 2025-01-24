class PlayerShip extends SpriteObject {
    constructor(position, rotation, scale, img) {
        super(position, rotation, scale, img);

        this.speed = 300;
        this.life = 100;

        this.movement = Vector2.Zero();

        this.fireRate = 0.1;
        this.fireRateAux = 0;

        this.cannonOffset = new Vector2(10, 0);
    }

    Update(deltaTime) {
        // movement
        this.movement.Set(0, 0);

        if (Input.IsKeyPressed(KEY_A)) {
            this.movement.x -= 1;
        }
        if (Input.IsKeyPressed(KEY_D)) {
            this.movement.x += 1;
        }
        if (Input.IsKeyPressed(KEY_W)) {
            this.movement.y -= 1;
        }
        if (Input.IsKeyPressed(KEY_S)) {
            this.movement.y += 1;
        }
        this.movement.Normalize();

        // apply the movement
        this.position.x += this.movement.x * this.speed * deltaTime;
        this.position.y += this.movement.y * this.speed * deltaTime;
    }

    Draw(ctx) {
        super.DrawSection(ctx, 52, 244, 48, 48);
    }
}

class TTS extends Game {
    constructor() {
        super();
        this.graphicAssets = {
            ships: {
                path: "assets/simpleSpace_sheet.png",
                img: null
            },
            crosshair: {
                path: "assets/crosshair060.png",
                img: null
            }
        };

        // background gradient
        this.bgGrad = null;

        this.mouseCircle = null;
        this.rectangle = null;
        this.player = null;
    }

    Start() {
        super.Start();

        // configure background gradient
        this.bgGrad = new LinearGradient(0, 0, 0, canvas.height, [
            [0, "#191200"],
            [0.1, "#000000"],
            [0.35, "#07073e"],
            [0.95, "#22375e"],
            [1, "#274f98"]
        ]);

        this.mouseCircle = new Circumference(new Vector2(0, 0), 5, 'red', 1);

        this.rectangle = new Rectangle(new Vector2(canvas.width / 2, canvas.height / 2));
        this.rectangle.width = 200;
        this.rectangle.height = 100;
        this.rectangle.color = "blue";
        this.gameObjects.push(this.rectangle);

        this.player = new PlayerShip(new Vector2(canvas.width / 2, canvas.height / 2), 0, 1, this.graphicAssets.ships.img);
        this.gameObjects.push(this.player);
    }

    Update(deltaTime) {
        super.Update(deltaTime);

        this.mouseCircle.position.Set(Input.mouse.x, Input.mouse.y);
    }

    Draw(ctx) {
        // background
        ctx.fillStyle = this.bgGrad.gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        super.Draw(ctx);

        // draw the mouse position
        this.mouseCircle.Draw(ctx);
    }
}

// initialize the game
// if (game === null)
//     game = new TTS();