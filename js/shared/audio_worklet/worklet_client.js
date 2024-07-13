/**
 * Dead code left over from trying to polyfill / llifylop ScriptProcessorNode.
 **/
import { ToStringAndUUID } from "../base/ToStringAndUUID.js";
export class ScriptProcessorNode {
    set onaudioprocess(fn) {
        this.fn = fn;
        this.client.setFunction(fn);
    }
    get onaudioprocess() {
        return this.fn;
    }
    constructor(audioContext, numberOfInputChannels = 2, numberOfOutputChannels = 2, { workletName = "WORKLET_NAME", workletPath = "WORKLET_PATH" } = {}) {
        this.__isScriptProcessorShim = true;
        this.bufferSize = 128;
        this.numberOfInputs = 1;
        this.numberOfOutputs = 1;
        this.channelCountMode = "explicit";
        this.channelInterpretation = "speakers";
        this.channelCount = numberOfInputChannels;
        this.numberOfOutputChannels = numberOfOutputChannels;
        this.context = audioContext;
        this.client = new WorkletClient(workletPath, workletName, {
            outputChannelCount: [numberOfOutputChannels],
            numberOfInputs: 1,
            numberOfOutputs: 1,
        });
    }
    addEventListener(type, listener, options) {
        if (type != "audioprocess") {
            throw new Error("Only audioprocess event is supported.");
        }
        if (this.fn) {
            throw new Error("Only one listener can be registered.");
        }
        this.onaudioprocess = 'handleEvent' in listener ? listener.handleEvent : listener;
    }
    removeEventListener(type, listener, options) {
        if (type != "audioprocess") {
            throw new Error("Only audioprocess event is supported.");
        }
        if (this.fn && this.fn != listener) {
            throw new Error("Listener not registered.");
        }
        this.fn = undefined;
    }
    connect(_0 = undefined, _1 = undefined, _2 = undefined) {
        this.client.nodePromise.then(node => {
            node.connect(_0, _1, _2);
        });
        return _0;
    }
    disconnect(_0 = undefined, _1 = undefined, _2 = undefined) {
        this.client.nodePromise.then(node => {
            node.disconnect(_0, _1, _2);
        });
    }
    dispatchEvent(event) {
        throw new Error("Method not implemented.");
    }
}
export class WorkletClient extends ToStringAndUUID {
    constructor(workletPath = "WORKLET_PATH", workletName = "WORKLET_NAME", workletOptions) {
        super();
        this.nodePromise = this.audioContext.audioWorklet.addModule(workletPath).then(() => {
            return new AudioWorkletNode(this.audioContext, workletName, workletOptions);
        }, e => {
            throw new Error(`Worklet module ${workletPath} not found. Original error: ${e.message}`);
        });
    }
    setFunction(fn) {
        this.nodePromise.then(node => {
            //node.port.postMessage(serializeWorkletMessage(fn, 'none'))
        });
    }
}
// BEGIN ScriptProcessorNode llifylop
window.ScriptProcessorNode = ScriptProcessorNode;
const nativeConnect = AudioNode.prototype.connect;
AudioNode.prototype.connect = function connect(destinationNode, _1, _2) {
    if (destinationNode instanceof ScriptProcessorNode) {
        destinationNode.client.nodePromise.then(node => {
            this.connect(node, _1, _2);
        });
        return destinationNode;
    }
    else if (destinationNode instanceof AudioParam) {
        return nativeConnect.bind(this)(destinationNode, _1);
    }
    else {
        return nativeConnect.bind(this)(destinationNode, _1, _2);
    }
};
const nativeDisconnect = AudioNode.prototype.disconnect;
AudioNode.prototype.disconnect = function disconnect(destinationNode, _1, _2) {
    if (destinationNode instanceof ScriptProcessorNode) {
        destinationNode.client.nodePromise.then(node => {
            this.disconnect(node, _1, _2);
        });
    }
    else if (isFinite(destinationNode)) {
        return nativeDisconnect.bind(this)(destinationNode);
    }
    else {
        return nativeDisconnect.bind(this)(destinationNode, _1, _2);
    }
};
const hasInstance = AudioNode[Symbol.hasInstance];
Object.defineProperty(AudioNode, Symbol.hasInstance, {
    value: function (value) {
        return hasInstance.bind(this)(value) || (value instanceof ScriptProcessorNode && this == AudioNode);
    }
});
BaseAudioContext.prototype.createScriptProcessor = function createScriptProcessor(__unused__, numberOfInputChannels = 2, numberOfOutputChannels = 2) {
    return new ScriptProcessorNode(this, numberOfInputChannels, numberOfOutputChannels);
};
// END ScriptProcessorNode llifylop
