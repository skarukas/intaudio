// TODO: make this stuff stache-configurable.
export const GLOBAL_AUDIO_CONTEXT = new AudioContext();
export const defaultConfig = {
    audioContext: GLOBAL_AUDIO_CONTEXT,
    state: { isInitialized: false },
    defaultSamplePeriodMs: 10,
    workletPath: "js/shared/audio_worklet/worklet.js"
};
const _GLOBAL_STATE = defaultConfig.state;
let _runCalled = false;
let gestureListeners = [];
/**
 * Register a function to be called once the audio engine is ready and a user gesture has been performed.
 *
 * @param callback A function to run once the audio engine is ready.
 */
export function run(callback) {
    if (!_runCalled)
        createInitListeners();
    _runCalled = true;
    if (_GLOBAL_STATE.isInitialized) {
        callback(GLOBAL_AUDIO_CONTEXT);
    }
    else {
        gestureListeners.push(callback);
    }
}
function init() {
    if (_GLOBAL_STATE.isInitialized)
        return;
    _GLOBAL_STATE.isInitialized = true;
    GLOBAL_AUDIO_CONTEXT.resume();
    for (const listener of gestureListeners) {
        listener(GLOBAL_AUDIO_CONTEXT);
    }
}
function createInitListeners() {
    const workletPromise = GLOBAL_AUDIO_CONTEXT.audioWorklet.addModule(defaultConfig.workletPath);
    const USER_GESTURES = ["change", "click", "contextmenu", "dblclick", "mouseup", "pointerup", "reset", "submit", "touchend"];
    for (const gesture of USER_GESTURES) {
        document.addEventListener(gesture, initAfterAsyncOperations, { once: true });
    }
    function initAfterAsyncOperations() {
        workletPromise.then(init);
    }
}
