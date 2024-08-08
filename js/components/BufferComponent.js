import { bufferToFloat32Arrays, getBufferId } from "../shared/util.js";
import { BUFFER_WORKLET_NAME } from "../worklet/BufferWorklet.js";
import { BaseComponent } from "./base/BaseComponent.js";
export class BufferComponent extends BaseComponent {
    constructor(buffer) {
        var _a;
        super();
        const numChannels = (_a = buffer === null || buffer === void 0 ? void 0 : buffer.numberOfChannels) !== null && _a !== void 0 ? _a : 2;
        this.worklet = new AudioWorkletNode(this.audioContext, BUFFER_WORKLET_NAME, {
            numberOfInputs: 1,
            numberOfOutputs: 1,
            outputChannelCount: [numChannels],
        });
        this.worklet['__numInputChannels'] = numChannels;
        this.worklet['__numOutputChannels'] = numChannels;
        // Input
        this.buffer = this.defineControlInput('buffer', buffer, true).ofType(AudioBuffer);
        this.time = this.defineAudioInput('time', this.worklet).ofType(Number);
        // Output
        this.output = this.defineAudioOutput('output', this.worklet).ofType(Number);
        buffer && this.setBuffer(buffer);
    }
    get bufferId() {
        return getBufferId(this.buffer.value);
    }
    setBuffer(buffer) {
        this.worklet.port.postMessage({
            buffer: bufferToFloat32Arrays(buffer),
            bufferId: this.bufferId
        });
    }
    inputDidUpdate(input, newValue) {
        if (input == this.buffer) {
            if (newValue.numberOfChannels != this.buffer.value.numberOfChannels) {
                // TODO: better error message.
                throw new Error("Wrong number of channels");
            }
            this.setBuffer(newValue);
        }
    }
}
