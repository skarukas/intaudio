import { BaseComponent } from "./base/BaseComponent.js";
export class IgnoreDuplicates extends BaseComponent {
    constructor() {
        super();
        this.input = this.defineControlInput('input');
        this.output = this.defineControlOutput('output');
    }
    inputDidUpdate(input, newValue) {
        if (newValue != this.value) {
            this.output.setValue(newValue);
            this.value = newValue;
        }
    }
}
