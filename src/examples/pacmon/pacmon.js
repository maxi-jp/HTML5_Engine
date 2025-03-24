class Node {
    constructor(id, position) {
        this.id = id;
        this.position = position;
        this.neighbors = [];
    }

    AddNeighbor(node) {
        this.neighbors.push(node);
    }
}

class Graph {
    constructor(nodeSize) {
        this.nodes = [];
        this.nodeSize = nodeSize;
    }

    AddNode(node) {
        this.nodes.push(node);
    }

    FindNodeById(nodeId) {
        return this.nodes.find(node => node.id === nodeId);
    }

    FindNodeByPosition(position) {
        return this.nodes.find(node => node.position.x === position.x && node.position.y === position.y);
    }
    
    GetNeighborNode(currentNode, direction) {
        return currentNode.neighbors.find(node => node.position.x === currentNode.position.x + direction.x && node.position.y === currentNode.position.y + direction.y);
    }

    Draw(ctx) {
        const initX = 4;
        const initY = 4;
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
        
        this.background = null;

        this.nodeSize = 2; // size (in pixels) of each node of the graph (2x2 in the original game)
        this.graph = null;
        
        drawStats = false;
    }
    
    Start() {
        super.Start();
        
        this.background = new Sprite(
            this.graphicAssets.spritesheet.img,
            //new Vector2(112, 124),
            new Vector2(112, 124),
            0,
            1,
        );
        this.dummyBackground = new Sprite(
            this.graphicAssets.spritesheet.img,
            new Vector2(112, 124),
            0,
            1,
        );
        
        this.graph = new Graph(this.nodeSize);
        this.BuildGraph();

        this.pacman = new Pacman(this.graphicAssets.spritesheet.img, this.graph, 3);

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
        const mazeLayout = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
            [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
            [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0],
            [0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
            [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
            [0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0],
            [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
            [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]            
        ];
        const nodesPerTile = 4;

        const directions = [
            new Vector2( 0, -1), // Up
            new Vector2( 0,  1), // Down
            new Vector2(-1,  0), // Left
            new Vector2( 1,  0)  // Right
        ];

        let nodeId = 0;
        for (let y = 0; y < mazeLayout.length; y++) {
            for (let x = 0; x < mazeLayout[y].length; x++) {
                if (mazeLayout[y][x] === 1) {
                    const node = new Node(nodeId++, new Vector2(x * nodesPerTile, y * nodesPerTile));
                    this.graph.AddNode(node);

                    // build neighbors nodes
                    // path to the right, insert 3 nodes
                    if (mazeLayout[y][x + 1] === 1) {
                        const node1 = new Node(nodeId++, new Vector2(x * nodesPerTile + 1, y * nodesPerTile));
                        this.graph.AddNode(node1);
                        node.AddNeighbor(node1);
                        node1.AddNeighbor(node);

                        const node2 = new Node(nodeId++, new Vector2(x * nodesPerTile + 2, y * nodesPerTile));
                        this.graph.AddNode(node2);
                        node1.AddNeighbor(node2);
                        node2.AddNeighbor(node1);

                        const node3 = new Node(nodeId++, new Vector2(x * nodesPerTile + 3, y * nodesPerTile));
                        this.graph.AddNode(node3);
                        node2.AddNeighbor(node3);
                        node3.AddNeighbor(node2);
                    }
                    // path up, insert 3 nodes
                    if (mazeLayout[y - 1][x] === 1) {
                        const node1 = new Node(nodeId++, new Vector2(x * nodesPerTile, y * nodesPerTile - 1));
                        this.graph.AddNode(node1);
                        node.AddNeighbor(node1);
                        node1.AddNeighbor(node);

                        const node2 = new Node(nodeId++, new Vector2(x * nodesPerTile, y * nodesPerTile - 2));
                        this.graph.AddNode(node2);
                        node1.AddNeighbor(node2);
                        node2.AddNeighbor(node1);

                        const node3 = new Node(nodeId++, new Vector2(x * nodesPerTile, y * nodesPerTile - 3));
                        this.graph.AddNode(node3);
                        node2.AddNeighbor(node3);
                        node3.AddNeighbor(node2);

                        // conect node 3 with the one of the tile above
                        const upperNode = this.graph.FindNodeByPosition(new Vector2(x * nodesPerTile, y * nodesPerTile - 4));
                        if (upperNode) {
                            node3.AddNeighbor(upperNode);
                            upperNode.AddNeighbor(node3);
                        }
                        else  {
                            console.warn(`Error building the node graph: upper node not found for node ${node3.id}`);
                        }
                    }

                    // connect the current node with the one of the tile to the left
                    const leftNode = this.graph.FindNodeByPosition(new Vector2(x * nodesPerTile - 1, y * nodesPerTile));
                    if (leftNode) {
                        node.AddNeighbor(leftNode);
                        leftNode.AddNeighbor(node);
                    }

                    // connect right-left teleport
                    if (x == mazeLayout[y].length - 1) {
                        const rightNode = this.graph.FindNodeByPosition(new Vector2(0, y * nodesPerTile));
                        if (rightNode) {
                            node.AddNeighbor(rightNode);
                            rightNode.AddNeighbor(node);
                        }
                    }
                }
            }
        }
    }

    Update(deltaTime) {
        super.Update(deltaTime);
    }

    MoveGhosts(deltaTime) {
        for (const ghost of this.ghosts) {
            // TODO: implement pathfinding logic
        }
    }

    Draw(ctx) {
        DrawFillRectangle(ctx, 0, 0, 800, 600, "black");

        this.dummyBackground.DrawSection(ctx, 0, 0, 224, 248);
        //this.background.DrawSection(ctx, 228, 0, 224, 248);

        // Draw the graph for visualization
        this.graph.Draw(ctx);

        // Draw the game objects
        super.Draw(ctx);
    }
}

class Pacman extends SpriteObject {
    constructor(img, mazeGraph, initialNodeId) {
        const initialNode = mazeGraph.FindNodeById(initialNodeId);

        super(new Vector2(4 + initialNode.position.x * mazeGraph.nodeSize, 4 + initialNode.position.y * mazeGraph.nodeSize), 0, 1, img);

        this.mazeGraph = mazeGraph;

        this.currentNode = initialNode;

        this.speed = 0.02; // time (in seconds) to move from one node to another
        this.currentTimeStep = this.speed;

        this.direction = Vector2.Zero(); // current movement direction
        this.nextDirection = Vector2.Zero(); // direction to switch to when possible
    }

    Start() {
        this.direction.Set(1, 0);
    }

    Update(deltaTime) {
        // Handle player input
        this.HandleInput();

        this.currentTimeStep -= deltaTime;
        if (this.currentTimeStep <= 0) {
            this.currentTimeStep = this.speed;

            let nextNode = null;

            if (!this.nextDirection.IsZero()) {
                // player has set the next direction
                nextNode = this.mazeGraph.GetNeighborNode(this.currentNode, this.nextDirection);
                if (nextNode) {
                    this.direction.Set(this.nextDirection.x, this.nextDirection.y);
                }
            }
            
            if (!this.direction.IsZero()) {
                if (this.currentNode.id == 615)
                    console.log(this.currentNode.id);
                // move Pacman in the current direction
                nextNode = this.mazeGraph.GetNeighborNode(this.currentNode, this.direction);
                if (nextNode) {
                    this.currentNode = nextNode; // Update currentNode
                    this.position.Set(4 + this.currentNode.position.x * this.mazeGraph.nodeSize, 4 + this.currentNode.position.y * this.mazeGraph.nodeSize);
                }
                else {
                    // stop movement if no valid next node exists
                    //this.direction.Set(0, 0);
                }
            }
        }
    }

    HandleInput() {
        this.nextDirection.Set(0, 0);

        if (Input.IsKeyPressed(KEY_UP) || Input.IsKeyPressed(KEY_W)) {
            this.nextDirection.Set(0, -1);
        }
        else if (Input.IsKeyPressed(KEY_DOWN) || Input.IsKeyPressed(KEY_S)) {
            this.nextDirection.Set(0, 1);
        }
        else if (Input.IsKeyPressed(KEY_LEFT) || Input.IsKeyPressed(KEY_A)) {
            this.nextDirection.Set(-1, 0);
        }
        else if (Input.IsKeyPressed(KEY_RIGHT) || Input.IsKeyPressed(KEY_D)) {
            this.nextDirection.Set(1, 0);
        }
    }

    Draw(ctx) {
        super.DrawSection(ctx, 456, 0, 16, 16);
    }
}

class Ghost extends SSAnimationObject {
    constructor(position, rotation, scale, img, frameWidth, frameHeight, frameCount, framesDuration) {
        super(position, rotation, scale, img, frameWidth, frameHeight, frameCount, framesDuration);

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