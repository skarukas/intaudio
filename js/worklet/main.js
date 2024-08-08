// Entry point for the worklet.
import { BUFFER_WORKLET_NAME, BufferWorklet } from "./BufferWorklet.js";
import { BUFFER_WRITER_WORKLET_NAME, BufferWriterWorklet } from "./BufferWriterWorklet.js";
import { FFT_WORKLET_NAME, FFTWorklet, IFFT_WORKLET_NAME, IFFTWorklet } from "./FFTWorklet.js";
import { IS_WORKLET } from "./lib/utils.js";
import "./lib/BaseWorkletProcessor.js";
import { FUNCTION_WORKLET_NAME, OperationWorklet } from "./OperationWorklet.js";
import { RECORDER_WORKLET_NAME, RecorderWorklet } from "./RecorderWorklet.js";
// Register the AudioWorkletProcessors (if in Worklet)
if (IS_WORKLET) {
    registerProcessor(FUNCTION_WORKLET_NAME, OperationWorklet);
    registerProcessor(BUFFER_WORKLET_NAME, BufferWorklet);
    registerProcessor(RECORDER_WORKLET_NAME, RecorderWorklet);
    registerProcessor(BUFFER_WRITER_WORKLET_NAME, BufferWriterWorklet);
    registerProcessor(FFT_WORKLET_NAME, FFTWorklet);
    registerProcessor(IFFT_WORKLET_NAME, IFFTWorklet);
}
