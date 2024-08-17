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
        if (event.data == null)
            return;
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
        let { component, input } = this.getDestinationInfo(destination);
        if (input instanceof ControlInput) {
            this.output.connect(input);
        }
        else if (component != undefined) {
            this.output.connect(component.triggerInput);
        }
        else {
            throw new Error(`Unable to connect to ${destination} because it is not a ControlInput and has no associated component.`);
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
