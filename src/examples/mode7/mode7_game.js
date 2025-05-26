class Mode7Game extends Game {
    constructor() {
        super();

        this.graphicAssets = {
            ground: {
                path: "./src/examples/mode7/assets/SNES - F-Zero - Mute City I.png",
                img: null
            },
            horizon: {
                path: "./src/examples/mode7/assets/horizon.png",
                img: null
            }
        };

        this.camera = new Camera(new Vector2(128, 128));
        this.bgImg = null;
        this.mode7Layer = null;
        this.angleSpeed = 0.02;
        this.moveSpeed = 2;

        this.textLabel = null;
    }

    Start() {
        this.screenWidth = 320;
        this.screenHeight = 240;

        this.mode7Layer = new Mode7Layer(this.graphicAssets.ground.img, this.camera, {
            horizon: 80,
            cameraHeight: 120,
            scale: 1,
            angle: 0,
            horizonImg: this.graphicAssets.horizon.img
        });

        this.mode7Layer.Start();

        this.textLabel = new TextLabel("Use arrow keys to move & turn, W/S to change height, A/D to strafe", new Vector2(10, 20), "10px Arial", "black", "left");
    }

    Update(deltaTime) {
        // Camera controls
        if (Input.IsKeyPressed(KEY_LEFT))
            this.mode7Layer.angle -= this.angleSpeed;
        if (Input.IsKeyPressed(KEY_RIGHT))
            this.mode7Layer.angle += this.angleSpeed;

        // Move forward/backward
        if (Input.IsKeyPressed(KEY_UP)) {
            this.camera.x += Math.cos(this.mode7Layer.angle) * this.moveSpeed;
            this.camera.y += Math.sin(this.mode7Layer.angle) * this.moveSpeed;
        }
        if (Input.IsKeyPressed(KEY_DOWN)) {
            this.camera.x -= Math.cos(this.mode7Layer.angle) * this.moveSpeed;
            this.camera.y -= Math.sin(this.mode7Layer.angle) * this.moveSpeed;
        }

        // Strafe left/right (A/D)
        if (Input.IsKeyPressed(KEY_A)) {
            this.camera.x += Math.cos(this.mode7Layer.angle - Math.PI / 2) * this.moveSpeed;
            this.camera.y += Math.sin(this.mode7Layer.angle - Math.PI / 2) * this.moveSpeed;
        }
        if (Input.IsKeyPressed(KEY_D)) {
            this.camera.x += Math.cos(this.mode7Layer.angle + Math.PI / 2) * this.moveSpeed;
            this.camera.y += Math.sin(this.mode7Layer.angle + Math.PI / 2) * this.moveSpeed;
        }

        // Camera height
        if (Input.IsKeyPressed(KEY_W))
            this.mode7Layer.cameraHeight += 2;
        if (Input.IsKeyPressed(KEY_S))
            this.mode7Layer.cameraHeight -= 2;
    }

    Draw(ctx) {
        this.mode7Layer.Draw(ctx);

        this.textLabel.Draw(ctx);
    }
}

class Mode7Layer {
    constructor(img, camera, options = {}) {
        this.img = img;
        this.camera = camera;
        this.horizon = options.horizon || 120;
        this.cameraHeight = options.cameraHeight || 120;
        this.scale = options.scale || 1;
        this.angle = options.angle || 0;
        this.horizonImg = options.horizonImg || null;
        
        this.offscreenCanvas = null;
        this.offscreenCtx = null;
        this.imgData = null;

        this.enabled = false;
    }

    Start() {
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = this.img.width;
        this.offscreenCanvas.height = this.img.height;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
        this.offscreenCtx.drawImage(this.img, 0, 0);
        this.imgData = this.offscreenCtx.getImageData(0, 0, this.img.width, this.img.height).data;

        this.enabled = true;
    }

    Update(deltaTime) {
        
    }

    Draw(ctx) {
        this.DrawHorizon(ctx, this.horizonImg, this.angle);

        if (!this.enabled || !this.img.complete) return;

        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const img = this.img;
        const groundHeight = height - this.horizon;

        // Create output ImageData
        let output = ctx.createImageData(width, groundHeight);
        let data = output.data;

        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);

        // pixel by pixel rendering: super slow
        // for (let screenY = this.horizon; screenY < height; screenY++) {
        //     const perspective = this.cameraHeight / (screenY - this.horizon + 1);

        //     const dx = -sin * perspective * this.scale;
        //     const dy =  cos * perspective * this.scale;

        //     let worldX = this.camera.x + (cos * perspective * this.scale * (width / 2)) - (dx * width / 2);
        //     let worldY = this.camera.y + (sin * perspective * this.scale * (width / 2)) - (dy * width / 2);

        //     for (let screenX = 0; screenX < width; screenX++) {
        //         const texX = ((Math.floor(worldX) % img.width) + img.width) % img.width;
        //         const texY = ((Math.floor(worldY) % img.height) + img.height) % img.height;

        //         ctx.drawImage(
        //             img,
        //             texX, texY, 1, 1,
        //             screenX, screenY, 1, 1
        //         );

        //         worldX += dx;
        //         worldY += dy;
        //     }
        // }

        // alt: rendering using offscreen canvas
        for (let screenY = 0; screenY < groundHeight; screenY++) {
            const y = screenY + this.horizon;
            const perspective = this.cameraHeight / (y - this.horizon + 1);

            const dx = -sin * perspective * this.scale;
            const dy =  cos * perspective * this.scale;

            let worldX = this.camera.x + (cos * perspective * this.scale * (width / 2)) - (dx * width / 2);
            let worldY = this.camera.y + (sin * perspective * this.scale * (width / 2)) - (dy * width / 2);

            for (let screenX = 0; screenX < width; screenX++) {
                const texX = ((Math.floor(worldX) % img.width) + img.width) % img.width;
                const texY = ((Math.floor(worldY) % img.height) + img.height) % img.height;

                const idx = (Math.floor(texY) * img.width + Math.floor(texX)) * 4;
                const outIdx = (screenY * width + screenX) * 4;

                data[outIdx]     = this.imgData[idx];
                data[outIdx + 1] = this.imgData[idx + 1];
                data[outIdx + 2] = this.imgData[idx + 2];
                data[outIdx + 3] = 255;

                worldX += dx;
                worldY += dy;
            }
        }

        ctx.putImageData(output, 0, this.horizon);
    }

    DrawHorizon(ctx, horizonImg, angle) {
        if (!horizonImg || !horizonImg.complete) return;

        const width = ctx.canvas.width;
        const height = this.horizon; // Height of the horizon area
        const imgWidth = horizonImg.width;
        const imgHeight = horizonImg.height;

        // Calculate horizontal offset based on angle
        // One full rotation (2*PI) pans the entire image once
        let offset = (angle / (2 * Math.PI)) * imgWidth;
        offset = ((offset % imgWidth) + imgWidth) % imgWidth; // Ensure positive wrap

        // Draw the horizon image twice for seamless wrapping
        ctx.drawImage(horizonImg, offset, 0, imgWidth - offset, imgHeight, 0, 0, width * (1 - offset / imgWidth), height);
        ctx.drawImage(horizonImg, 0, 0, offset, imgHeight, width * (1 - offset / imgWidth), 0, width * (offset / imgWidth), height);
    }
}

// initialize the game
if (game === null)
    game = new Mode7Game();