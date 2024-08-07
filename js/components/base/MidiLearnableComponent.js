import { MidiMessageListener } from "../../shared/MidiListener.js";
import constants from "../../shared/constants.js";
import { ContextMenu } from 'jquery-contextmenu';
var MidiLearnMode;
(function (MidiLearnMode) {
    /** Accept all messages matching the input device from the MIDI learn message. */
    MidiLearnMode["INPUT"] = "input";
    /** Accept all messages matching the input device and status from the MIDI learn message. */
    MidiLearnMode["COMMAND"] = "command";
})(MidiLearnMode || (MidiLearnMode = {}));
const NULL_OP = (...args) => void 0;
export class MidiLearn {
    constructor({ learnMode = MidiLearnMode.COMMAND, contextMenuSelector = undefined, onMidiLearnConnection = NULL_OP, onMidiMessage = NULL_OP } = {}) {
        this.isInMidiLearnMode = false;
        this.learnMode = learnMode;
        this.onMidiLearnConnection = onMidiLearnConnection;
        this.onMidiMessage = onMidiMessage;
        contextMenuSelector && this.addMidiLearnContextMenu(contextMenuSelector);
        this.$contextMenuSelector = $(contextMenuSelector);
        this.midiMessageListener = new MidiMessageListener(this.midiMessageHandler.bind(this));
    }
    addMidiLearnContextMenu(contextMenuSelector) {
        const contextMenu = new ContextMenu();
        contextMenu.create({
            selector: contextMenuSelector,
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
        this.$contextMenuSelector.addClass(constants.MIDI_LEARN_CLASS);
    }
    exitMidiLearnMode() {
        this.isInMidiLearnMode = false;
        this.$contextMenuSelector.removeClass(constants.MIDI_LEARN_CLASS);
    }
    matchesLearnedFilter(input, event) {
        var _a;
        const inputMatches = ((_a = this.learnedMidiInput) === null || _a === void 0 ? void 0 : _a.id) == input.id;
        return inputMatches && (this.learnMode == MidiLearnMode.INPUT
            || this.learnedMidiEvent.data[0] == event.data[0]);
    }
    midiMessageHandler(input, event) {
        if (this.isInMidiLearnMode) {
            this.learnedMidiInput = input;
            this.learnedMidiEvent = event;
            this.onMidiLearnConnection(input, event.data);
            this.onMidiMessage(event);
            this.exitMidiLearnMode();
        }
        else if (this.matchesLearnedFilter(input, event)) {
            this.onMidiMessage(event);
        }
    }
}
MidiLearn.Mode = MidiLearnMode;
