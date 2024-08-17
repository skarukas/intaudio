import { MidiMessageListener } from "./MidiListener.js";
import constants from "./constants.js";
// @ts-ignore No d.ts file found.
import { ContextMenu } from 'jquery-contextmenu';
var MidiLearnMode;
(function (MidiLearnMode) {
    /** Accept all messages matching the input device from the MIDI learn message. */
    MidiLearnMode["INPUT"] = "input";
    /** Accept all messages matching the input device and status from the MIDI learn message. */
    MidiLearnMode["STATUS"] = "status";
    /** Accept all messages matching the input device, status, and the first message byte (ex: pitch) from the MIDI learn message. */
    MidiLearnMode["FIRST_BYTE"] = "first-byte";
})(MidiLearnMode || (MidiLearnMode = {}));
const NULL_OP = (...args) => void 0;
export class MidiLearn {
    constructor({ learnMode = MidiLearnMode.STATUS, contextMenuSelector = undefined, onMidiLearnConnection = NULL_OP, onMidiMessage = NULL_OP } = {}) {
        this.isInMidiLearnMode = false;
        this.learnMode = learnMode;
        this.onMidiLearnConnection = onMidiLearnConnection;
        this.onMidiMessage = onMidiMessage;
        contextMenuSelector && this.addMidiLearnContextMenu(contextMenuSelector);
        this.$contextMenu = contextMenuSelector ? $(contextMenuSelector) : undefined;
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
        var _a;
        this.isInMidiLearnMode = true;
        (_a = this.$contextMenu) === null || _a === void 0 ? void 0 : _a.removeClass(constants.MIDI_LEARN_ASSIGNED_CLASS).addClass(constants.MIDI_LEARN_LISTENING_CLASS);
        // Exit on escape.
        window.addEventListener("keydown", (event) => {
            if (event.key == "Escape") {
                this.exitMidiLearnMode();
            }
        }, { once: true });
    }
    exitMidiLearnMode() {
        var _a;
        this.isInMidiLearnMode = false;
        (_a = this.$contextMenu) === null || _a === void 0 ? void 0 : _a.removeClass(constants.MIDI_LEARN_LISTENING_CLASS);
    }
    matchesLearnedFilter(input, event) {
        var _a, _b, _c, _d, _e;
        if (event.data == null)
            return false;
        const inputMatches = ((_a = this.learnedMidiInput) === null || _a === void 0 ? void 0 : _a.id) == input.id;
        const statusMatch = inputMatches && (this.learnMode == MidiLearnMode.INPUT
            || ((_c = (_b = this.learnedMidiEvent) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c[0]) == event.data[0]);
        const firstByteMatch = statusMatch && (this.learnMode != MidiLearnMode.FIRST_BYTE
            || ((_e = (_d = this.learnedMidiEvent) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e[1]) == event.data[1]);
        return firstByteMatch;
    }
    midiMessageHandler(input, event) {
        var _a;
        if (event.data == null)
            return;
        if (this.isInMidiLearnMode) {
            this.learnedMidiInput = input;
            this.learnedMidiEvent = event;
            this.onMidiLearnConnection(input, event.data);
            this.onMidiMessage(event);
            (_a = this.$contextMenu) === null || _a === void 0 ? void 0 : _a.addClass(constants.MIDI_LEARN_ASSIGNED_CLASS);
            this.exitMidiLearnMode();
        }
        else if (this.matchesLearnedFilter(input, event)) {
            this.onMidiMessage(event);
        }
    }
}
MidiLearn.Mode = MidiLearnMode;
