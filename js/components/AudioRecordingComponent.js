import { range } from "../shared/util.js";
import { RECORDER_WORKLET_NAME } from "../worklet/RecorderWorklet.js";
import { BaseComponent } from "./base/BaseComponent.js";
export class AudioRecordingComponent extends BaseComponent {
    constructor(numberOfInputs = 1) {
        super();
        this.isRecording = false;
        // Methods to be called when receiving a message from the worklet.
        this.onMessage = () => null;
        this.onFailure = () => null;
        this.worklet = new AudioWorkletNode(this.audioContext, RECORDER_WORKLET_NAME, {
            numberOfInputs,
            numberOfOutputs: 0,
        });
        this.worklet.port.onmessage = event => {
            this.handleMessage(event.data);
        };
        for (const i of range(numberOfInputs)) {
            const gain = this.audioContext.createGain();
            gain.connect(this.worklet, undefined, i);
            this[i] = this.defineAudioInput(i, gain);
        }
    }
    capture(numSamples) {
        if (this.isRecording) {
            throw new Error("Audio is already being recorded.");
        }
        this.worklet.port.postMessage({ command: 'start', numSamples });
        this.isRecording = true;
        return this.waitForWorkletResponse();
    }
    start() {
        if (this.isRecording) {
            throw new Error("Audio is already being recorded.");
        }
        this.worklet.port.postMessage({ command: 'start' });
        this.isRecording = true;
    }
    stop() {
        if (!this.isRecording) {
            throw new Error("start() must be called before calling stop().");
        }
        this.worklet.port.postMessage({ command: 'stop' });
        return this.waitForWorkletResponse();
    }
    waitForWorkletResponse() {
        // This promise will resolve when the 'message' event listener calls one
        // of these methods.
        return new Promise((res, rej) => {
            this.onMessage = res;
            this.onFailure = rej;
        });
    }
    handleMessage(floatData) {
        if (!this.isRecording) {
            console.warn("Received a response from the worklet while recording was not enabled.");
        }
        this.isRecording = false;
        if (!(floatData instanceof Array && floatData.length > 0)) {
            this.onFailure();
        }
        else {
            const numSamples = floatData[0][0].length;
            const audioBuffers = floatData.map(input => {
                const audioBuffer = new AudioBuffer({
                    numberOfChannels: input.length,
                    length: numSamples, sampleRate: this.audioContext.sampleRate
                });
                input.map((channel, i) => audioBuffer.copyToChannel(channel, i));
                return audioBuffer;
            });
            this.onMessage(audioBuffers);
        }
    }
}
