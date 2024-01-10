
class AudioRecorder {
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: BlobPart[] = [];
    private stream: MediaStream | null = null;

    private audioContext: AudioContext | null = null;

    private callback


    constructor(callback: any) {
        this.callback = callback
    }

    async startRecording(skipSilenceDetector: boolean): Promise<void> {
        if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
            // Already recording
            return;
        }

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (skipSilenceDetector)
                await this.setupAudioProcessing();

            this.mediaRecorder = new MediaRecorder(this.stream);
            this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
                this.audioChunks.push(event.data);
            };
            this.mediaRecorder.start(250);
        } catch (err) {
            console.error('Error accessing media devices.', err);
        }
    }

    stopRecording(): Promise<Blob> {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) {
                console.warn('MediaRecorder not initialized or recording not started.');
                resolve(null); // Resolve with null or handle appropriately
                return;
            }

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                resolve(audioBlob);
                this.cleanup();
            };

            this.mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event);
                reject(event.error || new Error('Unknown MediaRecorder error'));
            };

            if (this.mediaRecorder.state === "recording") {
                this.mediaRecorder.stop();
            } else {
                // If not recording, resolve immediately
                resolve(null);
            }
        });
    }

    isRecording(): boolean {
        return this.mediaRecorder ? this.mediaRecorder.state === "recording" : false;
    }

    private async setupAudioProcessing() {
        this.audioContext = new AudioContext();
        await this.audioContext.audioWorklet.addModule('assets/silence-detector-processor.js');
        const source = this.audioContext.createMediaStreamSource(this.stream!);
        const silenceDetector = new AudioWorkletNode(this.audioContext, 'silence-detector-processor');

        silenceDetector.port.onmessage = (event) => {
            if (event.data.stopRecording) {
                this.callback(this.stopRecording());
            }
        };

        source.connect(silenceDetector).connect(this.audioContext.destination);
    }

    private cleanup(): void {
        this.audioChunks = [];

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        this.mediaRecorder = null;
    }
}

export default AudioRecorder;