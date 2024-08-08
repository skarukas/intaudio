import { CompoundInput } from "./CompoundInput.js";
// TODO: remove.
// Could this be generalized to a "compound input", of which this is just a 
// subclass?
export class FFTInput extends CompoundInput {
    // TODO: add fftSize etc.
    constructor(name, parent, magnitude, phase, sync) {
        super(name, parent, { magnitude, phase, sync });
        this.name = name;
        this.parent = parent;
    }
}
