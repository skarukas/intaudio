import { ToStringAndUUID } from "./base/ToStringAndUUID.js"


class MidiListener extends ToStringAndUUID {
  constructor(
    public listener: Function,
    protected listenerMap: { [id: string]: Function }
  ) {
    super()
    MidiState.connect()
    listenerMap[this._uuid] = listener
  }
  remove() {
    delete this.listenerMap[this._uuid]
  }
}

type AccessListenerFn = (access: MIDIAccess, event?: MIDIConnectionEvent) => void[]
type MessageListenerFn = (midiInput: MIDIInput, e: MIDIMessageEvent) => void

abstract class MidiState {
  static accessListeners: { [id: string]: AccessListenerFn } = {}
  static messageListeners: { [id: string]: MessageListenerFn } = {}
  static isInitialized: boolean = false

  static connect() {
    if (this.isInitialized) {
      return Promise.resolve()
    } else {
      // Avoid race conditions by requesting access only once.
      this.isInitialized = true
      return navigator.requestMIDIAccess().then(access => {
        this.onMidiAccessChange(access)
        access.onstatechange = this.onMidiAccessChange.bind(this, access)
      })
    }
  }
  static onMidiAccessChange(access: MIDIAccess, event?: Event) {
    if (!(event instanceof MIDIConnectionEvent)) return

    for (const listener of Object.values(this.accessListeners)) {
      listener(access, event)
    }
    for (const input of access.inputs.values()) {
      input.onmidimessage = MidiState.onMidiMessage.bind(this, input)
    }
  }
  static onMidiMessage(midiInput: MIDIInput, event: MIDIMessageEvent): void {
    for (const listener of Object.values(this.messageListeners)) {
      listener(midiInput, event)
    }
  }
}

// Utility for listening to current state of MIDI devices. There are many MIDI 
// listeners but only one MIDI state.
export class MidiAccessListener extends MidiListener {
  constructor(
    public onMidiAccessChange: (access: MIDIAccess, event?: MIDIConnectionEvent) => void,
  ) {
    super(onMidiAccessChange, MidiState.accessListeners)
  }
}

export class MidiMessageListener extends MidiListener {
  constructor(
    public onMidiMessage: (midiInput: MIDIInput, e: MIDIMessageEvent) => void
  ) {
    super(onMidiMessage, MidiState.messageListeners)
  }
}