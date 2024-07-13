import { ChannelStacker } from "./components/ChannelStacker.js";
import { AudioTransformComponent, FunctionComponent } from "./internals.js";
export function stackChannels(inputs) {
    return ChannelStacker.fromInputs(inputs);
}
export function generate(arg) {
    if (arg instanceof Function) {
        return new FunctionComponent(() => Math.random() - 0.5);
    }
    else {
        throw new Error("not supported yet.");
    }
}
export function combine(inputs, fn, options = {}) {
    if (inputs instanceof Array) {
        return new AudioTransformComponent(fn, options).withInputs(...inputs);
    }
    else {
        // Needs to learn to handle float input I think.
        return new FunctionComponent(fn).withInputs(inputs);
    }
}
