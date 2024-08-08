import { CompoundOutput } from "./CompoundOutput.js";
export class FFTOutput extends CompoundOutput {
    // TODO: add fftSize, etc.
    constructor(name, magnitude, phase, sync, parent, fftSize = 128) {
        super(name, { magnitude, phase, sync }, parent);
        this.name = name;
        this.parent = parent;
        this.fftSize = fftSize;
    }
    ifft() {
        const component = new this._.IFFTComponent(this.fftSize);
        this.connect(component.fftIn);
        return component;
    }
}
