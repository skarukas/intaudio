import { createConstantSource } from "../shared/util.js";
import { BaseComponent } from "./base/BaseComponent.js";
export class ControlToAudioConverter extends BaseComponent {
    constructor() {
        super();
        this.input = this.defineControlInput('input');
        this.node = createConstantSource(this.audioContext);
        this.output = this.defineAudioOutput('output', this.node);
    }
    inputDidUpdate(input, newValue) {
        if (input == this.input) {
            this.node.offset.setValueAtTime(newValue, 0);
        }
    }
}
