class ObjectPooling extends Game {
    constructor(renderer) {
        super(renderer);

        // create an object pool of CircleGO objects
        // class Pool(owner, maxSize, objectConstructor, constructorParams=[])
        this.circles = new Pool(this, 10, MovingCircle, [10]);
        this.circles.drawDebug = true;
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

        // deactivate circles outside the canvas
        this.circles.objects.forEach(circle => {
            if (circle.position.x < 0 || circle.position.x > this.screenWidth ||
                circle.position.y < 0 || circle.position.y > this.screenHeight) {
                circle.active = false;
            }
        });
    }

    Draw() {
        renderer.DrawFillBasicRectangle(0, 0, canvas.width, canvas.height, Color.black);

        super.Draw();

        this.circles.Draw(this.renderer);
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