class SnakeGame extends Game {
    constructor() {
        super();

        this.gridSize = { cols: 20, rows: 15 };
        this.cellSize = 24;
        this.gridOffset = { x: 40, y: 40 };

        this.snake = [{ x: 10, y: 7 }];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.food = { x: 5, y: 5 };

        this.moveTimer = 0;
        this.moveInterval = 0.12; // seconds per move

        this.score = 0;
        this.scoreLabel = null;
        this.gameOver = false;
    }

    Start() {
        super.Start();

        this.snake = [{ x: 10, y: 7 }];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.food = this.RandomFood();
        this.moveTimer = 0;
        this.score = 0;
        this.gameOver = false;
        this.scoreLabel = new TextLabel("Score: 0", new Vector2(20, 20), "20px Comic Sans MS", "black", "left", "middle", false);
    }

    Update(deltaTime) {
        super.Update(deltaTime);
        
        if (this.gameOver) return;

        // Input
        if ((Input.IsKeyDown(KEY_LEFT) || Input.IsKeyDown(KEY_A)) && this.direction.x !== 1) {
            this.nextDirection = { x: -1, y: 0 };
        }
        if ((Input.IsKeyDown(KEY_RIGHT) || Input.IsKeyDown(KEY_D)) && this.direction.x !== -1) {
            this.nextDirection = { x: 1, y: 0 };
        }
        if ((Input.IsKeyDown(KEY_UP) || Input.IsKeyDown(KEY_W)) && this.direction.y !== 1) {
            this.nextDirection = { x: 0, y: -1 };
        }
        if ((Input.IsKeyDown(KEY_DOWN) || Input.IsKeyDown(KEY_S)) && this.direction.y !== -1) {
            this.nextDirection = { x: 0, y: 1 };
        }

        this.moveTimer += deltaTime;
        if (this.moveTimer >= this.moveInterval) {
            this.moveTimer = 0;
            this.MoveSnake();
        }
    }

    MoveSnake() {
        this.direction = this.nextDirection;
        const head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };

        // Check collision with walls
        if (
            head.x < 0 || head.x >= this.gridSize.cols ||
            head.y < 0 || head.y >= this.gridSize.rows
        ) {
            this.gameOver = true;
            this.scoreLabel.text = "Game Over! Score: " + this.score;
            return;
        }

        // Check collision with self
        for (let i = 0; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.gameOver = true;
                this.scoreLabel.text = "Game Over! Score: " + this.score;
                return;
            }
        }

        this.snake.unshift(head);

        // Check food
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.scoreLabel.text = "Score: " + this.score;
            this.food = this.RandomFood();
        } else {
            this.snake.pop();
        }
    }

    RandomFood() {
        let pos;
        do {
            pos = {
                x: RandomBetweenInt(0, this.gridSize.cols - 1),
                y: RandomBetweenInt(0, this.gridSize.rows - 1)
            };
        } while (this.snake.some(s => s.x === pos.x && s.y === pos.y));
        return pos;
    }

    Draw(ctx) {
        super.Draw(ctx);

        // Draw background
        DrawFillRectangle(ctx, this.gridOffset.x, this.gridOffset.y, this.gridSize.cols * this.cellSize, this.gridSize.rows * this.cellSize, "#e0e0e0");

        // Draw snake
        for (let i = 0; i < this.snake.length; i++) {
            DrawFillRectangle(
                ctx,
                this.gridOffset.x + this.snake[i].x * this.cellSize,
                this.gridOffset.y + this.snake[i].y * this.cellSize,
                this.cellSize - 2, this.cellSize - 2,
                i === 0 ? "green" : "lime"
            );
        }

        // Draw food
        DrawFillRectangle(
            ctx,
            this.gridOffset.x + this.food.x * this.cellSize,
            this.gridOffset.y + this.food.y * this.cellSize,
            this.cellSize - 2, this.cellSize - 2,
            "red"
        );

        // Draw border
        DrawStrokeRectangle(ctx, this.gridOffset.x, this.gridOffset.y, this.gridSize.cols * this.cellSize, this.gridSize.rows * this.cellSize, "black", 2);

        // Draw score
        this.scoreLabel.Draw(ctx);
    }
}

// Initialize the game
if (game === null)
    game = new SnakeGame();