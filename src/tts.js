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

var TTS = {
    rectangle: null,
    player: null,

    Start: function() {
        this.rectangle = new Rectangle(new Vector2(canvas.width / 2, canvas.height / 2));
        this.rectangle.width = 200;
        this.rectangle.height = 100;
        this.rectangle.color = "blue";

        this.player = new PlayerShip(new Vector2(canvas.width / 2, canvas.height / 2), 0, 1, graphicAssets.ships.img);
    },

    Update: function(deltaTime) {
        this.rectangle.Update(deltaTime);

        this.player.Update(deltaTime);
    },

    Draw: function(ctx) {
        this.rectangle.Draw(ctx);

        this.player.Draw(ctx);
    }
}