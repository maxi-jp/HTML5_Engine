
var canvas = /** @type {HTMLCanvasElement} */(null);
var ctx = /** @type {CanvasRenderingContext2D} */(null);
var requestAnimationFrameID = -1;

var targetDT = 1/60; // 60fps
var globalDT;
var time = 0,
    fps = 0,
    framesAcum = 0,
    acumDelta = 0;

// background gradient
let bgGrad;

var graphicAssets = {
    /*bigboss: {
        path: "assets/bigboss.jpg",
        img: null
    }*/
};

function LoadImages(assets, onloaded) {
    if (Object.keys(assets).length === 0)
        onloaded();
    
    let imagesToLoad = 0;
    
    const onload = () => --imagesToLoad === 0 && onloaded();
	
	// const onload = function() {
    //     --imagesToLoad;
    //     if (imagesToLoad === 0) {
    //         onloaded();
    //     }
    // }

    // iterate through the object of assets and load every image
    for (let asset in assets) {
        if (assets.hasOwnProperty(asset)) {
            imagesToLoad++; // one more image to load

            // create the new image and set its path and onload event
            const img = assets[asset].img = new Image;
            img.src = assets[asset].path;
            img.onload = onload;
        }
     }
    return assets;
}

function Init() {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    // input setup
    Input.SetupKeyboardEvents();
    Input.SetupMouseEvents(canvas);

    LoadImages(graphicAssets, ()=>{
        Start();
        Loop();
    });
}

function Start() {
    time = performance.now();

    // configure background gradient
    bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, "#191200");
    bgGrad.addColorStop(0.1, "#000000");
    bgGrad.addColorStop(0.35, "#07073e");
    bgGrad.addColorStop(0.95, "#22375e");
    bgGrad.addColorStop(1, "#274f98");
}

function Loop() {
    requestAnimationFrameID = requestAnimationFrame(Loop);

    // compute FPS
    let now = performance.now();
    let deltaTime = (now - time) / 1000;
    globalDT = deltaTime;

    time = now;

    framesAcum++;
    acumDelta += deltaTime;

    if (acumDelta >= 1) {
        fps = framesAcum;
        framesAcum = 0;
        acumDelta -= 1;
    }

    if (deltaTime > 1)
        return;

    // Game logic ---------
    Update(deltaTime);
    
    // Draw the game ------
    Draw(ctx);

    // reset input data ---
    Input.PostUpdate();
}

function Update(deltaTime) {
    
}

function Draw(/** @type {CanvasRenderingContext2D} */ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // background
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw the mouse position
    ctx.beginPath();
    ctx.arc(Input.mouse.x, Input.mouse.y, 5, 0, PI2, false);
    ctx.fillStyle = "red";
    ctx.closePath();
    ctx.fill();
}

function DrawStats(ctx) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(2, 2, 132, 54);

    ctx.fillStyle = "white";
    ctx.textAlign = "start";
    ctx.font = "12px Comic Sans MS regular";

    ctx.fillText("FPS: " + fps, 6, 14);
    ctx.fillText("FPS (dt): " + (1 / globalDT).toFixed(2), 6, 32);
    ctx.fillText("deltaTime (ms): " + (globalDT * 1000).toFixed(2), 6, 50);
}

window.onload = Init;
