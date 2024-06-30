import { ControlInput } from "../io/input/ControlInput.js";
import { MidiLearn } from "../shared/MidiLearn.js";
import constants from "../shared/constants.js";
import { VisualComponent } from "./base/VisualComponent.js";
export class Bang extends VisualComponent {
    constructor() {
        super();
        this.display = new this._.BangDisplay(this);
        this.output = this._defineControlOutput('output');
        this._preventIOOverwrites();
        this.midiLearn = new MidiLearn({
            contextMenuSelector: this.uniqueDomSelector,
            learnMode: MidiLearn.Mode.FIRST_BYTE,
            onMidiMessage: event => event.data[2] && this.trigger()
        });
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
