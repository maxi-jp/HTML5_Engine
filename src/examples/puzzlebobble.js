class PuzzleBobbleGame extends Game {
    constructor() {
        super();
        this.gridCols = 8;
        this.gridRows = 12;
        this.cellSize = 32;
        this.gridOffset = { x: 30, y: 40 };

        this.colors = ["red", "blue", "yellow", "green", "purple", "cyan"];
        this.grid = [];
        this.bubbles = [];
        this.shooter = { x: 4, y: this.gridRows, angle: -Math.PI/2 };
        this.shooting = false;
        this.shotBubble = null;
        this.shotSpeed = 400;
        this.score = 0;
        this.scoreLabel = null;
    }

    Start() {
        super.Start();

        this.screenWidth = 320;
        this.screenHeight = 480;

        // Fill grid with random bubbles (top 5 rows)
        this.grid = [];
        for (let y = 0; y < this.gridRows; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridCols; x++) {
                this.grid[y][x] = (y < 5) ? this.colors[RandomBetweenInt(0, this.colors.length-1)] : null;
            }
        }
        this.shooter.x = this.gridCols / 2;
        this.shooter.angle = -PIH;
        this.shooting = false;
        this.shotBubble = null;
        this.score = 0;
        this.scoreLabel = new TextLabel("Score: 0", new Vector2(20, 20), "20px Comic Sans MS", "black", "left", "middle", false);
        this.nextColor = this.colors[RandomBetweenInt(0, this.colors.length-1)];
    }

    Update(deltaTime) {
        super.Update(deltaTime);

        // Aim
        if (!this.shooting) {
            if (Input.IsKeyPressed(KEY_LEFT) || Input.IsKeyPressed(KEY_A))
                this.shooter.angle -= 2 * deltaTime;
            if (Input.IsKeyPressed(KEY_RIGHT) || Input.IsKeyPressed(KEY_D))
                this.shooter.angle += 2 * deltaTime;

            // Clamp angle between -150° and -30°
            this.shooter.angle = Math.max(-Math.PI*5/6, Math.min(-Math.PI/6, this.shooter.angle));

            // Shoot
            if (Input.IsKeyDown(KEY_SPACE) || Input.IsKeyDown(KEY_UP)) {
                this.shooting = true;
                this.shotBubble = {
                    x: this.gridOffset.x + (this.gridCols * this.cellSize) / 2,
                    y: this.gridRows * this.cellSize + this.gridOffset.y,
                    vx: Math.cos(this.shooter.angle) * this.shotSpeed,
                    vy: Math.sin(this.shooter.angle) * this.shotSpeed,
                    color: this.nextColor
                };
                this.nextColor = this.colors[RandomBetweenInt(0, this.colors.length-1)];
            }
        }
        else if (this.shotBubble) {
            // Move bubble
            this.shotBubble.x += this.shotBubble.vx * deltaTime;
            this.shotBubble.y += this.shotBubble.vy * deltaTime;

            // Bounce off walls
            if (this.shotBubble.x < this.gridOffset.x + this.cellSize/2) {
                this.shotBubble.x = this.gridOffset.x + this.cellSize/2;
                this.shotBubble.vx *= -1;
            }
            if (this.shotBubble.x > this.gridOffset.x + this.gridCols*this.cellSize - this.cellSize/2) {
                this.shotBubble.x = this.gridOffset.x + this.gridCols*this.cellSize - this.cellSize/2;
                this.shotBubble.vx *= -1;
            }

            // Check collision with grid or top
            let gridY = Math.floor((this.shotBubble.y - this.gridOffset.y) / this.cellSize);
            let gridX = Math.floor((this.shotBubble.x - this.gridOffset.x) / this.cellSize);

            if (gridY < this.gridRows && (this.grid[gridY][gridX] || this.shotBubble.y < this.gridOffset.y + this.cellSize/2)) {
                // Find nearest empty neighbor cell
                let placed = false;
                let neighbors = [
                    [0, -1], [0, 1], [-1, 0], [1, 0], // up, down, left, right
                    [-1, -1], [1, -1], [-1, 1], [1, 1] // diagonals
                ];
                let minDist = Infinity, best = null;
                for (let [dx, dy] of neighbors) {
                    let nx = gridX + dx, ny = gridY + dy;
                    if (nx >= 0 && nx < this.gridCols && ny >= 0 && ny < this.gridRows && !this.grid[ny][nx]) {
                        // Compute distance from bubble center to cell center
                        let cx = this.gridOffset.x + nx * this.cellSize + this.cellSize/2;
                        let cy = this.gridOffset.y + ny * this.cellSize + this.cellSize/2;
                        let dist = Math.hypot(this.shotBubble.x - cx, this.shotBubble.y - cy);
                        if (dist < minDist) {
                            minDist = dist;
                            best = {x: nx, y: ny};
                        }
                    }
                }
                // If no neighbor found, just use the current cell (shouldn't happen)
                if (!best)
                    best = {x: gridX, y: gridY};

                if (!this.grid[best.y][best.x]) {
                    this.grid[best.y][best.x] = this.shotBubble.color;
                }

                this.shooting = false;
                this.shotBubble = null;
                this.CheckMatches(best.x, best.y);
            }
        }
    }

    Draw(ctx) {
        super.Draw(ctx);
        // Draw grid
        for (let y = 0; y < this.gridRows; y++) {
            for (let x = 0; x < this.gridCols; x++) {
                if (this.grid[y][x]) {
                    DrawFillCircle(
                        ctx,
                        this.gridOffset.x + x * this.cellSize + this.cellSize/2,
                        this.gridOffset.y + y * this.cellSize + this.cellSize/2,
                        this.cellSize/2 - 2,
                        this.grid[y][x]
                    );
                }
            }
        }

        // Draw shooter
        let sx = this.gridOffset.x + (this.gridCols * this.cellSize) / 2;
        let sy = this.gridRows * this.cellSize + this.gridOffset.y;
        let aimX = sx + Math.cos(this.shooter.angle) * 60;
        let aimY = sy + Math.sin(this.shooter.angle) * 60;
        DrawSegment(ctx, sx, sy, aimX, aimY, "black", 3);
        DrawFillCircle(ctx, sx, sy, this.cellSize/2 - 2, this.nextColor);

        // Draw trajectory preview
        if (!this.shooting) {
            let x = this.gridOffset.x + (this.gridCols * this.cellSize) / 2;
            let y = this.gridRows * this.cellSize + this.gridOffset.y;
            let angle = this.shooter.angle;
            let vx = Math.cos(angle);
            let vy = Math.sin(angle);
            let speed = this.shotSpeed * 0.02; // step size for preview
            let maxSteps = 60;
            let previewPoints = [{x, y}];

            for (let i = 0; i < maxSteps; i++) {
                x += vx * speed;
                y += vy * speed;

                // Bounce off walls
                if (x < this.gridOffset.x + this.cellSize/2) {
                    x = this.gridOffset.x + this.cellSize/2;
                    vx *= -1;
                }
                if (x > this.gridOffset.x + this.gridCols*this.cellSize - this.cellSize/2) {
                    x = this.gridOffset.x + this.gridCols*this.cellSize - this.cellSize/2;
                    vx *= -1;
                }

                // Stop preview if it would hit the top or a bubble
                let gridY = Math.floor((y - this.gridOffset.y) / this.cellSize);
                let gridX = Math.floor((x - this.gridOffset.x) / this.cellSize);
                if (gridY < 0 || (gridY < this.gridRows && this.grid[gridY][gridX])) {
                    previewPoints.push({x, y});
                    break;
                }
                previewPoints.push({x, y});
            }

            // Draw the preview line
            ctx.save();
            ctx.strokeStyle = "rgba(0,0,0,0.3)";
            ctx.setLineDash([6, 6]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(previewPoints[0].x, previewPoints[0].y);
            for (let i = 1; i < previewPoints.length; i++) {
                ctx.lineTo(previewPoints[i].x, previewPoints[i].y);
            }
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }

        // Draw flying bubble
        if (this.shotBubble) {
            DrawFillCircle(ctx, this.shotBubble.x, this.shotBubble.y, this.cellSize/2 - 2, this.shotBubble.color);
        }

        // Draw border
        DrawStrokeRectangle(ctx, this.gridOffset.x, this.gridOffset.y, this.gridCols * this.cellSize, this.gridRows * this.cellSize, "white", 2);

        // Draw score
        this.scoreLabel.Draw(ctx);
    }

    CheckMatches(x, y) {
        // BFS for match-3
        const color = this.grid[y][x];
        let visited = Array.from({length: this.gridRows}, () => Array(this.gridCols).fill(false));
        let queue = [{x, y}];
        let match = [{x, y}];
        visited[y][x] = true;
        while (queue.length > 0) {
            let {x: cx, y: cy} = queue.shift();
            for (let [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]) {
                let nx = cx + dx, ny = cy + dy;
                if (nx >= 0 && nx < this.gridCols && ny >= 0 && ny < this.gridRows && !visited[ny][nx] && this.grid[ny][nx] === color) {
                    visited[ny][nx] = true;
                    queue.push({x: nx, y: ny});
                    match.push({x: nx, y: ny});
                }
            }
        }
        if (match.length >= 3) {
            for (let m of match)
                this.grid[m.y][m.x] = null;

            this.RemoveFloatingBubbles();

            this.score += match.length * 10;
            this.scoreLabel.text = "Score: " + this.score;
        }
    }

    RemoveFloatingBubbles() {
        // 1. Mark all bubbles connected to the top
        let visited = Array.from({length: this.gridRows}, () => Array(this.gridCols).fill(false));
        let queue = [];
        for (let x = 0; x < this.gridCols; x++) {
            if (this.grid[0][x]) {
                queue.push({x, y: 0});
                visited[0][x] = true;
            }
        }
        while (queue.length > 0) {
            let {x, y} = queue.shift();
            for (let [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]) {
                let nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < this.gridCols && ny >= 0 && ny < this.gridRows && !visited[ny][nx] && this.grid[ny][nx]) {
                    visited[ny][nx] = true;
                    queue.push({x: nx, y: ny});
                }
            }
        }
        // 2. Remove all bubbles not visited (not connected to top)
        let fallen = 0;
        for (let y = 0; y < this.gridRows; y++) {
            for (let x = 0; x < this.gridCols; x++) {
                if (this.grid[y][x] && !visited[y][x]) {
                    this.grid[y][x] = null;
                    fallen++;
                }
            }
        }
        if (fallen > 0) {
            this.score += fallen * 20; // Bonus for falling bubbles
            this.scoreLabel.text = "Score: " + this.score;
        }
    }
}

// Initialize the game
if (game === null)
    game = new PuzzleBobbleGame();