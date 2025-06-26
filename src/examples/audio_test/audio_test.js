class AudioTest extends Game {
    constructor(renderer) {
        super(renderer);

        this.config = {
            audioAnalyzer: true,
            analyzerfftSize: 64,
            analyzerSmoothing: 0.9,
        };

        this.audioAssets = {
            backgroundMusic: { path: "./src/examples/audio_test/assets/Pixelated Dreams.mp3" },
            laserSound: { path: "./src/examples/audio_test/assets/laser.wav" },
            jumpSound: { path: "./src/examples/audio_test/assets/jump.m4a" },
        };

        // State variables for audio properties
        this.currentAudio = "backgroundMusic";
        this.pan = 0; // Centered
        this.volume = 1; // Full volume
        this.pitch = 1; // Normal pitch

        this.titleLabel   = new TextLabel("Audio Test Controls:", new Vector2(10, 20), "16px Arial", "black", "left");
        this.select1Label = new TextLabel("1: Select Background Music", new Vector2(10, 40), "16px Arial", "black", "left");
        this.select2Label = new TextLabel("2: Select Shoot Sound", new Vector2(10, 60), "16px Arial", "black", "left");
        this.select3Label = new TextLabel("3: Select Explosion Sound", new Vector2(10, 80), "16px Arial", "black", "left");
        this.playPauseStopLabel = new TextLabel("P: Play, O: Pause, S: Stop", new Vector2(10, 100), "16px Arial", "black", "left");
        this.mousePositionLabel = new TextLabel("Mouse position: Adjust Pan (←/→) and Volume (↑/↓)", new Vector2(10, 120), "16px Arial", "black", "left");
        this.adjustPitchLabel   = new TextLabel("Arrow Keys (←/→): Decrease/Increase Pitch", new Vector2(10, 140), "16px Arial", "black", "left");

        this.audioSelectedLabel = new TextLabel("Current Audio: ", new Vector2(10, 180), "16px Arial", "black", "left");
        this.panLabel           = new TextLabel("Pan: ", new Vector2(10, 200), "16px Arial", "black", "left");
        this.volumeLabel        = new TextLabel("Volume: ", new Vector2(10, 220), "16px Arial", "black", "left");
        this.pitchLabel         = new TextLabel("Pitch: ", new Vector2(10, 240), "16px Arial", "black", "left");

        this.spectrumBarWidth = 0;
        this.spectrumBarHeightMultiplier = 0;

        this.audioBarsRectangles = [];
    }

    Start() {
        super.Start();

        this.screenWidth = 480;
        this.screenHeight = 480;

        drawStats = false;

        const numberOfBars = this.config.analyzerfftSize / 2;
        this.spectrumBarWidth = this.screenWidth / numberOfBars;
        this.spectrumBarHeightMultiplier = this.screenHeight / 256;

        // setup the bars for the audio spectrum
        this.audioBarsRectangles = [];
        for (let i = 0; i < numberOfBars; i++) {
            const rect = new Rectangle(new Vector2(i * this.spectrumBarWidth, 0), this.spectrumBarWidth, this.screenHeight, Color.Black());
            this.audioBarsRectangles.push(rect);
        }
    }

    Update(deltaTime) {
        super.Update(deltaTime);

        // Keyboard controls for audio playback
        if (Input.IsKeyDown(KEY_1)) {
            this.currentAudio = "backgroundMusic";
            console.log("Selected: Background Music");
        }
        if (Input.IsKeyDown(KEY_2)) {
            this.currentAudio = "laserSound";
            console.log("Selected: Shoot Sound");
        }
        if (Input.IsKeyDown(KEY_3)) {
            this.currentAudio = "jumpSound";
            console.log("Selected: Explosion Sound");
        }

        // Play, pause, and stop controls
        if (Input.IsKeyDown(KEY_P)) {
            audioPlayer.PlayAudio(this.currentAudio, this.pan, this.volume, this.pitch);
            console.log(`Playing: ${this.currentAudio}`);
        }
        if (Input.IsKeyDown(KEY_O)) {
            audioPlayer.PauseAudio(this.currentAudio);
            console.log(`Paused: ${this.currentAudio}`);
        }
        if (Input.IsKeyDown(KEY_S)) {
            audioPlayer.StopAudio(this.currentAudio);
            console.log(`Stopped: ${this.currentAudio}`);
        }
        if (Input.IsMouseDown()) {
            if (audioPlayer.IsPlaying(this.currentAudio)) {
                audioPlayer.StopAudio(this.currentAudio);
                console.log(`Stopped: ${this.currentAudio}`);
            }
            else {
                audioPlayer.PlayAudio(this.currentAudio, this.pan, this.volume, this.pitch);
                console.log(`Playing: ${this.currentAudio}`);
            }
        }

        // Adjust the pitch using ←/→ keys
        if (Input.IsKeyDown(KEY_RIGHT)) {
            this.pitch = Math.min(this.pitch + 0.05, 3); // Increase pitch
            audioPlayer.SetPitch(this.currentAudio, this.pitch);
            console.log(`Pitch: ${this.pitch}`);
        }
        if (Input.IsKeyDown(KEY_LEFT)) {
            this.pitch = Math.max(this.pitch - 0.05, 0.5); // Decrease pitch
            audioPlayer.SetPitch(this.currentAudio, this.pitch);
            console.log(`Pitch: ${this.pitch}`);
        }

        // Pan: -1 (left) to 1 (right)
        this.pan = Math.max(-1, Math.min(1, (Input.mouse.x - this.screenHalfWidth) / this.screenHalfWidth));
        audioPlayer.SetPan(this.currentAudio, this.pan);

        // Volume: 0 (bottom) to 1 (top)
        this.volume = Math.max(0, Math.min(1, 1 - (Input.mouse.y / this.screenHeight)));
        audioPlayer.SetVolume(this.currentAudio, this.volume);

        // Update labels
        this.audioSelectedLabel.text = `Current Audio: ${this.currentAudio}`;
        this.panLabel.text = `Pan: ${this.pan.toFixed(2)}`;
        this.volumeLabel.text = `Volume: ${this.volume.toFixed(2)}`;
        this.pitchLabel.text = `Pitch: ${this.pitch.toFixed(2)}`;

        // update the bars for the audio spectrum
        const frequencyData = audioPlayer.GetFrequencyData();
        
        for (let i = 0; i < frequencyData.length; i++) {
            const rect = this.audioBarsRectangles[i];
            
            rect.height = frequencyData[i] * this.spectrumBarHeightMultiplier;
            rect.position.x = i * this.spectrumBarWidth;
            rect.position.y = this.screenHeight - rect.height;

            rect.color.r = rect.height / this.screenHeight;
            rect.color.g = 0.196;
            rect.color.b = 0.588
        }
    }

    Draw() {
        super.Draw();

        // Draw the bar graph for the audio spectrum
        this.audioBarsRectangles.forEach(rect => rect.Draw(renderer));

        // lines pointing at the center of the screen
        this.renderer.DrawLine(this.screenHalfWidth, 0, this.screenHalfWidth, this.screenHeight, Color.lightgrey);
        this.renderer.DrawLine(0, this.screenHalfHeight, this.screenWidth, this.screenHalfHeight, Color.lightgrey);

        if (audioPlayer.IsPlaying(this.currentAudio)) {
            // Draw a triangle facing right when playing
            this.renderer.DrawPolygon([
                {x: Input.mouse.x - 10, y: Input.mouse.y - 10}, // Top vertex
                {x: Input.mouse.x - 10, y: Input.mouse.y + 10}, // Bottom vertex
                {x: Input.mouse.x + 10, y: Input.mouse.y}       // Right vertex
            ], Color.black, 1, true, Color.green);
        }
        else if (!audioPlayer.IsPlaying(this.currentAudio) && this.audioAssets[this.currentAudio]?.audio.currentTime > 0) {
            // Draw two vertical lines if paused
            this.renderer.DrawFillRectangle(Input.mouse.x - 6, Input.mouse.y, 4, 20, Color.orange);
            this.renderer.DrawFillRectangle(Input.mouse.x + 6, Input.mouse.y, 4, 20, Color.orange);
        }
        else {
            // Draw a square when stopped
            this.renderer.DrawFillRectangle(Input.mouse.x, Input.mouse.y, 20, 20, Color.red);
        }
        
        //this.renderer.DrawCircle(Input.mouse.x, Input.mouse.y, 12, Color.red);
        // mouse coordinates
        this.renderer.DrawLine(Input.mouse.x, 0, Input.mouse.x, this.screenHeight, Color.grey);
        this.renderer.DrawLine(0, Input.mouse.y, this.screenWidth, Input.mouse.y, Color.grey);

        // Display instructions
        this.titleLabel.Draw(this.renderer);
        this.select1Label.Draw(this.renderer);
        this.select2Label.Draw(this.renderer);
        this.select3Label.Draw(this.renderer);
        this.playPauseStopLabel.Draw(this.renderer);
        this.mousePositionLabel.Draw(this.renderer);
        this.adjustPitchLabel.Draw(this.renderer);

        // Display current audio properties
        this.audioSelectedLabel.Draw(this.renderer);
        this.panLabel.Draw(this.renderer);
        this.volumeLabel.Draw(this.renderer);
        this.pitchLabel.Draw(this.renderer);
    }
}
