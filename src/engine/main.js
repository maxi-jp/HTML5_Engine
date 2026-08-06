
var canvas = /** @type {HTMLCanvasElement} */(null);
var requestAnimationFrameID = -1;

/** @type {Renderer} The active Renderer instance. Set by the engine at startup and available globally throughout the game's lifetime. */
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

/** @type {Game} The active Game instance. Set by the engine at startup and available globally throughout the game's lifetime. */
var game = null;

/** @type {AudioPlayer} The global AudioPlayer instance. Manages all audio playback, volume, and the optional audio analyser. */
var audioPlayer = null;

/**
 * True when the device's primary pointer is coarse (finger/touch), meaning the game is
 * running on a phone or tablet. Hybrid laptops with a touchscreen but a mouse as their
 * primary pointer will be false. Can be used in Game.Start() to decide whether to show
 * virtual controls.
 * @type {boolean}
 */
var mobileWithTouchScreen = navigator.maxTouchPoints > 0 && window.matchMedia('(pointer: coarse)').matches;

function LoadImages(assets, onloaded) {
    if (assets === null || Object.keys(assets).length === 0)
        onloaded();
    
    let imagesToLoad = 0;

    const onload = function(assetEntry) {
        /** @type {HTMLImageElement|HTMLCanvasElement} */
        let result = assetEntry.img;
        if (assetEntry.bgColor) {
            result = ApplyColorKey(assetEntry.img, assetEntry.bgColor);
            assetEntry.img = result;
        }
        result.halfWidth  = result.width  / 2;
        result.halfHeight = result.height / 2;
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
            const entry = assets[asset];
            const img = entry.img = new Image();
            img.src = entry.path;
            img.onload = () => onload(entry);
        }
    }
}

function Init(GameClass) {
    canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("myCanvas"));

    if (window.location.search.includes("webgl")) {
        let gl = canvas.getContext("webgl2");
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

    // Resume audio context and request fullscreen on first user interaction.
    // Fullscreen hides the browser navigation bar on mobile (e.g. Android Chrome),
    // which would otherwise consume ~25% of screen height in landscape.
    if (Input.keyboard.anyKeyPressed || Input.mouse.pressed || Input.touch.any) {
        ResumeAudioContext();
        if (mobileWithTouchScreen && game.config.autoFullscreen && !document.fullscreenElement) {
            document.documentElement.requestFullscreen?.().catch(() => {
                console.warn("Failed to request fullscreen.");
            });
        }
    }
    
    // Process virtual controls first so bindings reflect the current touch state
    // when game.Update() reads them
    Input.UpdateVirtualControls();

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
