import { SignalLogger } from "./logger.js";
// lazy-init to 
let logger;
export const defaultConfig = {
    audioContext: new AudioContext(),
    state: {
        workletIsAvailable: false,
        components: {}
    },
    get logger() {
        return logger !== null && logger !== void 0 ? logger : (logger = new SignalLogger());
    },
    defaultSamplePeriodMs: 10,
    useWorkletByDefault: false,
    workletPath: "dist/worklet.js"
};
