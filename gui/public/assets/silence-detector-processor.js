class SilenceDetectorProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.silenceThreshold = 0.01; // Adjust as needed
        this.silenceDuration = 2000; // 1 second of silence
        this.lastSoundTime = currentTime;
        this.hasSentStopMessage = false;
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (input.length > 0) {
            const channelData = input[0];
            let sum = 0.0;
            for (let i = 0; i < channelData.length; i++) {
                sum += channelData[i] * channelData[i];
            }
            let rms = Math.sqrt(sum / channelData.length);
            // if (rms < this.silenceThreshold) {
            //     if (currentTime - this.lastSoundTime > this.silenceDuration / 1000) {
            //         this.port.postMessage({ stopRecording: true });
            //     }
            if (!this.hasSentStopMessage && rms < this.silenceThreshold) {
                if (currentTime - this.lastSoundTime > this.silenceDuration / 1000) {
                    this.port.postMessage({ stopRecording: true });
                    this.hasSentStopMessage = true; // Set the flag after sending message
                }
            } else {
                this.lastSoundTime = currentTime;
            }
        }

        return true;
    }
}

registerProcessor('silence-detector-processor', SilenceDetectorProcessor);
