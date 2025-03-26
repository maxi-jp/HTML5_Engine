class Node {
    constructor(id, position, mainNode=false, pill=0) {
        this.id = id;
        this.position = position;
        this.mainNode = mainNode;
        this.neighbors = [];
        this.pill = pill; // 0: no pill, 1: pill, 2: power pellet
    }

    AddNeighbor(node, dir) {
        this.neighbors[dir] = node;
    }

    Up() {
        return this.neighbors[0];
    }
    Right() {
        return this.neighbors[1];
    }
    Down() {
        return this.neighbors[2];
    }
    Left() {
        return this.neighbors[3];
    }
}

class Graph {
    constructor(nodeSize) {
        this.nodes = [];
        this.nodeSize = nodeSize;

        this.mainNodes = [];
    }

    InitializeMainNodes(width, height) {
        for (let y = 0; y < height; y++) {
            this.mainNodes[y] = [];
            for (let x = 0; x < width; x++) {
                this.mainNodes[y][x] = null;
            }
        }
    }

    AddNode(node) {
        this.nodes.push(node);
    }

    AddMainNode(node, x, y) {
        this.mainNodes[y][x] = node;
    }

    FindNodeById(nodeId) {
        return this.nodes.find(node => node.id === nodeId);
    }

    FindNodeByPosition(position) {
        return this.nodes.find(node => node.position.x === position.x && node.position.y === position.y);
    }
    
    GetNeighborNode(currentNode, direction) {
        return currentNode.neighbors[direction];
    }

    Draw(ctx) {
        const initX = 4 + game.mazePosition.x;
        const initY = 4 + game.mazePosition.y;
        // Draw connections
        /*for (const node of this.nodes) {
            for (const neighbor of node.neighbors) {
                DrawSegment(ctx, initX + node.position.x * this.nodeSize, initY + node.position.y * this.nodeSize, initX + neighbor.position.x * this.nodeSize, initY + neighbor.position.y * this.nodeSize, "blue");
            }
        }*/

        // Draw nodes
        for (const node of this.nodes) {
            //DrawFillCircle(ctx, initX + node.position.x * this.nodeSize, initY + node.position.y * this.nodeSize, 1, "red");
            DrawFillRectangle(ctx, initX + node.position.x * this.nodeSize - 1, initY + node.position.y * this.nodeSize - 1, 1, 1, "red");
        }

        // Draw main nodes
        for (let y = 0; y < this.mainNodes.length; y++) {
            for (let x = 0; x < this.mainNodes[y].length; x++) {
                if (this.mainNodes[y][x]) {
                    DrawFillCircle(ctx, 260 + this.mainNodes[y][x].position.x * this.nodeSize, 4 + this.mainNodes[y][x].position.y * this.nodeSize, 2, "green");
                    //DrawFillRectangle(ctx, initX + this.mainNodes[y][x].position.x * this.nodeSize - 1, initY + this.mainNodes[y][x].position.y * this.nodeSize - 1, 1, 1, "green");
                }
            }
        }
    }
}

class PacMon extends Game {
    constructor() {
        super();
        this.graphicAssets = {
            spritesheet: {
                path: "src/examples/pacmon/assets/pacman.png",
                img: null
            }
        };

        this.playerScore = 0;

        this.pacman = null;

        this.blinky = null;
        this.pinky = null;
        this.inky = null;
        this.clyde = null;
        this.ghosts = [];

        this.pills = [];
        this.powerPellets = [];
        
        this.background = null;

        this.nodeSize = 2; // size (in pixels) of each node of the graph (2x2 in the original game)
        this.graph = null;

        this.mazePosition = new Vector2(8, 64);
        
        drawStats = false;
    }
    
    Start() {
        super.Start();
        
        this.background = new Sprite(
            this.graphicAssets.spritesheet.img,
            //new Vector2(112, 124),
            new Vector2(112 + this.mazePosition.x, 124 + this.mazePosition.y),
            0,
            1,
        );
        this.dummyBackground = new Sprite(
            this.graphicAssets.spritesheet.img,
            new Vector2(112 + this.mazePosition.x, 124 + this.mazePosition.y),
            0,
            1,
        );
        
        this.graph = new Graph(this.nodeSize);
        this.BuildGraph();

        this.pacman = new Pacman(this.graphicAssets.spritesheet.img, this.graph, 3, this.mazePosition);

        /*this.blinky = new Ghost(
            new Vector2(200, 200),
            0,
            1,
            this.graphicAssets["spritesheet"].img,
            32,
            32,
            4,
            [0.1, 0.1, 0.1, 0.1]
        );
        this.pinky = new Ghost(
            new Vector2(250, 200),
            0,
            1,
            this.graphicAssets["spritesheet"].img,
            32,
            32,
            4,
            [0.1, 0.1, 0.1, 0.1]
        );
        this.inky = new Ghost(
            new Vector2(300, 200),
            0,
            1,
            this.graphicAssets["spritesheet"].img,
            32,
            32,
            4,
            [0.1, 0.1, 0.1, 0.1]
        );
        this.clyde = new Ghost(
            new Vector2(350, 200),
            0,
            1,
            this.graphicAssets["spritesheet"].img,
            32,
            32,
            4,
            [0.1, 0.1, 0.1, 0.1]
        );

        this.ghosts.push(this.blinky);
        this.ghosts.push(this.pinky);
        this.ghosts.push(this.inky);
        this.ghosts.push(this.clyde);
        
        this.gameObjects.push(this.blinky);
        this.gameObjects.push(this.pinky);
        this.gameObjects.push(this.inky);
        this.gameObjects.push(this.clyde);*/
        
        
        this.gameObjects.push(this.pacman);
        this.pacman.Start();
    }
    
    BuildGraph() {
        const mazeLayout = PacMonData.level1Maze;
        const nodesPerTile = 4;
        const pixelsPerTile = nodesPerTile * this.nodeSize;

        this.graph.InitializeMainNodes(mazeLayout[0].length, mazeLayout.length);

        let nodeId = 0;
        for (let y = 0; y < mazeLayout.length; y++) {
            for (let x = 0; x < mazeLayout[y].length; x++) {
                if (mazeLayout[y][x] > 0) {
                    // add the main node (left-down corner of the tile)
                    const node = new Node(nodeId++, new Vector2(x * nodesPerTile, y * nodesPerTile), true, mazeLayout[y][x]);
                    this.graph.AddNode(node);

                    this.graph.AddMainNode(node, x, y);

                    // create pills and power pellets
                    if (mazeLayout[y][x] == 2) {
                        const pill = new Pill(node, new Vector2(x * pixelsPerTile + 4 + this.mazePosition.x, y * pixelsPerTile + 4 + this.mazePosition.y), this.graphicAssets.spritesheet.img);
                        this.gameObjects.push(pill);
                        this.pills.push(pill);
                    }
                    else if (mazeLayout[y][x] == 3) {
                        const powerPellet = new PowerPellet(node, new Vector2(x * pixelsPerTile + 4 + this.mazePosition.x, y * pixelsPerTile + 4 + this.mazePosition.y), this.graphicAssets.spritesheet.img);
                        this.gameObjects.push(powerPellet);
                        this.powerPellets.push(powerPellet);
                    }


                    // build neighbors nodes
                    // path to the right, insert 3 nodes
                    if (mazeLayout[y][x + 1] > 0 || (x == mazeLayout[y].length - 1 && mazeLayout[y][0] > 0)) {
                        const node1 = new Node(nodeId++, new Vector2(x * nodesPerTile + 1, y * nodesPerTile));
                        this.graph.AddNode(node1);
                        node.AddNeighbor(node1, 1);
                        node1.AddNeighbor(node, 3);

                        const node2 = new Node(nodeId++, new Vector2(x * nodesPerTile + 2, y * nodesPerTile));
                        this.graph.AddNode(node2);
                        node1.AddNeighbor(node2, 1);
                        node2.AddNeighbor(node1, 3);

                        const node3 = new Node(nodeId++, new Vector2(x * nodesPerTile + 3, y * nodesPerTile));
                        this.graph.AddNode(node3);
                        node2.AddNeighbor(node3, 1);
                        node3.AddNeighbor(node2, 3);
                    }
                    // path up, insert 3 nodes
                    if (mazeLayout[y - 1][x] > 0) {
                        const node1 = new Node(nodeId++, new Vector2(x * nodesPerTile, y * nodesPerTile - 1));
                        this.graph.AddNode(node1);
                        node.AddNeighbor(node1, 0);
                        node1.AddNeighbor(node, 2);

                        const node2 = new Node(nodeId++, new Vector2(x * nodesPerTile, y * nodesPerTile - 2));
                        this.graph.AddNode(node2);
                        node1.AddNeighbor(node2, 0);
                        node2.AddNeighbor(node1, 2);

                        const node3 = new Node(nodeId++, new Vector2(x * nodesPerTile, y * nodesPerTile - 3));
                        this.graph.AddNode(node3);
                        node2.AddNeighbor(node3, 0);
                        node3.AddNeighbor(node2, 2);

                        // conect node 3 with the one of the tile above
                        const upperNode = this.graph.mainNodes[y - 1][x];
                        //const upperNode = this.graph.FindNodeByPosition(new Vector2(x * nodesPerTile, y * nodesPerTile - 4));
                        if (upperNode) {
                            node3.AddNeighbor(upperNode, 0);
                            upperNode.AddNeighbor(node3, 2);
                        }
                        else  {
                            console.warn(`Error building the node graph: upper node not found for node ${node3.id}`);
                        }
                    }

                    // connect the current node with the one of the tile to the left
                    const leftNode = this.graph.mainNodes[y][x - 1]?.Right()?.Right().Right();
                    //const leftNode = this.graph.FindNodeByPosition(new Vector2(x * nodesPerTile - 1, y * nodesPerTile));
                    if (leftNode) {
                        node.AddNeighbor(leftNode, 3);
                        leftNode.AddNeighbor(node, 1);
                    }

                    // connect right-left teleport
                    if (x == mazeLayout[y].length - 1) {
                        const rightLeftNode = this.graph.mainNodes[y][0];
                        if (rightLeftNode) {
                            const rightNode = node.Right().Right().Right()
                            rightNode.AddNeighbor(rightLeftNode, 1);
                            rightLeftNode.AddNeighbor(rightNode, 3);
                        }
                    }
                }
            }
        }
    }

    Update(deltaTime) {
        super.Update(deltaTime);

        // check Pacman pills collision
        for (let i = 0; i < this.pills.length; i++) {
            if (this.pacman.currentNode == this.pills[i].node) {
                this.playerScore += this.pills[i].score;
                this.gameObjects.splice(this.gameObjects.indexOf(this.pills[i]), 1);
                this.pills.splice(i, 1);
                i--;
            }
        }
        // Pacman - power pellets collision
        for (let i = 0; i < this.powerPellets.length; i++) {
            if (this.pacman.currentNode == this.powerPellets[i].node) {
                this.playerScore += this.powerPellets[i].score;
                this.gameObjects.splice(this.gameObjects.indexOf(this.powerPellets[i]), 1);
                this.powerPellets.splice(i, 1);
                i--;
            }
        }
    }

    MoveGhosts(deltaTime) {
        for (const ghost of this.ghosts) {
            // TODO: implement pathfinding logic
        }
    }

    Draw(ctx) {
        DrawFillRectangle(ctx, 0, 0, 800, 600, "black");

        //this.dummyBackground.DrawSection(ctx, 0, 0, 224, 248);
        this.background.DrawSection(ctx, 228, 0, 224, 248);

        // Draw the game objects
        super.Draw(ctx);

        // Draw the graph for visualization
        this.graph.Draw(ctx);
    }
}

class Pacman extends SSAnimationObjectComplex {
    constructor(img, mazeGraph, initialNodeId, mazePosition) {
        const initialNode = mazeGraph.FindNodeById(initialNodeId);

        super(
            new Vector2(4 + initialNode.position.x * mazeGraph.nodeSize + mazePosition.x, 4 + initialNode.position.y * mazeGraph.nodeSize + mazePosition.y),
            0,
            1,
            img,
            [ [new Rect(454, 0, 16, 16), new Rect(470, 0, 16, 16), new Rect(486, 0, 16, 16)] ],
            [0.1]
        );

        this.mazeGraph = mazeGraph;

        this.currentNode = initialNode;
        this.mazePosition = mazePosition;

        this.speed = 0.02; // time (in seconds) to move from one node to another
        this.currentTimeStep = this.speed;

        this.direction = 4; // current movement direction
        this.nextDirection = 4; // direction to switch to when possible
    }

    Start() {
        super.Start();

        this.direction = 1;
    }

    Update(deltaTime) {
        super.Update(deltaTime);

        // Handle player input
        this.HandleInput();

        this.currentTimeStep -= deltaTime;
        if (this.currentTimeStep <= 0) {
            this.currentTimeStep = this.speed;

            let nextNode = null;

            if (this.nextDirection != 4) {
                // player has set the next direction
                nextNode = this.mazeGraph.GetNeighborNode(this.currentNode, this.nextDirection);
                if (nextNode) {
                    this.direction = this.nextDirection;
                    this.scale.x = this.direction == 1 ? 1 : -1;
                    this.rotation = this.direction == 0 ? PIH : this.direction == 2 ? -PIH : 0;
                }
            }
            
            if (this.direction != 4) {
                if (this.currentNode.id == 615)
                    console.log(this.currentNode.id);
                // move Pacman in the current direction
                nextNode = this.mazeGraph.GetNeighborNode(this.currentNode, this.direction);
                if (nextNode) {
                    this.currentNode = nextNode; // Update currentNode
                    this.position.Set(4 + this.currentNode.position.x * this.mazeGraph.nodeSize + this.mazePosition.x, 4 + this.currentNode.position.y * this.mazeGraph.nodeSize + this.mazePosition.y);
                }
                else {
                    // stop movement if no valid next node exists
                    //this.direction = 4;
                }
            }
        }
    }

    HandleInput() {
        //this.nextDirection = 4;

        if (Input.IsKeyPressed(KEY_UP) || Input.IsKeyPressed(KEY_W)) {
            this.nextDirection = 0;
        }
        else if (Input.IsKeyPressed(KEY_DOWN) || Input.IsKeyPressed(KEY_S)) {
            this.nextDirection = 2;
        }
        else if (Input.IsKeyPressed(KEY_LEFT) || Input.IsKeyPressed(KEY_A)) {
            this.nextDirection = 3;
        }
        else if (Input.IsKeyPressed(KEY_RIGHT) || Input.IsKeyPressed(KEY_D)) {
            this.nextDirection = 1;
        }
    }

    Draw(ctx) {
        super.Draw(ctx);
    }
}

class Pill extends SpriteObject {
    constructor(node, position, img) {
        super(position, 0, 1, img);

        this.node = node;

        this.score = 1;
    }

    Draw(ctx) {
        super.DrawSection(ctx, 8, 8, 8, 8);
    }
}

class PowerPellet extends SpriteObject {
    constructor(node, position, img) {
        super(position, 0, 1, img);

        this.node = node;

        this.edibleTime = 10;
        this.score = 10;
    }

    Draw(ctx) {
        super.DrawSection(ctx, 8, 24, 8, 8);
    }
}

class Ghost extends SSAnimationObjectComplex {
    constructor(position, rotation, scale, img) {
        super(position, rotation, scale, img, [[new Rectangle(0, 0, 16, 16)]], []);

        this.speed = 50;
    }

    Update(deltaTime) {
        super.Update(deltaTime);
    }

    Draw(ctx) {
        super.Draw(ctx);
    }
}

if (game === null)
    game = new PacMon();