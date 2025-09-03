
var canvas = /** @type {HTMLCanvasElement} */(null);
var requestAnimationFrameID = -1;

var renderer = null

var targetDT = 1/60; // 60fps
var globalDT;
var time = 0,
    fps = 0,
    framesAcum = 0,
    acumDelta = 0;
var totalTime = 0.0; // acumulator of the time

var drawStats = true;
var debugMode = false;

// current Game global reference
var game = null;

var audioPlayer = null;

function LoadImages(assets, onloaded) {
    if (assets === null || Object.keys(assets).length === 0)
        onloaded();
    
    let imagesToLoad = 0;
    
    // const onload = () => --imagesToLoad === 0 && onloaded();
	
    const onload = function(img) {
        img.halfWidth = img.width / 2;
        img.halfHeight = img.height / 2;
        --imagesToLoad;
        if (imagesToLoad === 0) {
            onloaded();
        }
    }

    // iterate through the object of assets and load every image
    for (let asset in assets) {
        if (assets.hasOwnProperty(asset)) {
            imagesToLoad++; // one more image to load

            // create the new image and set its path and onload event
            const img = assets[asset].img = new Image;
            img.src = assets[asset].path;
            img.onload = () => onload(img);
        }
    }
}

function Init(GameClass) {
    canvas = document.getElementById("myCanvas");

    if (window.location.search.includes("webgl")) {
        const gl = canvas.getContext("webgl2");
        if (!gl) {
            // fallback to webgl 1
            gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        }
        renderer = gl ? new WebGLRenderer(canvas, gl) : new Canvas2DRenderer(canvas);
        if (gl)
            SetupStatsHTMLElements();
    }
    else {
        renderer = new Canvas2DRenderer(canvas);
    }

    // input setup
    Input.SetupKeyboardEvents();
    Input.SetupMouseEvents(canvas);
    Input.SetupGamepadEvents();
    Input.ClearMappings();

    if (!game) {
        game = new GameClass(renderer);
    }

    LoadImages(game.graphicAssets, () => {
        console.log(`All image files loaded.`);
        
        if (game.config.audioAnalyzer) {
            audioPlayer = new AudioPlayer(true, game.config.analyzerfftSize, game.config.analyzerSmoothing);
        }
        else {
            audioPlayer = new AudioPlayer();
        }
        audioPlayer.LoadAudio(game.audioAssets, () => {
            console.log("All audio files loaded.");
            console.log("Starting the game...");
            Start();
            Loop();
        });
    });
}

function Start() {
    time = performance.now();

    game.Start();
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

    totalTime += deltaTime;

    // resume audio context if suspended
    if (Input.keyboard.anyKeyPressed || Input.mouse.pressed) {
        ResumeAudioContext();
    }
    
    // Game logic ---------
    Update(deltaTime);
    
    // Draw the game ------
    Draw();

    // reset input data ---
    Input.PostUpdate();
}

function Update(deltaTime) {
    // update the game's logic
    game.Update(deltaTime);
}

function Draw() {
    renderer.Clear();

    // draw the game
    game.Draw();

    // draw stats
    if (drawStats)
        DrawStats();
}

function DrawStats() {
    if (renderer instanceof WebGLRenderer) {
        this.statsElements.fps.innerText = `FPS: ${fps.toFixed(1)}`;
        this.statsElements.fpsdt.innerText = `FPS (dt): ${(1 / globalDT).toFixed(2)}`;
        this.statsElements.dt.innerText = `Delta: ${(globalDT * 1000).toFixed(2)} ms`;
    }
    else {
        const ctx = renderer.ctx;

        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(2, 2, 132, 54);

        ctx.fillStyle = "white";
        ctx.textAlign = "start";
        ctx.textBaseline = "bottom"
        ctx.font = "12px Comic Sans MS regular";

        ctx.fillText("FPS: " + fps, 6, 16);
        ctx.fillText("FPS (dt): " + (1 / globalDT).toFixed(2), 6, 34);
        ctx.fillText("deltaTime (ms): " + (globalDT * 1000).toFixed(2), 6, 52);
    }
}

function SetupStatsHTMLElements() {
    if (this.statsElements)
        return;

    this.statsElements = {};

    // Container
    const container = document.createElement('div');
    container.id = 'engine-stats-container';
    container.style.position = 'absolute';
    container.style.top = '8px';
    container.style.left = '8px';
    container.style.background = 'rgba(0,0,0,0.6)';
    container.style.color = '#fff';
    container.style.font = '12px monospace';
    container.style.padding = '4px 8px';
    container.style.borderRadius = '4px';
    container.style.textAlign = 'left';
    container.style.zIndex = 1000;

    // FPS
    const fpsElem = document.createElement('div');
    fpsElem.id = 'engine-stats-fps';
    container.appendChild(fpsElem);

    // FPS (dt)
    const fpsDTElem = document.createElement('div');
    fpsDTElem.id = 'engine-stats-fpsdt';
    container.appendChild(fpsDTElem);

    // DeltaTime
    const dtElem = document.createElement('div');
    dtElem.id = 'engine-stats-dt';
    container.appendChild(dtElem);

    document.body.appendChild(container);

    // Save references
    this.statsElements.parent = container;
    this.statsElements.fps = fpsElem;
    this.statsElements.fpsdt = fpsDTElem;
    this.statsElements.dt = dtElem;
}

function ResumeAudioContext() {
    if (audioPlayer.audioContext.state === "suspended") {
        audioPlayer.audioContext.resume().then(() => {
            console.log("Audio context resumed.");
        }).catch((err) => {
            console.error("Failed to resume AudioContext:", err);
        });
    }
}

// window.onload = Init;
