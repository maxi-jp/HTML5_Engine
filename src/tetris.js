class Tetris extends Game {
    constructor() {
        super();
        this.grid = null;
        this.gridSize = { rows: 20, cols: 10 };
        this.gridPosition = { x: 220, y: 20 };
        this.squareSize = 20;

        this.initialPiecePosition = { x: 3, y: 0 };

        this.pieces = [
            { type: 'I', color: 'red', shape: [[1, 1, 1, 1]] },
            { type: 'J', color: 'blue', shape: [[1, 0, 0], [1, 1, 1]] },
            { type: 'L', color: 'green', shape: [[0, 0, 1], [1, 1, 1]] },
            { type: 'O', color: 'yellow', shape: [[1, 1], [1, 1]] },
            { type: 'S', color: 'purple', shape: [[0, 1, 1], [1, 1, 0]] },
            { type: 'T', color: 'orange', shape: [[0, 1, 0], [1, 1, 1]] },
            { type: 'Z', color: 'cyan', shape: [[1, 1, 0], [0, 1, 1]] }
        ];
        
        this.currentPiece = null;
        this.nextPiece = null;
        
        this.currentDropTime = 0; // time passed since the last drop
        this.timeToDrop = 1; // time to drop a piece in milliseconds

        this.minTimeToMove = 0.1; // minimum time to move a piece in milliseconds
        this.lastTimeMoved = 0; // last time the piece was moved

        this.totalLinesCleared = 0;
    }
    
    Start() {
        super.Start();
        this.lastTime = 0;
        this.InitializeGrid(this.gridSize.rows, this.gridSize.cols);
        
        this.currentPiece = this.CreateRandomPiece();
        this.currentPiece.position.x = this.initialPiecePosition.x;
        this.currentPiece.position.y = this.initialPiecePosition.y;
        
        this.nextPiece = this.CreateRandomPiece();
        
        this.totalLinesCleared = 0;
        
        // center the grid in the canvas
        this.gridPosition.x = (canvas.width - this.gridSize.cols * this.squareSize) / 2;
    }

    Update(deltaTime) {
        super.Update(deltaTime);

        this.HandleInput(deltaTime);
        
        this.currentDropTime += deltaTime;
        if (this.currentDropTime > this.timeToDrop) {
            this.Drop();
        }
    }

    Draw(ctx) {
        super.Draw(ctx);

        // Draw the grid
        ctx.strokeRect(this.gridPosition.x, this.gridPosition.y, this.gridSize.cols * this.squareSize, this.gridSize.rows * this.squareSize);

        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                if (this.grid[y][x] !== 0) {
                    ctx.fillStyle = 'gray';
                    ctx.fillRect(this.gridPosition.x + x * this.squareSize, this.gridPosition.y + y * this.squareSize, this.squareSize, this.squareSize);
                    ctx.strokeRect(this.gridPosition.x + x * this.squareSize, this.gridPosition.y + y * this.squareSize, this.squareSize, this.squareSize);
                }
            }
        }
        
        // Draw the current piece
        this.DrawPiece(ctx, this.currentPiece, this.gridPosition.x + this.currentPiece.position.x * this.squareSize, this.gridPosition.y + this.currentPiece.position.y * this.squareSize);
        
        // Draw the next piece
        ctx.strokeRect(this.gridPosition.x + this.gridSize.cols * this.squareSize + 20, this.gridPosition.y, 6 * this.squareSize, 4 * this.squareSize);
        
        this.DrawPiece(ctx, this.nextPiece, this.gridPosition.x + (this.gridSize.cols + 1) * this.squareSize + 20, this.gridPosition.y + 20);
        
        // UI
        ctx.font = "40px Comic Sans MS";
        ctx.fillStyle = "black";
        ctx.textAlign = "left";
        ctx.fillText("Lines: " + this.totalLinesCleared, 20, 40);
    }
    
    InitializeGrid(rows, cols) {
        this.grid = [];
        while (rows--) {
            this.grid.push(new Array(cols).fill(0));
        }
    }

    CreateRandomPiece() {
        const randomId = RandomBetweenInt(0, this.pieces.length - 1);

        return {
            type: this.pieces[randomId].type,
            color: this.pieces[randomId].color,
            shape: this.pieces[randomId].shape,
            position: { x: 0, y: 0 }
        };
    }

    CheckPieceGridCollision(piece) {
        const [m, o] = [piece.shape, piece.position];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                    (this.grid[y + o.y] &&
                    this.grid[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    MergePieceIntoGrid(piece) {
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.grid[y + piece.position.y][x + piece.position.x] = value;
                }
            });
        });
    }

    RotatePiece(piece) {
        const rows = piece.shape.length;
        const cols = piece.shape[0].length;
        const newShape = [];

        for (let y = 0; y < cols; ++y) {
            newShape[y] = [];
            for (let x = 0; x < rows; ++x) {
                newShape[y][x] = piece.shape[rows - 1 - x][y];
            }
        }
        piece.shape = newShape;
    }

    RotateCurrentPiece() {
        const originalPosition = this.currentPiece.position.x;
        let offset = 1;
        this.RotatePiece(this.currentPiece);
        
        while (this.CheckPieceGridCollision(this.currentPiece)) {
            this.currentPiece.position.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.currentPiece.shape[0].length) {
                this.RotatePiece(this.currentPiece); // rotate back
                this.currentPiece.position.x = originalPosition;
                return;
            }
        }
    }

    MoveCurrentPiece(offset) {
        this.currentPiece.position.x += offset;
        if (this.CheckPieceGridCollision(this.currentPiece)) {
            this.currentPiece.position.x -= offset;
        }
    }

    HandleInput(deltaTime) {
        this.lastTimeMoved += deltaTime;
        // left-right movement
        if (Input.IsKeyDown(KEY_LEFT) || Input.IsKeyDown(KEY_A)) {
            this.MoveCurrentPiece(-1);
            this.lastTimeMoved = 0;
        }
        if (Input.IsKeyDown(KEY_RIGHT) || Input.IsKeyDown(KEY_D)) {
            this.MoveCurrentPiece(1);
            this.lastTimeMoved = 0;
        }
        // continous press movement
        if ((Input.IsKeyPressed(KEY_LEFT) || Input.IsKeyPressed(KEY_A)) && this.lastTimeMoved > this.minTimeToMove) {
            this.MoveCurrentPiece(-1);
            this.lastTimeMoved = 0;
        }
        if ((Input.IsKeyPressed(KEY_RIGHT) || Input.IsKeyPressed(KEY_D)) && this.lastTimeMoved > this.minTimeToMove) {
            this.MoveCurrentPiece(1);
            this.lastTimeMoved = 0;
        }

        // drop movement
        if (Input.IsKeyPressed(KEY_DOWN) || Input.IsKeyPressed(KEY_S) && this.lastTimeMoved > this.minTimeToMove) {
            this.Drop();
            this.lastTimeMoved = 0;
        }

        // rotate
        if (Input.IsKeyDown(KEY_UP) || Input.IsKeyDown(KEY_W)) {
            this.RotateCurrentPiece();
        }
    }

    Drop() {
        this.currentPiece.position.y++;
        if (this.CheckPieceGridCollision(this.currentPiece)) {
            this.currentPiece.position.y--;

            this.MergePieceIntoGrid(this.currentPiece);
            this.CheckAndClearLines();

            this.currentPiece = this.nextPiece;
            this.currentPiece.position.x = this.initialPiecePosition.x;
            this.currentPiece.position.y = this.initialPiecePosition.y;

            this.nextPiece = this.CreateRandomPiece();
        }
        this.currentDropTime = 0;
    }

    CheckAndClearLines() {
        let linesCleared = 0;
        outer: for (let y = this.grid.length - 1; y >= 0; y--) {
            for (let x = 0; x < this.grid[y].length; x++) {
                if (this.grid[y][x] === 0) {
                    continue outer;
                }
            }
            const row = this.grid.splice(y, 1)[0].fill(0);
            this.grid.unshift(row);
            linesCleared++;
            y++;
        }
        this.totalLinesCleared += linesCleared;
    }

    DrawPiece(ctx, piece, x, y) {
        ctx.strokeStyle = 'grey';
        ctx.strokeRect(x, y, this.squareSize * 4, this.squareSize * 4);

        ctx.fillStyle = piece.color;
        ctx.strokeStyle = 'black';

        for (let j = 0; j < piece.shape.length; j++) {
            for (let i = 0; i < piece.shape[j].length; i++) {
                if (piece.shape[j][i] !== 0) {
                    const coordX = x + i * this.squareSize;
                    const coordY = y + j * this.squareSize;

                    ctx.fillRect(coordX, coordY, this.squareSize, this.squareSize);
                    ctx.strokeRect(coordX, coordY, this.squareSize, this.squareSize);
                }
            }
        }
    }
}

// initialize the game
if (game === null)
    game = new Tetris();