import { IS_WORKLET, joinTypedArrays, map2d } from "./lib/utils.js";
export const RECORDER_WORKLET_NAME = "recorder-worklet";
export const RecorderWorklet = IS_WORKLET ?
    class RecorderWorklet extends AudioWorkletProcessor {
        constructor() {
            super();
            // Chunks of audio data. Dimensions: [input, channel, chunk]
            this.floatDataChunks = [];
            this.isRecording = false;
            // After how many samples should the method return.
            this.maxNumSamples = Infinity;
            this.currNumSamples = 0;
            this.port.onmessage = (event) => {
                this.handleMessage(event.data);
            };
        }
        handleMessage(data) {
            if (data.command == 'start') {
                this.start(data.numSamples);
            }
            else if (data.command == 'stop') {
                this.stop();
            }
            else {
                throw new Error(`Unrecognized data: ${JSON.stringify(data)}`);
            }
        }
        start(numSamples) {
            this.floatDataChunks = [];
            this.maxNumSamples = numSamples !== null && numSamples !== void 0 ? numSamples : Infinity;
            this.currNumSamples = 0;
            this.isRecording = true;
        }
        stop() {
            this.isRecording = false;
            const joinedData = map2d(this.floatDataChunks, chunks => joinTypedArrays(chunks, Float32Array, this.maxNumSamples)).filter(input => input.length);
            // Remove need for copy by transferring underlying ArrayBuffers to the 
            // main thread. See https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects#transferring_objects_between_threads 
            // for more details.
            const movedObjects = map2d(joinedData, c => c.buffer).flat();
            this.port.postMessage(joinedData, movedObjects);
            // Re-initialize; the old data is in an invalid state.
            this.floatDataChunks = [];
        }
        process(inputs, __outputs, __parameters) {
            var _a, _b;
            if (this.isRecording) {
                if (this.currNumSamples > this.maxNumSamples) {
                    this.stop();
                    return true;
                }
                for (let i = 0; i < inputs.length; i++) {
                    const input = inputs[i];
                    const chunks = (_a = this.floatDataChunks[i]) !== null && _a !== void 0 ? _a : [];
                    this.floatDataChunks[i] = chunks;
                    for (let c = 0; c < input.length; c++) {
                        // Create channel if not exists, and append to it.
                        const chunkArray = (_b = chunks[c]) !== null && _b !== void 0 ? _b : [];
                        chunkArray.push(new Float32Array(input[c]));
                        chunks[c] = chunkArray;
                    }
                }
                inputs[0] && (this.currNumSamples += inputs[0][0].length);
            }
            return true;
        }
    } : null;
