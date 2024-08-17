
import { ControlInput } from "../io/input/ControlInput.js"
import { AudioRateOutput } from "../io/output/AudioRateOutput.js"
import { KeyEvent, KeyEventType } from "../shared/events.js"
import { WaveType } from "../shared/types.js"
import { BaseComponent } from "./base/BaseComponent.js"

type SoundNode = {
  oscillator: OscillatorNode,
  gainNode: GainNode,
  isPlaying: boolean,
  // Unique identifier to help associate NOTE_OFF events with the correct
  // oscillator.
  key: string | undefined
}

export class SimplePolyphonicSynth extends BaseComponent {
  readonly numNotes: ControlInput<number>
  readonly waveform: ControlInput<WaveType>
  readonly midiInput: ControlInput<KeyEvent>
  readonly audioOutput: AudioRateOutput

  private _soundNodes: Array<SoundNode> = []
  private _currNodeIdx: number = 0
  protected _masterGainNode: GainNode

  constructor(numNotes = 4, waveform = WaveType.SINE) {
    super()
    this._masterGainNode = this.audioContext.createGain()

    // Inputs
    this.numNotes = this.defineControlInput('numNotes', numNotes)
    this.waveform = this.defineControlInput('waveform', waveform)
    this.midiInput = this.defineControlInput('midiInput')
    this.setDefaultInput(this.midiInput)

    // Output
    this.audioOutput = this.defineAudioOutput('audioOutput', this._masterGainNode)


    for (let i = 0; i < numNotes; i++) {
      this._soundNodes.push(
        this.#createOscillatorGraph(this.waveform.value)
      )
    }
    this.preventIOOverwrites()
  }

  #createOscillatorGraph(waveform: WaveType): SoundNode {
    let oscillator = this.audioContext.createOscillator()
    oscillator.type = waveform
    let gainNode = this.audioContext.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(this._masterGainNode)
    this._masterGainNode.gain.setValueAtTime(1 / this.numNotes.value, this.now())

    return {
      oscillator: oscillator,
      gainNode: gainNode,
      isPlaying: false,
      // Unique identifier to help associate NOTE_OFF events with the correct
      // oscillator.
      key: undefined
    }
  }

  inputDidUpdate<T>(input: ControlInput<T>, newValue: T) {
    if (input == this.midiInput) {
      this.onKeyEvent(<KeyEvent>newValue)
    }
    // TODO: fill in the rest.
  }

  onKeyEvent(event: KeyEvent) {
    // Need better solution than this.
    let freq = 440 * 2 ** ((event.eventPitch - 69) / 12)
    if (event.eventType == KeyEventType.KEY_DOWN) {
      let node = this._soundNodes[this._currNodeIdx]

      node.isPlaying && node.oscillator.stop()
      node.oscillator = this.audioContext.createOscillator()
      node.oscillator.connect(node.gainNode)
      node.oscillator.frequency.value = freq
      node.gainNode.gain.value = event.eventVelocity / 128
      node.oscillator.start()
      node.key = event.key
      node.isPlaying = true
      this._currNodeIdx = (this._currNodeIdx + 1) % this.numNotes.value
    } else if (event.eventType == KeyEventType.KEY_UP) {
      for (let node of this._soundNodes) {
        if (event.key && (event.key == node.key)) {
          node.oscillator.stop()
          node.isPlaying = false
        }
      }
    } else {
      throw new Error("invalid keyevent")
    }
  }
}
