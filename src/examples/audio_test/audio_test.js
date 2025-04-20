class AudioTest extends Game {
    constructor() {
        super();

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
    }

    Start() {
        super.Start();

        drawStats = false;
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

        // Adjust the pitch using ←/→ keys
        if (Input.IsKeyDown(KEY_LEFT)) {
            this.pitch = Math.min(this.pitch + 0.1, 3); // Increase pitch
            audioPlayer.SetPitch(this.currentAudio, this.pitch);
            console.log(`Pitch: ${this.pitch}`);
        }
        if (Input.IsKeyDown(KEY_RIGHT)) {
            this.pitch = Math.max(this.pitch - 0.1, 0.5); // Decrease pitch
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
    }

    Draw(ctx) {
        super.Draw(ctx);

        DrawSegment(ctx, this.screenHalfWidth, 0, this.screenHalfWidth, this.screenHeight, "grey");
        DrawSegment(ctx, 0, this.screenHalfHeight, this.screenWidth, this.screenHalfHeight, "grey");
        DrawCircle(ctx, Input.mouse.x, Input.mouse.y, 12, "red");

        // Display instructions
        this.titleLabel.Draw(ctx);
        this.select1Label.Draw(ctx);
        this.select2Label.Draw(ctx);
        this.select3Label.Draw(ctx);
        this.playPauseStopLabel.Draw(ctx);
        this.mousePositionLabel.Draw(ctx);
        this.adjustPitchLabel.Draw(ctx);

        // Display current audio properties
        this.audioSelectedLabel.Draw(ctx);
        this.panLabel.Draw(ctx);
        this.volumeLabel.Draw(ctx);
        this.pitchLabel.Draw(ctx);
    }
}

// Initialize the game
if (game === null) {
    game = new AudioTest();
}