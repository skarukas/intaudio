import { ControlInput } from "../io/input/ControlInput.js";
import { MidiLearn } from "../shared/MidiLearn.js";
import constants from "../shared/constants.js";
import { VisualComponent } from "./base/VisualComponent.js";
export class Bang extends VisualComponent {
    constructor() {
        super();
        this.lastMidiValue = 0;
        this.display = new this._.BangDisplay(this);
        this.output = this.defineControlOutput('output');
        this.preventIOOverwrites();
        // Trigger on nonzero MIDI inputs.
        this.midiLearn = new MidiLearn({
            contextMenuSelector: this.uniqueDomSelector,
            learnMode: MidiLearn.Mode.FIRST_BYTE,
            onMidiMessage: this.handleMidiInput.bind(this)
        });
    }
    handleMidiInput(event) {
        const midiValue = event.data[2];
        if (midiValue) {
            if (!this.lastMidiValue) {
                this.trigger();
                this.display.showPressed();
            }
        }
        else {
            this.display.showUnpressed();
        }
        this.lastMidiValue = midiValue;
    }
    connect(destination) {
        let { component } = this.getDestinationInfo(destination);
        if (destination instanceof ControlInput) {
            this.output.connect(destination);
        }
        else {
            this.output.connect(component.triggerInput);
        }
        return component;
    }
    trigger() {
        this.output.setValue(constants.TRIGGER);
    }
}
// Display options. TODO: move to display class?
Bang.defaultHeight = 48;
Bang.defaultWidth = 48;
