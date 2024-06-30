
import { MidiMessageListener } from "./MidiListener.js";
import constants from "./constants.js";
declare var $: JQueryStatic;
import {ContextMenu } from 'jquery-contextmenu';

enum MidiLearnMode {
  /** Accept all messages matching the input device from the MIDI learn message. */ 
  INPUT = "input",
  /** Accept all messages matching the input device and status from the MIDI learn message. */
  STATUS = "status",
  /** Accept all messages matching the input device, status, and the first message byte (ex: pitch) from the MIDI learn message. */
  FIRST_BYTE = "first-byte",
}

const NULL_OP = (...args: any) => void 0

export class MidiLearn {
  static Mode = MidiLearnMode
  public isInMidiLearnMode: boolean = false
  public learnMode: MidiLearnMode
  public learnedMidiInput: MIDIInput
  public learnedMidiEvent: MIDIMessageEvent

  protected midiMessageListener: MidiMessageListener
  protected contextMenuSelector: string
  protected onMidiLearnConnection: ((input: MIDIInput, data: Uint8Array) => void)
  protected onMidiMessage: ((event: MIDIMessageEvent) => void)

  constructor({
    learnMode=MidiLearnMode.STATUS,
    contextMenuSelector=undefined,
    onMidiLearnConnection=NULL_OP,
    onMidiMessage=NULL_OP
  }: {
    learnMode?: MidiLearnMode,
    contextMenuSelector?: string,
    onMidiLearnConnection?: ((input: MIDIInput, data: Uint8Array) => void),
    onMidiMessage?: ((event: MIDIMessageEvent) => void)
  } = {}) {
    this.learnMode = learnMode
    this.onMidiLearnConnection = onMidiLearnConnection
    this.onMidiMessage = onMidiMessage
    contextMenuSelector && this.addMidiLearnContextMenu(contextMenuSelector)
    this.contextMenuSelector = contextMenuSelector
    this.midiMessageListener = new MidiMessageListener(this.midiMessageHandler.bind(this))
  }
  private addMidiLearnContextMenu(contextMenuSelector: string) {
    const contextMenu = new ContextMenu();
    contextMenu.create({
      selector: contextMenuSelector,
      items: {
        enter: {
          name: "Midi Learn",
          callback: () => {
            if (this.isInMidiLearnMode) this.exitMidiLearnMode()
            else this.enterMidiLearnMode()
          }
        }
      }
    })
  }
  enterMidiLearnMode() {
    this.isInMidiLearnMode = true
    $(this.contextMenuSelector).addClass(constants.MIDI_LEARN_CLASS)
  }
  exitMidiLearnMode() {
    this.isInMidiLearnMode = false
    $(this.contextMenuSelector).removeClass(constants.MIDI_LEARN_CLASS)
  }
  private matchesLearnedFilter(input: MIDIInput, event: MIDIMessageEvent) {
    const inputMatches = this.learnedMidiInput?.id == input.id
    const statusMatch = inputMatches && (
      this.learnMode == MidiLearnMode.INPUT
      || this.learnedMidiEvent.data[0] == event.data[0]
    )
    const firstByteMatch = statusMatch && (
      this.learnMode != MidiLearnMode.FIRST_BYTE
      || this.learnedMidiEvent.data[1] == event.data[1]
    )
    return firstByteMatch
  }
  private midiMessageHandler(input: MIDIInput, event: MIDIMessageEvent) {
    if (this.isInMidiLearnMode) {
      this.learnedMidiInput = input
      this.learnedMidiEvent = event
      this.onMidiLearnConnection(input, event.data)
      this.onMidiMessage(event)
      this.exitMidiLearnMode()
    } else if (this.matchesLearnedFilter(input, event)) {
      this.onMidiMessage(event)
    }
  }
}