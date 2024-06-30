import * as internals from './internals.js'

// TODO: add all public classes
export default {
  'SimplePolyphonicSynth': internals.SimplePolyphonicSynth,
  'Keyboard': internals.Keyboard,
  'ADSR': internals.ADSR,
  'TypingKeyboardMIDI': internals.TypingKeyboardMIDI,
  // TODO: remove.
  ...internals
}