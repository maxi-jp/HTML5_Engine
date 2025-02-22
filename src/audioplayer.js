class AudioPlayer {
    constructor() {
        this.audioAssets = {};
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    LoadAudio(assets, onloaded) {
        if (assets === null || Object.keys(assets).length === 0) {
            onloaded();
            return;
        }

        let audioToLoad = 0;

        const onload = () => --audioToLoad === 0 && onloaded();

        // iterate through the object of assets and load every audio file
        for (let asset in assets) {
            if (assets.hasOwnProperty(asset)) {
                audioToLoad++; // one more audio file to load

                // create the new audio and set its path and onload event
                const audio = new Audio();
                audio.src = assets[asset].path;
                audio.oncanplaythrough = onload;

                audio.src = assets[asset].path;
                audio.oncanplaythrough = onload;

                // create a gain node for volume control
                const gainNode = this.audioContext.createGain();

                // create a panner node for stereo localization
                const panner = this.audioContext.createStereoPanner();

                // connect the audio element to the panner node and then to the audio context
                const track = this.audioContext.createMediaElementSource(audio);
                track.connect(gainNode).connect(panner).connect(this.audioContext.destination);

                this.audioAssets[asset] = { audio, gainNode, panner };
            }
        }
    }

    PlayAudio(name, pan=0, volume=1, pitch=1) {
        if (this.audioAssets[name]) {
            this.audioAssets[name].panner.pan.value = pan;
            this.audioAssets[name].gainNode.gain.value = volume;
            this.audioAssets[name].audio.playbackRate = pitch;
            this.audioAssets[name].audio.play();
        }
        else {
            console.warn(`Audio asset "${name}" not found.`);
        }
    }

    PauseAudio(name) {
        if (this.audioAssets[name]) {
            this.audioAssets[name].audio.pause();
        }
        else {
            console.warn(`Audio asset "${name}" not found.`);
        }
    }

    StopAudio(name) {
        if (this.audioAssets[name]) {
            this.audioAssets[name].audio.pause();
            this.audioAssets[name].audio.currentTime = 0;
        }
        else {
            console.warn(`Audio asset "${name}" not found.`);
        }
    }

    PlayFromTheStart(name, pan=0, volume=1, pitch=1) {
        if (this.audioAssets[name]) {
            this.audioAssets[name].panner.pan.value = pan;
            this.audioAssets[name].gainNode.gain.value = volume;
            this.audioAssets[name].audio.playbackRate = pitch;
            this.audioAssets[name].audio.currentTime = 0;
            this.audioAssets[name].audio.play();
        }
        else {
            console.warn(`Audio asset "${name}" not found.`);
        }
    }

    PlayLoop(name, pan=0, volume=1, pitch=1) {
        if (this.audioAssets[name]) {
            this.audioAssets[name].panner.pan.value = pan;
            this.audioAssets[name].gainNode.gain.value = volume;
            this.audioAssets[name].audio.playbackRate = pitch;
            this.audioAssets[name].audio.currentTime = 0;
            this.audioAssets[name].audio.loop = true;
            this.audioAssets[name].audio.play();
        }
        else {
            console.warn(`Audio asset "${name}" not found.`);
        }
    }

    SetPan(name, panValue) {
        if (this.audioAssets[name]) {
            this.audioAssets[name].panner.pan.value = panValue;
        }
        else {
            console.warn(`Audio asset "${name}" not found.`);
        }
    }

    SetVolume(name, volumeValue) {
        if (this.audioAssets[name]) {
            this.audioAssets[name].gainNode.gain.value = volumeValue;
        }
        else {
            console.warn(`Audio asset "${name}" not found.`);
        }
    }

    SetPitch(name, pitchValue) {
        if (this.audioAssets[name]) {
            this.audioAssets[name].audio.playbackRate = pitchValue;
        }
        else {
            console.warn(`Audio asset "${name}" not found.`);
        }
    }
}
