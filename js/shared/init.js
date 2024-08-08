import { SignalLogger } from "./logger.js";
// TODO: make this stuff stache-configurable.
export const GLOBAL_AUDIO_CONTEXT = new AudioContext();
let logger;
export const defaultConfig = {
    audioContext: GLOBAL_AUDIO_CONTEXT,
    state: {
        isInitialized: false,
        workletIsAvailable: false
    },
    get logger() {
        return logger !== null && logger !== void 0 ? logger : (logger = new SignalLogger());
    },
    defaultSamplePeriodMs: 10,
    useWorkletByDefault: false,
    workletPath: "dist/worklet.js"
};
let runCalled = false;
const config = defaultConfig; // TODO: figure this out
let gestureListeners = [];
/**
 * Register a function to be called once the audio engine is ready and a user gesture has been performed.
 *
 * @param callback A function to run once the audio engine is ready.
 */
export function run(callback) {
    if (!runCalled)
        createInitListeners();
    runCalled = true;
    if (config.state.isInitialized) {
        callback(config.audioContext);
    }
    else {
        gestureListeners.push(callback);
    }
}
function init(workletAvailable) {
    if (config.state.isInitialized)
        return;
    config.state.isInitialized = true;
    config.state.workletIsAvailable = workletAvailable;
    workletAvailable || console.warn(`Unable to load worklet file from ${config.workletPath}. Worklet-based processing will be disabled. Verify the workletPath configuration setting is set correctly and the file is available.`);
    config.audioContext.resume();
    for (const listener of gestureListeners) {
        listener(config.audioContext);
    }
}
function createInitListeners() {
    const workletPromise = config.audioContext.audioWorklet.addModule(config.workletPath);
    const USER_GESTURES = ["change", "click", "contextmenu", "dblclick", "mouseup", "pointerup", "reset", "submit", "touchend"];
    for (const gesture of USER_GESTURES) {
        document.addEventListener(gesture, initAfterAsyncOperations, { once: true });
    }
    function initAfterAsyncOperations() {
        workletPromise.then(() => init(true), () => init(false));
    }
}
