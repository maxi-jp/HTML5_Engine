class CollidersTest extends Game {
    constructor(renderer) {
        super(renderer);

        this.config.drawColliders = true;

        // basic colliders (without game object)
        this.box = null;
        this.boxPosition = new Vector2(200, 150);
        this.circle1 = null;
        this.circle1Position = new Vector2(400, 300);
        this.circle2 = null;
        this.circle2Position = new Vector2(400, 400);
        this.polygon = null;
        this.polygonPosition = new Vector2(500, 100);
        this.polygonRotation = 0;

        // game objects with collider
        this.rectGO1 = null;
    }

    Start() {
        super.Start();

        this.box = new RectangleCollider(this.boxPosition, 120, 80);
        this.box.onClickCallback = () => { alert("blox clicked"); }
        this.circle1 = new CircleCollider(this.circle1Position, 50);
        this.circle2 = new CircleCollider(this.circle2Position, 25);
        this.circle2.onClickCallback = () => { alert("circle clicked"); }
        this.polygon = new PolygonCollider(this.polygonPosition, 0, [
            { x:   0, y: -50 },
            { x:  50, y:  40 },
            { x: -50, y:  40 }
        ]);
        this.polygon.onClickCallback = () => { alert("polygon clicked"); }

        this.AddCollider(this.box);
        this.AddCollider(this.circle1);
        this.AddCollider(this.circle2);
        this.AddCollider(this.polygon);

        this.rectGO1 = new RectangleGO(new Vector2(100, 300), 100, 60, new Color(1, 0, 1, 0.5));
        const rectGO1Collider = new RectangleCollider(Vector2.Zero(), this.rectGO1.rectangle.width, this.rectGO1.rectangle.height, this.rectGO1);
        this.rectGO1.collider = rectGO1Collider;
        this.AddCollider(rectGO1Collider);

        this.gameObjects.push(this.rectGO1);
    }

    Update(deltaTime) {
        super.Update(deltaTime);

        if (Input.IsKeyPressed(KEY_A)) {
            this.box.position.x -= 100 * deltaTime;
            this.rectGO1.position.x -= 100 * deltaTime;
        }
        if (Input.IsKeyPressed(KEY_D)) {
            this.box.x += 100 * deltaTime;
            this.rectGO1.position.x += 100 * deltaTime;
        }
        if (Input.IsKeyPressed(KEY_W)) {
            this.box.y -= 100 * deltaTime;
            this.rectGO1.position.y -= 100 * deltaTime;
        }
        if (Input.IsKeyPressed(KEY_S)) {
            this.box.y += 100 * deltaTime;
            this.rectGO1.position.y += 100 * deltaTime;
        }

        this.circle1.UpdatePosition(Input.mouse);
        
        if (Input.IsKeyPressed(KEY_LEFT)) {
            this.polygonPosition.x -= 100 * deltaTime;
        }
        if (Input.IsKeyPressed(KEY_RIGHT)) {
            this.polygonPosition.x += 100 * deltaTime;
        }
        if (Input.IsKeyPressed(KEY_UP)) {
            this.polygonPosition.y -= 100 * deltaTime;
        }
        if (Input.IsKeyPressed(KEY_DOWN)) {
            this.polygonPosition.y += 100 * deltaTime;
        }

        this.polygonRotation += 1 * deltaTime;
        this.polygon.UpdatePositionAndRotation(this.polygonPosition, this.polygonRotation);
    }

    Draw() {
        super.Draw();
    }
}
