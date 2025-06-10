class BasicGame extends Game {
    constructor(renderer) {
        super(renderer);
        this.graphicAssets = {
            snake: {
                path: "src/examples/common_assets/snake.png",
                img: null
            },
            portal: {
                path: "src/examples/common_assets/portal2.png",
                img: null
            }
        };

        // game objects
        this.redRect = null;
        this.yellowRect = null;

        // other objects
        this.blackRect = null;
        this.blueCircle = null;
        this.pinkCircle = null;
        this.snakeSprite = null;
        this.portalSprite = null;

        // auxiliar
        this.grey = new Color(0.5, 0.5, 0.5, 1);
    }
    
    Start() {
        super.Start();
        
        // a red 100x100px rectangle game object
        this.redRect = new RectangleGO(new Vector2(this.screenHalfWidth, this.screenHalfHeight));
        this.gameObjects.push(this.redRect);

        // a yellow 50x50px rectangle game object
        this.yellowRect = new RectangleGO(new Vector2(this.screenHalfWidth, this.screenHalfHeight), 50, 50, Color.Yellow(), true, 4);
        this.gameObjects.push(this.yellowRect);

        // big black background rectangle
        this.blackRect = new Rectangle(new Vector2(0, this.screenHalfHeight), this.screenWidth, this.screenHalfHeight);
        
        // blue fill circle
        this.blueCircle = new Circle(new Vector2(400, 100), 40, Color.Blue(), );
        // purple stroke circle
        this.pinkCircle = new Circle(new Vector2(400, 100), 40, new Color(1, 0, 1, 1), true, 4);

        // Snake sprite
        this.snakeSprite = new Sprite(this.graphicAssets.snake.img, new Vector2(100, 100), 0, 1);
        // Portal sprite
        this.portalSprite = new Sprite(this.graphicAssets.portal.img, new Vector2(100, 300), 0, 1);
    }

    Update(deltaTime) {
        super.Update(deltaTime);

        this.redRect.rotation += 1 * deltaTime;
        this.yellowRect.rotation -= 1.5 * deltaTime;

        this.portalSprite.rotation += 0.33 * deltaTime;

        this.pinkCircle.radius = (Math.sin(totalTime) + 1) * this.blueCircle.radius * 0.5;
    }

    Draw() {
        this.blackRect.Draw(this.renderer);
        this.renderer.DrawLine(this.screenHalfWidth, 0, this.screenHalfWidth, this.screenHeight, this.grey);
        this.renderer.DrawLine(0, this.screenHalfHeight, this.screenWidth, this.screenHalfHeight, this.grey);

        super.Draw();

        this.snakeSprite.DrawBasic(this.renderer);
        this.portalSprite.Draw(this.renderer);

        this.blueCircle.Draw(this.renderer);
        this.pinkCircle.Draw(this.renderer);

        this.renderer.DrawFillText("Watson!!! O_O", this.screenHalfWidth, 20, "20px Comic Sans MS");
    }
}