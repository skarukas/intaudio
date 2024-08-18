import { AudioConfig } from "./config.js"
import { SignalLogger } from "./logger.js"

// lazy-init to 
let logger: SignalLogger

export const defaultConfig: AudioConfig = {
  audioContext: new AudioContext(),
  state: {
    isInitialized: false,
    workletIsAvailable: false
  },
  get logger(): SignalLogger {
    return logger ?? (logger = new SignalLogger())
  },
  defaultSamplePeriodMs: 10,
  useWorkletByDefault: false,
  workletPath: "dist/worklet.js"
}