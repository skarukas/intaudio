import { ToStringAndUUID } from "./base/ToStringAndUUID.js"
import { lazyProperty } from "./decorators.js"
import { getNumInputChannels, getNumOutputChannels } from "./multichannel.js"
import { ObjectOf, WebAudioConnectable } from "./types.js"


class ConnectOperation {
  constructor(
    public source: AudioNode,
    public destination: WebAudioConnectable,
    public fromIndex?: number,
    public toIndex?: number) { }
  execute() {
    if (this.destination instanceof AudioNode) {
      this.source.connect(this.destination, this.fromIndex, this.toIndex)
    } else {
      this.source.connect(this.destination, this.fromIndex)
    }
  }
  undo() {
    ConnectOperation.simpleDisconnect(
      this.source,
      this.destination,
      this.fromIndex,
      this.toIndex
    )
  }

  static simpleConnect(
    sourceNode: AudioNode,
    destinationNode: WebAudioConnectable,
    outputIndex?: number,
    inputIndex?: number
  ): ConnectOperation {
    const connection = new ConnectOperation(
      sourceNode,
      destinationNode,
      outputIndex,
      inputIndex
    )
    connection.execute()
    return connection
  }

  static simpleDisconnect(
    sourceNode: AudioNode,
    destinationNode?: WebAudioConnectable,
    outputIndex?: number,
    inputIndex?: number
  ) {
    if (destinationNode instanceof AudioNode) {
      sourceNode.disconnect(destinationNode, outputIndex as any, inputIndex as any)
    } else {
      sourceNode.disconnect(destinationNode as any, outputIndex as any)
    }
  }
}

export abstract class BaseAudioPort extends ToStringAndUUID { }

export class NodeOutputPort extends BaseAudioPort {
  // Map from [inputPort, fromChannel, toChannel] -> Connection
  protected executedConnections: Map<NodeInputPort, ObjectOf<ObjectOf<ConnectOperation>>> = new Map()
  numChannels: number

  constructor(public node: AudioNode, public outputIndex?: number) {
    super()
    this.numChannels = getNumOutputChannels(this.node)
  }
  @lazyProperty((ths: NodeOutputPort) => {
    const splitter = ths.audioContext.createChannelSplitter(ths.numChannels)
    ConnectOperation.simpleConnect(ths.node, splitter)
    return splitter
  })
  splitter!: ChannelSplitterNode

  protected getConnection(
    destination: NodeInputPort,
    fromChannel: number,
    toChannel: number
  ): ConnectOperation | undefined {
    return this.executedConnections.get(destination)?.[fromChannel]?.[toChannel]
  }

  protected setConnection(
    destination: NodeInputPort,
    fromChannel: number,
    toChannel: number,
    connection: ConnectOperation
  ) {
    const fromChannelObj = this.executedConnections.get(destination) ?? {}
    const toChannelObj = fromChannelObj[fromChannel] ?? {}
    toChannelObj[toChannel] = connection
    fromChannelObj[fromChannel] = toChannelObj
    this.executedConnections.set(destination, fromChannelObj)
  }
  connect(
    destination: NodeInputPort,
    fromChannel?: number,
    toChannel?: number
  ) {
    const sourceNode = fromChannel == undefined ? this.node : this.splitter
    const destinationNode = toChannel == undefined ? destination.node : destination.merger
    const connection = ConnectOperation.simpleConnect(
      sourceNode,
      destinationNode,
      fromChannel ?? this.outputIndex,
      toChannel ?? destination.inputIndex
    )
    this.setConnection(
      destination,
      fromChannel ?? -1,
      toChannel ?? -1,
      connection
    )
  }
  disconnect(
    destination?: NodeInputPort,
    fromChannel?: number,
    toChannel?: number
  ) {
    if (destination == undefined) {
      ConnectOperation.simpleDisconnect(this.node)
    } else {
      // TODO: disconnect all channel-specific connections when fromChannel / 
      // toChannel is undefined.
      const connection = this.getConnection(
        destination,
        fromChannel ?? -1,
        toChannel ?? -1,
      )
      connection?.undo()
    }
  }
}

export class NodeInputPort extends BaseAudioPort {
  numChannels: number
  constructor(public node: WebAudioConnectable, public inputIndex?: number) {
    super()
    this.numChannels = getNumInputChannels(this.node)
  }
  @lazyProperty((ths: NodeInputPort) => {
    const merger = ths.audioContext.createChannelMerger(ths.numChannels)
    ConnectOperation.simpleConnect(merger, ths.node)
    return merger
  })
  merger!: ChannelMergerNode
}