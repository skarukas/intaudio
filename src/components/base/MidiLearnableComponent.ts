
import { MidiMessageListener } from "../../shared/MidiListener.js";
import constants from "../../shared/constants.js";
import { VisualComponent } from "./VisualComponent.js";
import {ContextMenu } from 'jquery-contextmenu';

// TODO: refactor to composition instead of inheritance.
// Add MIDILearnType:
// - Input: Consider only the input
// - Status: Consider the input as well as the statuc (e.g. only modwheel).
export abstract class MidiLearnableComponent extends VisualComponent<any> {
  protected isInMidiLearnMode: boolean = false
  protected midiMessageListener: MidiMessageListener
  protected learnedMidiInput: MIDIInput

  constructor() {
    super()
    this.addMidiLearnContextMenu("#" + this.domId)
    this.midiMessageListener = new MidiMessageListener(this.midiMessageHandler.bind(this))
  }
  private addMidiLearnContextMenu(selector: any) {
    const contextMenu = new ContextMenu();
    contextMenu.create({
      selector: selector,
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
    this.$container.addClass(constants.MIDI_LEARN_CLASS)
  }
  exitMidiLearnMode() {
    this.isInMidiLearnMode = false
    this.$container.removeClass(constants.MIDI_LEARN_CLASS)
  }
  private midiMessageHandler(input: MIDIInput, event: MIDIMessageEvent) {
    if (this.isInMidiLearnMode) {
      this.learnedMidiInput = input
      this.onMidiLearnConnection(input, event.data)
      this.onMidiEvent(event)
      this.exitMidiLearnMode()
    } else if (this.learnedMidiInput?.id == input.id) {
      this.onMidiEvent(event)
    }
  }
  protected onMidiLearnConnection(input: MIDIInput, data: Uint8Array): void { }
  protected onMidiEvent(event: MIDIMessageEvent): void { }
}