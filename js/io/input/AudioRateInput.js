import constants from "../../shared/constants.js";
import { createMultiChannelView } from "../../shared/multichannel.js";
import { isType } from "../../shared/util.js";
import { AbstractInput } from "./AbstractInput.js";
export class AudioRateInput extends AbstractInput {
    get numInputChannels() {
        return this.activeChannel ? 1 : this.port.numChannels;
    }
    constructor(name, parent, port) {
        var _a;
        super(name, parent, false);
        this.name = name;
        this.parent = parent;
        this.activeChannel = undefined;
        this.port = isType(port, [AudioNode, AudioParam])
            ? new this._.NodeInputPort(port)
            : port;
        this.channels = createMultiChannelView(this, ((_a = this.port) === null || _a === void 0 ? void 0 : _a.node) instanceof AudioNode);
    }
    get left() {
        return this.channels[0];
    }
    get right() {
        var _a;
        return (_a = this.channels[1]) !== null && _a !== void 0 ? _a : this.left;
    }
    get value() {
        return this.port.node instanceof AudioParam ? this.port.node.value : 0;
    }
    setValue(value) {
        this.validate(value);
        if (value == constants.TRIGGER) {
            value = this.value;
        }
        if (this.port.node instanceof AudioParam && isType(value, Number)) {
            this.port.node.setValueAtTime(value, 0);
        }
    }
}
// TODO: implement AudioParam interface.
/*
export class AudioParamControlOutput extends ControlOutput<any> implements AudioParam {
  connections: AudioParam[]
  connect(destination: CanBeConnectedTo) {
    let { component, input } = this.getDestinationInfo(destination)
    if (input instanceof AudioRateInput) {
      this.connections.push(destination)
    } else {
      throw new Error("The output must be an audio-rate input.")
    }
    return destination
  }
  protected map(key: keyof AudioParam, args: any): this {
    for (let connection of this.connections) {
      connection[key](...args)
    }
    return this
  }
  cancelAndHoldAtTime(cancelTime: number) {
    return this.map('cancelAndHoldAtTime', arguments)
  }
  cancelScheduledValues(cancelTime: number) {
    return this.map('cancelScheduledValues', arguments)
  }
  exponentialRampToValueAtTime(value: number, endTime: number) {
    return this.map('exponentialRampToValueAtTime', arguments)
  }
  linearRampToValueAtTime(value: number, endTime: number) {
    return this.map('linearRampToValueAtTime', arguments)
  }
  setTargetAtTime(value: number, startTime: number, timeConstant: number) {
    return this.map('setTargetAtTime', arguments)
  }
  setValueAtTime(value: number, startTime: number) {
    return this.map('setValueAtTime', arguments)
  }
  setValueCurveAtTime(values: number[], startTime: number, duration: number) {
    return this.map('setValueCurveAtTime', arguments)
  }
} */ 
