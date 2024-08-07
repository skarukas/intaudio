import { BaseComponent } from "./base/BaseComponent.js";
export class AudioComponent extends BaseComponent {
    constructor(inputNode) {
        super();
        this.input = this.defineAudioInput('input', inputNode);
        if (inputNode instanceof AudioNode) {
            this.output = this.defineAudioOutput('output', inputNode);
        }
        else if (!(inputNode instanceof AudioParam)) {
            throw new Error("AudioComponents must be built from either and AudioNode or AudioParam");
        }
        this.preventIOOverwrites();
    }
}
