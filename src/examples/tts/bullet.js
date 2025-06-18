class Bullet extends RectangleGO {
    constructor() {
        super(Vector2.Zero(), 8, 2, Color.yellow);
        
        this.speed = 700;
        this.damage = 1;
        this.owner = null;

        this.active = false;
    }

    Update(deltaTime) {
        this.position.x += Math.cos(this.rotation) * this.speed * deltaTime;
        this.position.y += Math.sin(this.rotation) * this.speed * deltaTime;
    }
}
