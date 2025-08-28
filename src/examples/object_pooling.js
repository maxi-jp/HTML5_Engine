class ObjectPooling extends Game {
    constructor(renderer) {
        super(renderer);

        this.activeObjectsLabel = new TextLabel("Active objects in the pool: 0", new Vector2(10, this.screenHeight - 20), "16px Comic Sans MS", Color.white, "left", "bottom");

        // create an object pool of CircleGO objects
        // class Pool(owner, maxSize, objectConstructor, constructorParams=[])
        this.circles = new Pool(this, 10, MovingCircle, [10]);
        this.circles.drawDebug = true;

        this.activeObjects = 0;
    }

    Start() {
        super.Start();
    }

    Update(deltaTime) {
        super.Update(deltaTime);

        if (Input.IsMousePressed()) {
            const circle = this.circles.Activate();
            circle.position.Set(Input.mouse.x, Input.mouse.y);
        }

        this.circles.Update(deltaTime);

        // deactivate circles outside the canvas and count the active objects
        this.activeObjects = 0;
        this.circles.objects.forEach(circle => {
            if (circle.position.x < 0 || circle.position.x > this.screenWidth ||
                circle.position.y < 0 || circle.position.y > this.screenHeight) {
                circle.active = false;
            }
            
            if (circle.active)
                this.activeObjects++;
        });
        this.activeObjectsLabel.text = `Active objects in the pool: ${this.activeObjects}`;
    }

    Draw() {
        renderer.DrawFillBasicRectangle(0, 0, canvas.width, canvas.height, Color.black);

        super.Draw();

        this.circles.Draw(this.renderer);

        this.activeObjectsLabel.Draw(this.renderer);
    }
}

class MovingCircle extends CircleGO {
    constructor(radius) {
        super(Vector2.Zero, radius);
        this.direction = Vector2.Random();
        this.direction.Normalize();
        this.direction.MultiplyScalar(RandomBetweenFloat(50, 400));
    }

    Update(deltaTime) {
        this.position.x += this.direction.x * deltaTime;
        this.position.y += this.direction.y * deltaTime;
    }
}

// initialize the game
window.onload = () => {
    Init(ObjectPooling);
}