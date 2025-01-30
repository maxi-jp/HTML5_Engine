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
        this.player = null;
        this.camera = null;

        this.sceneLimits = null;
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

        this.sceneLimits = new Rectangle(Vector2.Zero(), canvas.width, canvas.height - 100, "white", true);

        this.player = new PlayerShip(new Vector2(canvas.width / 2, canvas.height / 2), 0, 1, this.graphicAssets.ships.img, this.sceneLimits);
        this.player.Start();
        this.gameObjects.push(this.player);

        this.camera = new FollowCamera(Vector2.Zero(), this.player, -100, 500, -100, 100, 5);
        this.camera.Start();
        this.player.camera = this.camera;
    }

    Update(deltaTime) {
        // update the game objects
        super.Update(deltaTime);

        // update the camera
        this.camera.Update(deltaTime);

        this.mouseCircle.position.Set(Input.mouse.x, Input.mouse.y);
    }

    Draw(ctx) {
        // background
        ctx.fillStyle = this.bgGrad.gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.camera.PreDraw(ctx);

        // background grid
        // horizontal lines
        const verticalStep = 50;
        const horizontalLines = this.sceneLimits.height / verticalStep;
        for (let i = 0; i < horizontalLines; i++) {
            DrawSegment(ctx, this.sceneLimits.position.x, this.sceneLimits.position.y + verticalStep * i, this.sceneLimits.position.x + this.sceneLimits.width, this.sceneLimits.position.y + verticalStep * i, "grey", 1);
        }
        // vertical lines
        const horizontalStep = 50;
        const verticalLines = this.sceneLimits.width / horizontalStep;
        for (let i = 0; i < verticalLines; i++) {
            DrawSegment(ctx, this.sceneLimits.position.x + horizontalStep * i, this.sceneLimits.position.y, this.sceneLimits.position.x + horizontalStep * i, this.sceneLimits.position.y + this.sceneLimits.height, "grey", 1);
        }

        this.sceneLimits.Draw(ctx);

        // draw the game objects
        super.Draw(ctx);

        this.camera.PostDraw(ctx);

        // draw the mouse position
        this.mouseCircle.Draw(ctx);
    }
}

// initialize the game
if (game === null)
    game = new TTS();