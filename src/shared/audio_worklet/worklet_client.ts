/** 
 * Dead code left over from trying to polyfill / llifylop ScriptProcessorNode.
 **/

import { ToStringAndUUID } from "../base/ToStringAndUUID.js"
import { serializeFunction } from "./worklet.js"



export class ScriptProcessorNode implements ScriptProcessorNode {
  __isScriptProcessorShim: boolean = true
  client: WorkletClient
  numberOfOutputChannels: number
  bufferSize: number = 128
  numberOfInputs: number = 1
  numberOfOutputs: number = 1
  channelCount: number
  channelCountMode: ChannelCountMode = "explicit"
  channelInterpretation: ChannelInterpretation = "speakers"
  context: BaseAudioContext
  private fn: (this: ScriptProcessorNode, ev: AudioProcessingEvent) => any
  set onaudioprocess(fn: (this: ScriptProcessorNode, ev: AudioProcessingEvent) => any) {
    this.fn = fn
    this.client.setFunction(fn)
  }
  get onaudioprocess() {
    return this.fn
  }

  constructor(
    audioContext?: BaseAudioContext,
    numberOfInputChannels: number = 2,
    numberOfOutputChannels: number = 2,
    { workletName = "WORKLET_NAME", workletPath = "WORKLET_PATH" } = {}
  ) {
    this.channelCount = numberOfInputChannels
    this.numberOfOutputChannels = numberOfOutputChannels
    this.context = audioContext
    this.client = new WorkletClient(
      workletPath,
      workletName,
      {
        outputChannelCount: [numberOfOutputChannels],
        numberOfInputs: 1,
        numberOfOutputs: 1,
      })
  }

  addEventListener<K extends "audioprocess">(type: K, listener: (this: ScriptProcessorNode, ev: ScriptProcessorNodeEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void
  addEventListener(type: unknown, listener: EventListenerOrEventListenerObject, options?: unknown): void {
    if (type != "audioprocess") {
      throw new Error("Only audioprocess event is supported.")
    }
    if (this.fn) {
      throw new Error("Only one listener can be registered.")
    }
    this.onaudioprocess = 'handleEvent' in listener ? listener.handleEvent : listener
  }
  removeEventListener<K extends "audioprocess">(type: K, listener: (this: ScriptProcessorNode, ev: ScriptProcessorNodeEventMap[K]) => any, options?: boolean | EventListenerOptions): void
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void
  removeEventListener(type: unknown, listener: unknown, options?: unknown): void {
    if (type != "audioprocess") {
      throw new Error("Only audioprocess event is supported.")
    }
    if (this.fn && this.fn != listener) {
      throw new Error("Listener not registered.")
    }
    this.fn = undefined
  }

  connect(destinationNode: AudioNode, output?: number, input?: number): AudioNode
  connect(destinationParam: AudioParam, output?: number): void
  connect(_0 = undefined, _1 = undefined, _2 = undefined): void | AudioNode {
    this.client.nodePromise.then(node => {
      node.connect(_0, _1, _2)
    })
    return _0
  }
  disconnect(): void
  disconnect(output: number): void
  disconnect(destinationNode: AudioNode): void
  disconnect(destinationNode: AudioNode, output: number): void
  disconnect(destinationNode: AudioNode, output: number, input: number): void
  disconnect(destinationParam: AudioParam): void
  disconnect(destinationParam: AudioParam, output: number): void
  disconnect(_0 = undefined, _1 = undefined, _2 = undefined): void {
    this.client.nodePromise.then(node => {
      node.disconnect(_0, _1, _2)
    })
  }
  dispatchEvent(event: Event): boolean
  dispatchEvent(event: Event): boolean
  dispatchEvent(event: unknown): boolean {
    throw new Error("Method not implemented.")
  }
}


export class WorkletClient extends ToStringAndUUID {
  nodePromise: Promise<AudioWorkletNode>
  constructor(
    workletPath: string = "WORKLET_PATH",
    workletName: string = "WORKLET_NAME",
    workletOptions?: AudioWorkletNodeOptions
  ) {
    super()
    this.nodePromise = this.audioContext.audioWorklet.addModule(workletPath).then(() => {
      return new AudioWorkletNode(this.audioContext, workletName, workletOptions)
    }, e => {
      throw new Error(`Worklet module ${workletPath} not found. Original error: ${e.message}`)
    })
  }
  setFunction(fn: Function) {
    this.nodePromise.then(node => {
      node.port.postMessage(serializeFunction(fn, 'none'))
    })
  }
}

// BEGIN ScriptProcessorNode llifylop
window.ScriptProcessorNode = ScriptProcessorNode

const nativeConnect = AudioNode.prototype.connect
AudioNode.prototype.connect = function connect(destinationNode, _1?, _2?) {
  if (destinationNode instanceof ScriptProcessorNode) {
    destinationNode.client.nodePromise.then(node => {
      this.connect(node, _1, _2)
    })
    return destinationNode
  } else if (destinationNode instanceof AudioParam) {
    return nativeConnect.bind(this)(destinationNode, _1)
  } else {
    return nativeConnect.bind(this)(destinationNode, _1, _2)
  }
}

const nativeDisconnect = AudioNode.prototype.disconnect
AudioNode.prototype.disconnect = function disconnect(destinationNode?, _1?, _2?) {
  if (destinationNode instanceof ScriptProcessorNode) {
    destinationNode.client.nodePromise.then(node => {
      this.disconnect(node, _1, _2)
    })
  } else if (isFinite(destinationNode)) {
    return nativeDisconnect.bind(this)(destinationNode)
  } else {
    return nativeDisconnect.bind(this)(destinationNode, _1, _2)
  }
}
const hasInstance = AudioNode[Symbol.hasInstance]
Object.defineProperty(AudioNode, Symbol.hasInstance, {
  value: function (value): boolean {
    return hasInstance.bind(this)(value) || (value instanceof ScriptProcessorNode && this == AudioNode)
  }
})

BaseAudioContext.prototype.createScriptProcessor = function createScriptProcessor(
  __unused__?: number,
  numberOfInputChannels: number = 2,
  numberOfOutputChannels: number = 2
): ScriptProcessorNode {
  return new ScriptProcessorNode(
    this,
    numberOfInputChannels,
    numberOfOutputChannels
  )
}

// END ScriptProcessorNode llifylop