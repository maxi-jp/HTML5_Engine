const TetrisGameState = {
    MainMenu: 0,
    Pause: 1,
    Playing: 3,
    GameOver: 4
};

const tripleTSpinTest1 = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1]
];

const tripleTSpinTest2 = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1]
];

const tripleTSpinTest3 = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1]
];

class Tetris extends Game {
    constructor(renderer) {
        super(renderer);

        this.debug = false;

        this.currentState = TetrisGameState.Playing;

        this.grid = null;
        this.gridSize = { rows: 20, cols: 10 };
        this.gridPosition = { x: 220, y: 20 };
        this.squareSize = 20;

        this.initialPiecePosition = { x: 3, y: 0 };
        
        this.rotationStates = {
            'I': [
                [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
                [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
                [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
                [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]]
            ],
            'J': [
                [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
                [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
                [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
                [[0, 1, 0], [0, 1, 0], [1, 1, 0]]
            ],
            'L': [
                [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
                [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
                [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
                [[1, 1, 0], [0, 1, 0], [0, 1, 0]]
            ],
            'O': [
                [[1, 1], [1, 1]]
            ],
            'S': [
                [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
                [[0, 1, 0], [0, 1, 1], [0, 0, 1]],
                [[0, 0, 0], [0, 1, 1], [1, 1, 0]],
                [[1, 0, 0], [1, 1, 0], [0, 1, 0]]
            ],
            'T': [
                [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
                [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
                [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
                [[0, 1, 0], [1, 1, 0], [0, 1, 0]]
            ],
            'Z': [
                [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
                [[0, 0, 1], [0, 1, 1], [0, 1, 0]],
                [[0, 0, 0], [1, 1, 0], [0, 1, 1]],
                [[0, 1, 0], [1, 1, 0], [1, 0, 0]]
            ]
        };

        this.pieces = [
            { type: 'I', color: Color.cyan,   shape: this.rotationStates['I'][0] },
            { type: 'J', color: Color.blue,   shape: this.rotationStates['J'][0] },
            { type: 'L', color: Color.orange, shape: this.rotationStates['L'][0] },
            { type: 'O', color: Color.yellow, shape: this.rotationStates['O'][0] },
            { type: 'S', color: Color.lime,   shape: this.rotationStates['S'][0] },
            { type: 'T', color: Color.purple, shape: this.rotationStates['T'][0] },
            { type: 'Z', color: Color.red,    shape: this.rotationStates['Z'][0] }
        ];

        // SRS kick data for clockwise rotations. Y-axis is inverted for canvas.
        // https://tetris.fandom.com/wiki/SRS
        this.wallKickData = {
            'I': [
                [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
                [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
                [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
                [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]]
            ],
            'J': [
                [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
                [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
                [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
                [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]]
            ],
            'L': [
                [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
                [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
                [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
                [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]]
            ],
            'O': [
                [[0, 0]]
            ],
            'S': [
                [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
                [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
                [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
                [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]]
            ],
            'T': [
                [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
                [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
                [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
                [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]]
            ],
            'Z': [
                [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
                [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
                [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
                [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]]
            ]
        };
        
        this.currentPiece = null;
        this.nextPieces = [];
        this.nextPiecesCount = 6;
        this.savedPiece = null;
        this.pieceBag = []; // 7-bag randomizer

        this.comboCounter = -1;
        this.backToBackActive = false;

        // lock delay logic ("infinity") https://harddrop.com/wiki/lock_delay
        this.maxLockResets = 15;
        this.lockResets = 0;
        this.lockDelay = 0.5; // seconds before a piece locks
        this.currentLockTime = 0;
        this.isTouchingGround = false;
        
        this.lastActionWasRotation = false;
        this.lastKickIndex = -1;

        this.lastPieceSaved = false;
        this.ghostPiece = null; // preview of where the current piece is going to fall
        
        this.currentDropTime = 0; // time passed since the last drop
        this.dropTime = 0.5; // time to drop a piece in seconds

        this.minTimeToMove = 0.033; // minimum time to move a piece in milliseconds
        this.minTimeToMoveSinceLastMove = 0.25; // minimum time to repeat movement since the first key down
        this.lastTimeMoved = 0; // last time the piece was moved
        this.repeatedMovement = false;
        
        this.totalLinesCleared = 0;
        this.scoreTable = [0, 40, 100, 300, 1200];
        this.score = 0;

        // UI elements
        this.scoreLabel = null;
        this.comboLabel = null;
        this.awardsLabel = null;
        this.keysLabel = null;
        this.gameOverLavel = null;
        this.pauseLavel = null;
    }
    
    Start() {
        super.Start();
        
        this.currentState = TetrisGameState.Playing;
        this.lastTime = 0;
        this.InitializeGrid(this.gridSize.rows, this.gridSize.cols);

        // set the right pieces colors
        this.pieces.forEach(piece => {
            piece.color = Color.FromHTMLColorName(piece.color);
        });

        // Initialize the piece bag
        this.FillPieceBag();
        
        // Initialize the first piece
        this.currentPiece = this.GetNextPieceFromBag();
        this.currentPiece.position.x = this.initialPiecePosition.x;
        this.currentPiece.position.y = this.initialPiecePosition.y;
        this.ghostPiece = {
            type: this.currentPiece.type,
            color: new Color(128, 128, 128, 0.5), // semi-transparent grey
            shape: [],
            position: { x: 0, y: 0 }
        };
        this.UpdateGhostPieceAfterChange();
        
        // Initialize next pieces array
        this.nextPieces = [];
        for (let i = 0; i < this.nextPiecesCount; i++) {
            this.nextPieces.push(this.GetNextPieceFromBag());
        }
        
        this.savedPiece = null;
        this.lastPieceSaved = false;
        this.lockResets = 0;
        this.currentLockTime = 0;
        this.isTouchingGround = false;
        this.comboCounter = -1;
        this.backToBackActive = false;
        this.lastActionWasRotation = false;
        this.lastKickIndex = -1;
        
        this.totalLinesCleared = 0;
        this.score = 0;

        this.scoreLabel = new TextLabel("Score: 0", new Vector2(20, 420), "20px Comic Sans MS", Color.black, "left", "middle", false);
        this.comboLabel = new TextLabel("", new Vector2(20, 360), "18px Comic Sans MS", Color.orange, "left", "middle", false);
        this.awardsLabel = new TextLabel("", new Vector2(20, 390), "20px Comic Sans MS", Color.pink, "left", "middle", false);
        this.keysLabel = new TextLabel("Keys: A/D (move) | Z (rot ccw) | Space (rot cw) | W (fall) | Q (save)", new Vector2(20, 460), "16px Comic Sans MS", Color.grey, "left", "middle", false);
        this.gameOverLavel = new TextLabel("Game Over", new Vector2(canvas.width / 2, canvas.height / 2), "40px Comic Sans MS", Color.black, "center", "middle", false);
        this.pauseLavel = new TextLabel("PAUSE", new Vector2(canvas.width / 2, canvas.height / 2), "40px Comic Sans MS", Color.black, "center", "middle", false);

        // center the grid in the canvas
        this.gridPosition.x = Math.floor((canvas.width - this.gridSize.cols * this.squareSize) / 2);
    }

    Update(deltaTime) {
        super.Update(deltaTime);
        
        switch (this.currentState) {
            case TetrisGameState.Playing:
                if (Input.IsKeyDown(KEY_PAUSE) || Input.IsKeyDown(KEY_ESCAPE) || Input.IsGamepadButtonDown(0, "START"))
                    this.currentState = TetrisGameState.Pause;
                else {
                    this.HandleInput(deltaTime);
                    
                    // Check if piece is on the ground to handle lock delay
                    this.currentPiece.position.y++;
                    const onGround = this.CheckPieceGridCollision(this.currentPiece);
                    this.currentPiece.position.y--;

                    if (onGround) {
                        this.isTouchingGround = true;
                        this.currentLockTime += deltaTime;
                        if (this.currentLockTime >= this.lockDelay) {
                            this.LockPiece();
                        }
                    }
                    else {
                        // Piece is in the air, apply normal gravity
                        this.isTouchingGround = false;
                        this.currentLockTime = 0;
                        
                        this.currentDropTime += deltaTime;
                        if (this.currentDropTime > this.dropTime && !this.debug) {
                            this.currentPiece.position.y++;
                            this.currentDropTime = 0;
                            // A natural drop should reset lockResets
                            this.lockResets = 0;
                        }
                    }
    
                    // update the ghost piece
                    this.UpdateGhostPiece();
                }
                break;
            case TetrisGameState.Pause:
                if (Input.IsKeyDown(KEY_PAUSE) || Input.IsKeyDown(KEY_ESCAPE) || Input.IsGamepadButtonDown(0, "START"))
                    this.currentState = TetrisGameState.Playing;
                break;
            case TetrisGameState.GameOver:
                if (Input.IsKeyDown(KEY_SPACE) || Input.IsGamepadButtonDown(0, "START") || Input.IsGamepadButtonDown(0, "FACE_DOWN")) {
                    this.Start();
                }
                break;
        }

        // animate the alpha of the awardsLabel to make it desapear
        this.awardsLabel.color.a -= 1 * deltaTime;
        if (this.awardsLabel.color.a <= 0)
            this.awardsLabel.color.a = 0;
        this.comboLabel.color.a -= 1 * deltaTime;
        if (this.comboLabel.color.a <= 0)
            this.comboLabel.color.a = 0;
    }

    Draw() {
        super.Draw();

        // Draw the grid
        // Fallen pieces of the grid
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                if (this.grid[y][x] !== 0) {
                    this.renderer.DrawFillBasicRectangle(this.gridPosition.x + x * this.squareSize, this.gridPosition.y + y * this.squareSize, this.squareSize, this.squareSize, Color.grey);
                    this.renderer.DrawStrokeBasicRectangle(this.gridPosition.x + x * this.squareSize, this.gridPosition.y + y * this.squareSize, this.squareSize, this.squareSize, Color.black, 1);
                }
            }
        }

        // Draw the ghost piece
        this.DrawPiece(renderer, this.ghostPiece, this.gridPosition.x + this.ghostPiece.position.x * this.squareSize, this.gridPosition.y + this.ghostPiece.position.y * this.squareSize);

        // Draw the current piece
        this.DrawPiece(renderer, this.currentPiece, this.gridPosition.x + this.currentPiece.position.x * this.squareSize, this.gridPosition.y + this.currentPiece.position.y * this.squareSize);
        
        // Border of the grid
        this.renderer.DrawStrokeBasicRectangle(this.gridPosition.x, this.gridPosition.y, this.gridSize.cols * this.squareSize, this.gridSize.rows * this.squareSize, Color.black, 2);
        
        // Draw the next pieces
        this.renderer.DrawStrokeBasicRectangle(this.gridPosition.x + this.gridSize.cols * this.squareSize + 20, this.gridPosition.y, 6 * this.squareSize, 19 * this.squareSize, Color.black, 2);
        const xPos = this.gridPosition.x + (this.gridSize.cols + 1) * this.squareSize + 20;
        const yPos = this.gridPosition.y + 20;
        for (let i = 0; i < this.nextPieces.length; i++) {
            let currentXPos = xPos;
            let currentYPos = yPos + (i * 3 * this.squareSize);
            if (this.nextPieces[i].type === 'O')
                currentXPos += this.squareSize;
            this.DrawPiece(renderer, this.nextPieces[i], currentXPos, currentYPos);
        }

        // Draw the saved piece
        this.renderer.DrawStrokeBasicRectangle( this.gridPosition.x - 6 * this.squareSize - 20, this.gridPosition.y, 6 * this.squareSize, 4 * this.squareSize, Color.black, 2);
        if (this.savedPiece !== null) {
            this.DrawPiece(renderer, this.savedPiece, this.gridPosition.x - 6 * this.squareSize - 20, this.gridPosition.y + 20);
        }
        
        // UI
        this.awardsLabel.Draw(renderer);
        this.comboLabel.Draw(renderer);
        this.keysLabel.Draw(renderer);
        this.scoreLabel.Draw(renderer);

        if (this.currentState === TetrisGameState.GameOver) {
            this.gameOverLavel.Draw(renderer);
        }
        else if (this.currentState == TetrisGameState.Pause) {
            this.pauseLavel.Draw(renderer);
        }
    }
    
    InitializeGrid(rows, cols) {
        this.grid = [];
        while (rows--) {
            this.grid.push(new Array(cols).fill(0));
        }
        
        if (this.debug)
            this.grid = tripleTSpinTest1;
    }

    CreateRandomPiece() {
        const randomId = RandomBetweenInt(0, this.pieces.length - 1);

        return {
            type: this.pieces[randomId].type,
            color: Color.Copy(this.pieces[randomId].color),
            shape: this.pieces[randomId].shape,
            position: { x: 0, y: 0 }
        };
    }

    FillPieceBag() {
        const pieceTypes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

        // Fisher-Yates shuffle to randomize the order of pieces in the bag
        for (let i = this.pieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pieceTypes[i], pieceTypes[j]] = [pieceTypes[j], pieceTypes[i]];
        }

        this.pieceBag = pieceTypes;
    }

    GetNextPieceFromBag() {
        if (this.pieceBag.length === 0) {
            this.FillPieceBag();
        }
    
        const pieceType = this.pieceBag.pop();
        const pieceTemplate = this.pieces.find(p => p.type === pieceType);
    
        return {
            type: pieceTemplate.type,
            color: Color.Copy(pieceTemplate.color),
            shape: pieceTemplate.shape,
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

    RotatePiece(piece, direction) {
        const type = piece.type;
        const currentState = this.rotationStates[type].indexOf(piece.shape);
        const nextState = (currentState + 1) % this.rotationStates[type].length;

        return nextState;
    }

    RotateCurrentPiece(direction = 1) { // 1 clockwise, -1 counter-clockwise
        // Super Rotation System (SRS)
        // https://tetris.fandom.com/wiki/SRS
        this.lastActionWasRotation = false;
        this.lastKickIndex = -1;
        const originalPosition = { ...this.currentPiece.position };
        const originalShape = this.currentPiece.shape;
        const type = this.currentPiece.type;
        const currentState = this.rotationStates[type].indexOf(originalShape);

        if (currentState === -1) {
            console.error("Could not find current rotation state for piece", this.currentPiece);
            return;
        }

        const numStates = this.rotationStates[type].length;
        const nextState = (currentState + direction + numStates) % numStates;

        let kicks;
        if (direction === 1) { // Clockwise
            kicks = this.wallKickData[type][currentState];
        }
        else { // Counter-clockwise
            // use the kicks for the CW rotation from the target state back to the original state, and negate them
            const relevantKicks = this.wallKickData[type][nextState];
            kicks = relevantKicks.map(([dx, dy]) => [-dx, -dy]);
        }

        const newShape = this.rotationStates[type][nextState]; // get the new shape after rotation

        for (const [kickIndex, kick] of kicks.entries()) {
            const [dx, dy] = kick;
            this.currentPiece.position.x = originalPosition.x + dx;
            this.currentPiece.position.y = originalPosition.y + dy;

            // Check collision with the new position AND the new shape
            if (!this.CheckPieceGridCollision({ ...this.currentPiece, shape: newShape })) {
                this.currentPiece.shape = newShape; // Update the shape if successful
                this.lastActionWasRotation = true;
                this.lastKickIndex = kickIndex;
                if (this.isTouchingGround && this.lockResets < this.maxLockResets) {
                    this.currentLockTime = 0;
                    this.lockResets++;
                }
                this.UpdateGhostPiece(); // Update ghost piece after successful rotation
                return;
            }
        }

        // All kicks failed: revert position
        this.currentPiece.position = { ...originalPosition };
    }

    ResetPieceRotation(piece) {
        piece.shape = this.pieces.find(p => p.type === piece.type).shape;
    }

    MoveCurrentPiece(offset) {
        this.currentPiece.position.x += offset;
        if (this.CheckPieceGridCollision(this.currentPiece)) {
            this.currentPiece.position.x -= offset;
        }
        else {
            // Successful move
            this.lastActionWasRotation = false;
            if (this.isTouchingGround && this.lockResets < this.maxLockResets) {
                this.currentLockTime = 0;
                this.lockResets++;
            }
            this.UpdateGhostPiece();
        }
    }

    HandleInput(deltaTime) {
        this.lastTimeMoved += deltaTime;
        // left-right movement
        if (Input.IsKeyDown(KEY_LEFT) || Input.IsKeyDown(KEY_A) || Input.IsGamepadButtonDown(0, "DPAD_LEFT") || Input.IsGamepadButtonDown(0, "LS_LEFT")) {
            this.MoveCurrentPiece(-1);
            this.lastTimeMoved = 0;
            this.repeatedMovement = true;
        }
        if (Input.IsKeyDown(KEY_RIGHT) || Input.IsKeyDown(KEY_D) || Input.IsGamepadButtonDown(0, "DPAD_RIGHT") || Input.IsGamepadButtonDown(0, "LS_RIGHT")) {
            this.MoveCurrentPiece(1);
            this.lastTimeMoved = 0;
            this.repeatedMovement = true;
        }
        
        if (this.debug) {
            if (Input.IsKeyDown(KEY_UP) || Input.IsKeyDown(KEY_W))
                this.UnDrop();
        }

        // continuous press movement
        if (Input.IsKeyPressed(KEY_LEFT) || Input.IsKeyPressed(KEY_A) || Input.IsGamepadButtonPressed(0, "DPAD_LEFT") || Input.IsGamepadButtonPressed(0, "LS_LEFT")) {
            if ((this.repeatedMovement && this.lastTimeMoved > this.minTimeToMoveSinceLastMove) || (!this.repeatedMovement && this.lastTimeMoved > this.minTimeToMove)) {
                this.MoveCurrentPiece(-1);
                this.lastTimeMoved = 0;
                this.repeatedMovement = false;
            }
        }
        if (Input.IsKeyPressed(KEY_RIGHT) || Input.IsKeyPressed(KEY_D) || Input.IsGamepadButtonPressed(0, "DPAD_RIGHT") || Input.IsGamepadButtonPressed(0, "LS_RIGHT")) {
            if ((this.repeatedMovement && this.lastTimeMoved > this.minTimeToMoveSinceLastMove) || (!this.repeatedMovement && this.lastTimeMoved > this.minTimeToMove)) {
                this.MoveCurrentPiece(1);
                this.lastTimeMoved = 0;
                this.repeatedMovement = false;
            }
        }

        // drop movement
        if ((Input.IsKeyPressed(KEY_DOWN) || Input.IsKeyPressed(KEY_S) || Input.IsGamepadButtonPressed(0, "DPAD_DOWN") || Input.IsGamepadButtonPressed(0, "LS_DOWN")) && this.lastTimeMoved > this.minTimeToMove && !this.isTouchingGround) {
            this.SoftDrop();
            this.lastTimeMoved = 0;
        }

        // rotate
        if (Input.IsKeyDown(KEY_SPACE) || Input.IsMouseDown() || Input.IsGamepadButtonDown(0, "FACE_DOWN")) {
            this.RotateCurrentPiece(1); // Clockwise
        }
        if (Input.IsKeyDown(KEY_Z) || Input.IsGamepadButtonDown(0, "FACE_RIGHT")) {
            this.RotateCurrentPiece(-1); // Counter-clockwise
        }

        // Save the current piece
        if ((Input.IsKeyPressed(KEY_Q) || Input.IsGamepadButtonPressed(0, "LB") || Input.IsGamepadButtonPressed(0, "RT")) && !this.lastPieceSaved) {
            if (this.savedPiece === null) {
                this.savedPiece = this.currentPiece;
                this.currentPiece = this.nextPieces.shift();
                this.nextPieces.push(this.GetNextPieceFromBag());
                this.UpdateGhostPieceAfterChange();
            }
            else {
                const temp = this.currentPiece;
                this.currentPiece = this.savedPiece;
                this.savedPiece = temp;
                this.UpdateGhostPieceAfterChange();
            }
            this.currentPiece.position.x = this.initialPiecePosition.x;
            this.currentPiece.position.y = this.initialPiecePosition.y;

            this.ResetPieceRotation(this.savedPiece);

            this.currentDropTime = 0;
            this.lastPieceSaved = true;
            this.lastActionWasRotation = false;
            this.lastKickIndex = -1;
        }

        // Full fall
        if (Input.IsKeyDown(KEY_W) || Input.IsGamepadButtonDown(0, "DPAD_UP") || Input.IsGamepadButtonDown(0, "LS_UP")) {
            this.FullFall();
        }
    }

    Drop() {
        // unused function, drop is now performed in the SoftDrop method using lock delay
        this.currentPiece.position.y++;
        if (this.CheckPieceGridCollision(this.currentPiece)) {
            this.currentPiece.position.y--;
            this.MergePieceIntoGrid(this.currentPiece);
            this.CheckAndClearLines();

            this.currentPiece = this.nextPieces.shift();
            this.currentPiece.position.x = this.initialPiecePosition.x;
            this.currentPiece.position.y = this.initialPiecePosition.y;
            this.UpdateGhostPieceAfterChange();

            if (this.CheckPieceGridCollision(this.currentPiece)) {
                // check for game over
                this.currentState = TetrisGameState.GameOver;
            }
            else {
                this.nextPieces.push(this.GetNextPieceFromBag());
                this.lastPieceSaved = false;
            }
        }
        this.currentDropTime = 0;
    }

    SoftDrop() {
        this.lastActionWasRotation = false;
        this.currentPiece.position.y++;
        if (this.CheckPieceGridCollision(this.currentPiece)) {
            this.currentPiece.position.y--;
            // Piece is on the ground, lock delay will handle it
        }
        else {
            // Successful soft drop, award points and reset gravity timer
            this.score += 1; // 1 point per cell
            this.scoreLabel.text = `Score: ${this.score}`;
            this.currentDropTime = 0;
        }
    }

    LockPiece() {
        let isTSpin = false;
        if (this.currentPiece.type === 'T' && this.lastActionWasRotation) {
            isTSpin = this.CheckForTSpin();
        }

        this.MergePieceIntoGrid(this.currentPiece);
        const linesCleared = this.CheckAndClearLines();

        let isB2B = false;
        // A difficult clear is a T-Spin (that clears lines) or a Tetris.
        const isDifficultClear = (linesCleared === 4 || (isTSpin && linesCleared > 0));

        if (linesCleared > 0) {
            this.comboCounter++;
            if (isDifficultClear) {
                if (this.backToBackActive) {
                    isB2B = true;
                }
                this.backToBackActive = true;
            }
            else {
                this.backToBackActive = false;
            }
        }
        else if (!isTSpin) { // A T-Spin with 0 lines cleared does not break combo/B2B
            this.comboCounter = -1;
        }

        const isPerfectClear = (linesCleared > 0) && this.CheckForPerfectClear();
        this.totalLinesCleared += linesCleared;
        this.UpdateScore(linesCleared, isTSpin, isB2B, this.comboCounter, isPerfectClear);

        this.currentPiece = this.nextPieces.shift();
        this.currentPiece.position.x = this.initialPiecePosition.x;
        this.currentPiece.position.y = this.initialPiecePosition.y;
        this.UpdateGhostPieceAfterChange();

        if (this.CheckPieceGridCollision(this.currentPiece)) {
            // check for game over
            this.currentState = TetrisGameState.GameOver;
        }
        else {
            this.nextPieces.push(this.GetNextPieceFromBag());
            this.lastPieceSaved = false;
        }

        // Reset timers and flags for the new piece
        this.currentDropTime = 0;
        this.currentLockTime = 0;
        this.lockResets = 0;
        this.isTouchingGround = false;
        // Note: comboCounter and backToBackActive are intentionally NOT reset here.
        // They are managed based on line clear events.
        this.lastActionWasRotation = false;
        this.lastKickIndex = -1;
    }

    UnDrop() {
        // debug function to undo the last drop
        if (this.currentPiece.position.y > 0)
            this.currentPiece.position.y--;
    }

    CheckForTSpin() {
        const pos = this.currentPiece.position;

        // The four corners of the T-piece's 3x3 bounding box
        const corners = [
            { x: pos.x,     y: pos.y },     // Top-left
            { x: pos.x + 2, y: pos.y },     // Top-right
            { x: pos.x,     y: pos.y + 2 }, // Bottom-left
            { x: pos.x + 2, y: pos.y + 2 }  // Bottom-right
        ];

        let cornersOccupied = 0;
        for (const corner of corners) {
            // A corner is occupied if it's outside the grid or if the grid cell is not empty
            if (corner.x < 0 || corner.x >= this.gridSize.cols || corner.y < 0 || corner.y >= this.gridSize.rows || (this.grid[corner.y] && this.grid[corner.y][corner.x] !== 0)) {
                cornersOccupied++;
            }
        }

        // A T-Spin is confirmed if at least 3 corners are occupied.
        return cornersOccupied >= 3;
    }

    CheckForPerfectClear() {
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                if (this.grid[y][x] !== 0) {
                    return false; // block, not a perfect clear
                }
            }
        }
        return true; // No blocks found, it's a perfect clear
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

        return linesCleared;
    }

    UpdateScore(linesCleared, isTSpin = false, isB2B = false, combo = -1, isPerfectClear = false) {
        let basePoints = 0;
        let awardText = "";

        if (isTSpin) {
            switch (linesCleared) {
                case 0: basePoints = 400; awardText = "T-Spin!"; break;
                case 1: basePoints = 800; awardText = "T-Spin Single!"; break;
                case 2: basePoints = 1200; awardText = "T-Spin Double!!"; break;
                case 3: basePoints = 1600; awardText = "T-Spin Triple!!!"; break;
            }
        }
        else {
            // Regular score for line clears
            basePoints = this.scoreTable[linesCleared];
            if (linesCleared === 4) {
                awardText = "Tetris!";
            }
        }

        let totalPoints = basePoints;

        // Back-to-Back Bonus (1.5x multiplier)
        if (isB2B) {
            totalPoints = Math.floor(basePoints * 1.5);
            awardText = "B2B " + awardText;
        }

        // Combo Bonus
        if (combo > 0) {
            const comboPoints = 50 * combo;
            totalPoints += comboPoints;
            this.comboLabel.text = `Combo x${combo + 1}`;
            this.comboLabel.color.a = 1.0;
        }

        // Perfect Clear Bonus
        if (isPerfectClear) {
            totalPoints += 3000; // Example bonus
            awardText = "Perfect Clear!";
        }

        if (awardText) {
            this.awardsLabel.text = awardText;
            this.awardsLabel.color.a = 1.0;
        }

        this.score += totalPoints;
        this.scoreLabel.text = `Score: ${this.score}`;
    }

    DrawPiece(renderer, piece, x, y) {
        // Debug bounding box
        if (this.debug) {
            renderer.DrawStrokeBasicRectangle(x, y, this.squareSize * 4, this.squareSize * 4, Color.grey, 1);
        }

        for (let j = 0; j < piece.shape.length; j++) {
            for (let i = 0; i < piece.shape[j].length; i++) {
                if (piece.shape[j][i] !== 0) {
                    const coordX = x + i * this.squareSize;
                    const coordY = y + j * this.squareSize;

                    renderer.DrawFillBasicRectangle(coordX, coordY, this.squareSize, this.squareSize, piece.color);
                    renderer.DrawStrokeBasicRectangle(coordX, coordY, this.squareSize, this.squareSize, Color.black, 1);
                }
            }
        }
    }

    FullFall() {
        const startY = this.currentPiece.position.y;
        while (!this.CheckPieceGridCollision(this.currentPiece)) {
            this.currentPiece.position.y++;
        }
        this.currentPiece.position.y--;
        const cellsDropped = this.currentPiece.position.y - startY;
        if (cellsDropped > 0) {
            this.score += cellsDropped * 2; // 2 points per cell for hard drop
        }

        this.lastActionWasRotation = false;

        this.LockPiece();
    }

    UpdateGhostPiece() {
        this.ghostPiece.shape = this.currentPiece.shape;
        this.ghostPiece.position = { ...this.currentPiece.position };

        while (!this.CheckPieceGridCollision(this.ghostPiece)) {
            this.ghostPiece.position.y++;
        }
        this.ghostPiece.position.y--;
    }

    UpdateGhostPieceAfterChange() {
        this.ghostPiece.type = this.currentPiece.type;
        this.ghostPiece.color = Color.Copy(this.currentPiece.color).Desaturate(0.05);
        this.ghostPiece.color.a = 0.5;
    }
}
