class ColumnsGame extends Game {
    constructor(renderer) {
        super(renderer);

        this.graphicAssets = {
            snake: {
                path: "src/examples/common_assets/snake.png",
                img: null
            }
        };
        
        this.gridCols = 6;
        this.gridRows = 13;
        this.cellSize = 32;
        this.gridOffset = { x: 120, y: 32 };

        this.colors = [Color.red, Color.blue, Color.yellow, Color.green, Color.purple, Color.cyan];
        this.grid = [];
        this.falling = null; // {blocks: [{x,y,color}], pos: {x,y}, state: "falling"/"landed"}
        this.fallTimer = 0;
        this.fallInterval = 0.5;
        this.gameOver = false;
        this.score = 0;
        this.scoreLabel = null;
    }

    Start() {
        super.Start();
        this.grid = [];
        for (let y = 0; y < this.gridRows; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridCols; x++) {
                this.grid[y][x] = null;
            }
        }
        this.falling = null;
        this.fallTimer = 0;
        this.gameOver = false;
        this.score = 0;
        this.scoreLabel = new TextLabel("Score: 0", new Vector2(20, 20), "20px Comic Sans MS", Color.black, "left", "middle", false);
        this.SpawnColumn();
    }

    Update(deltaTime) {
        super.Update(deltaTime);
        if (this.gameOver) return;

        // Input
        if (this.falling) {
            if (Input.IsKeyDown(KEY_LEFT)) this.TryMove(-1);
            if (Input.IsKeyDown(KEY_RIGHT)) this.TryMove(1);
            if (Input.IsKeyDown(KEY_UP)) this.RotateColumn();
            if (Input.IsKeyDown(KEY_DOWN)) this.fallTimer += this.fallInterval * 0.5; // Fast drop
        }

        this.fallTimer += deltaTime;
        if (this.fallTimer >= this.fallInterval) {
            this.fallTimer = 0;
            if (this.falling) {
                if (!this.TryFall()) {
                    this.MergeColumn();
                    this.ClearMatches();
                    this.SpawnColumn();
                }
            }
        }
    }

    TryMove(dx) {
        if (!this.falling) return;
        for (let i = 0; i < 3; i++) {
            let bx = this.falling.pos.x + dx;
            let by = this.falling.pos.y - i;
            if (bx < 0 || bx >= this.gridCols || (by >= 0 && this.grid[by][bx])) return;
        }
        this.falling.pos.x += dx;
    }

    RotateColumn() {
        if (!this.falling) return;
        // Rotate colors in the falling column
        const c = this.falling.colors;
        this.falling.colors = [c[2], c[0], c[1]];
    }

    TryFall() {
        if (!this.falling) return false;
        for (let i = 0; i < 3; i++) {
            let bx = this.falling.pos.x;
            let by = this.falling.pos.y - i + 1;
            if (by >= this.gridRows || (by >= 0 && this.grid[by][bx])) return false;
        }
        this.falling.pos.y += 1;
        return true;
    }

    MergeColumn() {
        for (let i = 0; i < 3; i++) {
            let bx = this.falling.pos.x;
            let by = this.falling.pos.y - i;
            if (by < 0) {
                this.gameOver = true;
                this.scoreLabel.text = "Game Over! Score: " + this.score;
                return;
            }
            this.grid[by][bx] = this.falling.colors[i];
        }
        this.falling = null;
    }

    ClearMatches() {
        let matched = [];
        // Find matches of 3 or more in all directions
        for (let y = 0; y < this.gridRows; y++) {
            for (let x = 0; x < this.gridCols; x++) {
                let color = this.grid[y][x];
                if (!color) continue;
                // Directions: right, down, diag down-right, diag down-left
                const dirs = [
                    {dx:1, dy:0}, {dx:0, dy:1}, {dx:1, dy:1}, {dx:-1, dy:1}
                ];
                for (let d = 0; d < dirs.length; d++) {
                    let chain = [{x, y}];
                    for (let k = 1; k < 5; k++) {
                        let nx = x + dirs[d].dx * k;
                        let ny = y + dirs[d].dy * k;
                        if (nx < 0 || nx >= this.gridCols || ny < 0 || ny >= this.gridRows) break;
                        if (this.grid[ny][nx] === color) chain.push({x:nx, y:ny});
                        else break;
                    }
                    if (chain.length >= 3) matched.push(...chain);
                }
            }
        }
        // Remove duplicates
        matched = matched.filter((v,i,a) => a.findIndex(t=>(t.x===v.x&&t.y===v.y))===i);
        if (matched.length > 0) {
            matched.forEach(cell => this.grid[cell.y][cell.x] = null);
            this.score += matched.length * 10;
            this.scoreLabel.text = "Score: " + this.score;
            this.Gravity();
            // Recursively clear more matches
            setTimeout(() => this.ClearMatches(), 100);
        }
    }

    Gravity() {
        for (let x = 0; x < this.gridCols; x++) {
            for (let y = this.gridRows - 1; y >= 0; y--) {
                if (!this.grid[y][x]) {
                    for (let k = y - 1; k >= 0; k--) {
                        if (this.grid[k][x]) {
                            this.grid[y][x] = this.grid[k][x];
                            this.grid[k][x] = null;
                            break;
                        }
                    }
                }
            }
        }
    }

    SpawnColumn() {
        const colors = [
            this.colors[RandomBetweenInt(0, this.colors.length-1)],
            this.colors[RandomBetweenInt(0, this.colors.length-1)],
            this.colors[RandomBetweenInt(0, this.colors.length-1)]
        ];
        this.falling = {
            pos: { x: Math.floor(this.gridCols/2), y: 2 },
            colors: colors
        };
        // Check if spawn is blocked
        for (let i = 0; i < 3; i++) {
            let bx = this.falling.pos.x;
            let by = this.falling.pos.y - i;
            if (by >= 0 && this.grid[by][bx]) {
                this.gameOver = true;
                this.scoreLabel.text = "Game Over! Score: " + this.score;
                this.falling = null;
                return;
            }
        }
    }

    Draw() {
        super.Draw();
        // Draw background
        this.renderer.DrawFillRectangle(this.gridOffset.x, this.gridOffset.y, this.gridCols * this.cellSize, this.gridRows * this.cellSize, Color.lightGrey);

        // Draw grid
        for (let y = 0; y < this.gridRows; y++) {
            for (let x = 0; x < this.gridCols; x++) {
                if (this.grid[y][x]) {
                    this.renderer.DrawFillRectangle(
                        this.gridOffset.x + x * this.cellSize + 2,
                        this.gridOffset.y + y * this.cellSize + 2,
                        this.cellSize - 4, this.cellSize - 4,
                        this.grid[y][x]
                    );
                }
                this.renderer.DrawStrokeRectangle(
                    this.gridOffset.x + x * this.cellSize,
                    this.gridOffset.y + y * this.cellSize,
                    this.cellSize, this.cellSize,
                    Color.grey
                );
            }
        }

        // Draw falling column
        if (this.falling) {
            for (let i = 0; i < 3; i++) {
                let bx = this.falling.pos.x;
                let by = this.falling.pos.y - i;
                if (by >= 0 && by < this.gridRows) {
                    this.renderer.DrawFillRectangle(
                        this.gridOffset.x + bx * this.cellSize + 2,
                        this.gridOffset.y + by * this.cellSize + 2,
                        this.cellSize - 4, this.cellSize - 4,
                        this.falling.colors[i]
                    );
                }
            }
        }

        // Draw border
        this.renderer.DrawStrokeRectangle(this.gridOffset.x, this.gridOffset.y, this.gridCols * this.cellSize, this.gridRows * this.cellSize, Color.white, 2);

        // Draw score
        this.scoreLabel.Draw(renderer);
    }
}
