import { MidiMessageListener } from "../../shared/MidiListener.js";
import constants from "../../shared/constants.js";
import { VisualComponent } from "./VisualComponent.js";
import { ContextMenu } from 'jquery-contextmenu';
// TODO: refactor to composition instead of inheritance.
// Add MIDILearnType:
// - Input: Consider only the input
// - Status: Consider the input as well as the statuc (e.g. only modwheel).
export class MidiLearnableComponent extends VisualComponent {
    constructor() {
        super();
        this.isInMidiLearnMode = false;
        this.addMidiLearnContextMenu("#" + this.domId);
        this.midiMessageListener = new MidiMessageListener(this.midiMessageHandler.bind(this));
    }
    addMidiLearnContextMenu(selector) {
        const contextMenu = new ContextMenu();
        contextMenu.create({
            selector: selector,
            items: {
                enter: {
                    name: "Midi Learn",
                    callback: () => {
                        if (this.isInMidiLearnMode)
                            this.exitMidiLearnMode();
                        else
                            this.enterMidiLearnMode();
                    }
                }
            }
        });
    }
    enterMidiLearnMode() {
        this.isInMidiLearnMode = true;
        this.$container.addClass(constants.MIDI_LEARN_CLASS);
    }
    exitMidiLearnMode() {
        this.isInMidiLearnMode = false;
        this.$container.removeClass(constants.MIDI_LEARN_CLASS);
    }
    midiMessageHandler(input, event) {
        var _a;
        if (this.isInMidiLearnMode) {
            this.learnedMidiInput = input;
            this.onMidiLearnConnection(input, event.data);
            this.onMidiEvent(event);
            this.exitMidiLearnMode();
        }
        else if (((_a = this.learnedMidiInput) === null || _a === void 0 ? void 0 : _a.id) == input.id) {
            this.onMidiEvent(event);
        }
    }
    onMidiLearnConnection(input, data) { }
    onMidiEvent(event) { }
}
