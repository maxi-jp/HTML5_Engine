class LineIntersection extends Game {
    constructor(renderer) {
        super(renderer);

        this.ball = null;
        
        this.upWall = null;
        this.rightWall = null;
        this.downWall = null;
        this.leftWall = null;
        this.walls = null;

        this.currentLineIntersection = Vector2.Zero();
        this.ballFarPosition = Vector2.Zero();
        this.ballBouncePosition = Vector2.Zero();
        this.intersection = null;
    }

    Start() {
        this.screenWidth = 480;
        this.screenHeight = 480;

        this.ball = new Ball(new Vector2(this.screenHalfWidth, this.screenHalfHeight), 10, 0);
        this.ball.Start();

        this.upWall = {
            p1: {x: 0, y: 0},
            p2: {x: this.screenWidth, y:0},
            dir: new Vector2(1, 0)
        };
        this.rightWall = {
            p1: {x: this.screenWidth, y: 0},
            p2: {x: this.screenWidth, y: this.screenHeight},
            dir: new Vector2(0, 1)
        };
        this.downWall = {
            p1: {x: this.screenWidth, y: this.screenHeight},
            p2: {x: 0, y:this.screenHeight},
            dir: new Vector2(-1, 0)
        };
        this.leftWall = {
            p1: {x: 0, y: this.screenHeight},
            p2: {x: 0, y: 0},
            dir: new Vector2(0, -1)
        };
        this.walls = [this.upWall, this.rightWall, this.downWall, this.leftWall];
    }

    Update(deltaTime) {
        // randomize the walls
        if (Input.IsKeyDown(KEY_A)) {
            // left-upper corner
            this.upWall.p1.x = this.leftWall.p2.x = RandomBetweenFloat(0, 100);
            this.upWall.p1.y = this.leftWall.p2.y = RandomBetweenFloat(0, 100);
    
            // right-upper corner
            this.upWall.p2.x = this.rightWall.p1.x = RandomBetweenFloat(this.screenWidth - 100, this.screenWidth);
            this.upWall.p2.y = this.rightWall.p1.y = RandomBetweenFloat(0, 100);
    
            // right-down corner
            this.rightWall.p2.x = this.downWall.p1.x = RandomBetweenFloat(this.screenWidth - 100, this.screenWidth);
            this.rightWall.p2.y = this.downWall.p1.y = RandomBetweenFloat(this.screenHeight - 100, this.screenHeight);
    
            // left-down corner
            this.downWall.p2.x = this.leftWall.p1.x = RandomBetweenFloat(0, 100);
            this.downWall.p2.y = this.leftWall.p1.y = RandomBetweenFloat(this.screenHeight - 100, this.screenHeight);
    
            // update the walls direction vector
            this.walls.forEach(wall => {
                wall.dir.Set(wall.p2.x - wall.p1.x, wall.p2.y - wall.p1.y);
                wall.dir.Normalize();
            });
        }

        // start moving the ball
        if (Input.IsKeyDown(KEY_S)) {
            this.ball.speed = 300;
        }

        if (this.ball.speed == 0) {
            // ball faces the mouse
            this.ball.dir.x = Input.mouse.x - this.ball.position.x;
            this.ball.dir.y = Input.mouse.y - this.ball.position.y;
            this.ball.dir.Normalize();
        }

        this.intersection = null;
        this.ballFarPosition.x = this.ball.position.x + this.ball.dir.x * 1000;
        this.ballFarPosition.y = this.ball.position.y + this.ball.dir.y * 1000;

        this.ball.Update(deltaTime);

        // compute intersections

        // top wall
        this.intersection = IntersectionBetweenLines(this.ball.position, this.ballFarPosition, this.upWall.p1, this.upWall.p2);
        if (this.intersection.det !== 0)
        {
            this.BallBounce(this.upWall.dir);
            this.currentLineIntersection.x = this.intersection.x;
            this.currentLineIntersection.y = this.intersection.y;
        }
    
        // right wall
        this.intersection = IntersectionBetweenLines(this.ball.position, this.ballFarPosition, this.rightWall.p1, this.rightWall.p2);
        if (this.intersection.det !== 0)
        {
            this.BallBounce(this.rightWall.dir);
            this.currentLineIntersection.x = this.intersection.x;
            this.currentLineIntersection.y = this.intersection.y;
        }
    
        // down wall
        this.intersection = IntersectionBetweenLines(this.ball.position, this.ballFarPosition, this.downWall.p1, this.downWall.p2);
        if (this.intersection.det !== 0)
        {
            this.BallBounce(this.downWall.dir);
            this.currentLineIntersection.x = this.intersection.x;
            this.currentLineIntersection.y = this.intersection.y;
        }
    
        // left wall
        this.intersection = IntersectionBetweenLines(this.ball.position, this.ballFarPosition, this.leftWall.p1, this.leftWall.p2);
        if (this.intersection.det !== 0)
        {
            this.BallBounce(this.leftWall.dir);
            this.currentLineIntersection.x = this.intersection.x;
            this.currentLineIntersection.y = this.intersection.y;
        }
    }

    Draw() {
        this.renderer.DrawFillBasicRectangle(0, 0, this.screenWidth, this.screenHeight, Color.black);
        const ctx = this.renderer.ctx;

        // lines of the walls
        this.walls.forEach(wall => {
            // wall line
            this.renderer.DrawLine(wall.p1.x, wall.p1.y, wall.p2.x, wall.p2.y, Color.orange);

            // wall direction line
            this.renderer.DrawLine(wall.p1.x, wall.p1.y, wall.p1.x + wall.dir.x * 50, wall.p1.y + wall.dir.y * 50, Color.red);
            
        });

        // line from the ball to infinity
        this.renderer.DrawLine(this.ball.position.x, this.ball.position.y, this.ballFarPosition.x, this.ballFarPosition.y, Color.yellow);
        
        // line from the ball to the mouse
        this.renderer.DrawLine(this.ball.position.x, this.ball.position.y, Input.mouse.x, Input.mouse.y, Color.green);

        // line from the intersection point following the bounce
        this.renderer.DrawLine(this.currentLineIntersection.x, this.currentLineIntersection.y, this.ballBouncePosition.x, this.ballBouncePosition.y, Color.blue);

        // intersection point
        this.renderer.DrawCircle(this.currentLineIntersection.x, this.currentLineIntersection.y, 3, Color.red);
        
        this.ball.Draw(this.renderer);

        this.renderer.DrawText("Press 'A' to randomize the walls", 10, this.screenHeight - 30, "14px Arial", Color.white, "left");
        this.renderer.DrawText("Press 'S' to launch the ball", 10, this.screenHeight - 10, "14px Arial", Color.white, "left");
    }

    BallBounce(wallDir) {
        let angle = AngleBetweenVectors(this.ball.dir, wallDir);
        const wallAngle = Math.atan2(wallDir.y, wallDir.x);
        angle += wallAngle;

        this.ballBouncePosition.x = this.currentLineIntersection.x + Math.cos(angle) * 100;
        this.ballBouncePosition.y = this.currentLineIntersection.y + Math.sin(angle) * 100;
    }
}

class Ball extends CircleGO {
    constructor(position, radius, speed) {
        super(position, radius, Color.white);

        this.dir = Vector2.Zero();
        this.speed = speed;
        this.timeToBeRed = 0;
    }

    Start() {
        this.dir.RandomNormalized();
    }

    Update(deltaTime) {
        this.position.x += this.dir.x * this.speed * deltaTime;
        this.position.y += this.dir.y * this.speed * deltaTime;

        this.timeToBeRed -= deltaTime;
        if (this.timeToBeRed <= 0) {
            this.circle.color = Color.white;
        }
    }

    Draw(renderer) {
        super.Draw(renderer);

        // direction vector
        renderer.DrawLine(this.position.x, this.position.y, this.position.x + this.dir.x * this.radious, this.position.y + this.dir.y * this.radious, Color.red);
    }

    Collision() {
        this.circle.color = Color.red;
        this.timeToBeRed = 0.2;
    }
}
