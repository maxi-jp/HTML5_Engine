class AudioPlayer {
    constructor(analyzer=false, analyzerfftSize=128, analyzerSmoothing=0.5) {
        this.audioAssets = {};
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        this.analyzer = analyzer;
        if (this.analyzer) {
            this.analyzerNode = this.audioContext.createAnalyser();

            if (analyzerfftSize < 32 || analyzerfftSize > 2048) {
                const analyzerfftSizeCap = Math.max(32, Math.min(2048, analyzerfftSize));
                console.warn(`Invalid fftSize value: ${analyzerfftSize}, is outside the range [32, 32768]. Setting it to ${analyzerfftSizeCap}.`);
                analyzerfftSize = analyzerfftSizeCap;
            }
            this.analyzerNode.fftSize = analyzerfftSize;

            if (analyzerSmoothing < 0 || analyzerSmoothing > 0.99) {
                const analyzerSmoothingCap = Math.max(0, Math.min(0.99, analyzerSmoothing));
                console.warn(`Invalid smoothingTimeConstant value: ${analyzerSmoothing}, is outside the range [0, 0.99]. Setting it to ${analyzerSmoothingCap}.`);
                analyzerSmoothing = analyzerSmoothingCap;
            }
            this.analyzerNode.smoothingTimeConstant = analyzerSmoothing;

            this.frequencyData = new Uint8Array(this.analyzerNode.frequencyBinCount);
        }
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

                // create a gain node for volume control
                const gainNode = this.audioContext.createGain();

                // create a panner node for stereo localization
                const panner = this.audioContext.createStereoPanner();

                const track = this.audioContext.createMediaElementSource(audio);
                
                // connect the audio element to the panner node and then to the audio context
                if (this.analyzer) {
                    track.connect(gainNode).connect(panner).connect(this.analyzerNode).connect(this.audioContext.destination);
                }
                else {
                    track.connect(gainNode).connect(panner).connect(this.audioContext.destination);
                }

                this.audioAssets[asset] = { audio, gainNode, panner };
                assets[asset].audio = this.audioAssets[asset].audio;
            }
        }
    }

    PlayAudio(name, pan=0, volume=1, pitch=1) {
        if (this.audioAssets[name]) {
            this.audioAssets[name].panner.pan.value = pan;
            this.audioAssets[name].gainNode.gain.value = volume;
            this.audioAssets[name].audio.playbackRate = pitch;
            this.audioAssets[name].audio.loop = false;
            this.audioAssets[name].audio.playPromise = this.audioAssets[name].audio.play();
            
            return this.audioAssets[name].audio.playPromise;
        }
        else {
            console.warn(`Audio asset "${name}" not found.`);
        }
    }

    PauseAudio(name) {
        if (this.audioAssets[name]) {
            if (this.audioAssets[name].audio.playPromise != undefined) {
                this.audioAssets[name].audio.playPromise.then(() => {
                    this.audioAssets[name].audio.pause();
                }).catch((error) => {
                    console.warn("Error stopping audio:", error);
                });
            }
        }
        else {
            console.warn(`Audio asset "${name}" not found.`);
        }
    }

    StopAudio(name) {
        if (this.audioAssets[name]) {
            if (this.audioAssets[name].audio.playPromise != undefined) {
                this.audioAssets[name].audio.playPromise.then(() => {
                    this.audioAssets[name].audio.pause();
                    this.audioAssets[name].audio.currentTime = 0;
                }).catch((error) => {
                    console.warn("Error stopping audio:", error);
                });
            }
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
            this.audioAssets[name].audio.loop = false;
            this.audioAssets[name].audio.playPromise = this.audioAssets[name].audio.play();

            return this.audioAssets[name].audio.playPromise;
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
            this.audioAssets[name].audio.playPromise = this.audioAssets[name].audio.play();
            
            return this.audioAssets[name].audio.playPromise;
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

    IsPlaying(name) {
        if (this.audioAssets[name]) {
            return !this.audioAssets[name].audio.paused;
        } else {
            console.warn(`Audio asset "${name}" not found.`);
            return false;
        }
    }

    GetFrequencyData() {
        this.analyzerNode.getByteFrequencyData(this.frequencyData);        
        return this.frequencyData;
    }
}
