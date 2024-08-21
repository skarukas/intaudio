import { AudioRateOutput } from "../io/output/AudioRateOutput.js";
import { ToStringAndUUID } from "./base/ToStringAndUUID.js";
import { range } from "./util.js";

type NodeInfo = {
  analyzers: AnalyserNode[],
  formatString: string
}

function numberToString(n: number) {
  return n >= 0.1 ? n.toPrecision(4) : n.toExponential(4)
}

function getFormattedChannelData(node: NodeInfo): string {
  const values = node.analyzers.map(getCurrentSignalValue)
  const valueStrings = values.map(numberToString).join(", ")
  return node.formatString.replace(/\{\w*\}/g, `[${valueStrings}]`)
}
function getCurrentSignalValue(analyzer: AnalyserNode): number {
  const dataArray = new Float32Array(1)
  analyzer.getFloatTimeDomainData(dataArray)
  return dataArray[0]
}

export class SignalLogger extends ToStringAndUUID {
  analysers: NodeInfo[] = []
  protected interval: number | undefined

  constructor(public samplePeriodMs: number = 1000) {
    super()
    this.start()
  }
  start() {
    this.stop()
    this.interval = window.setInterval(() => {
      if (!this.analysers.length) return
      const messages = this.analysers.map(getFormattedChannelData)
      const logString = messages.join("\n")
      console.log(logString)
    }, this.samplePeriodMs)
  }
  stop() {
    clearInterval(this.interval)
  }
  /**
   * Register a node to be monitored.
   */
  register(output: AudioRateOutput, formatString: string) {
    const splitter = this.audioContext.createChannelSplitter(output.numOutputChannels)
    output.connect(splitter)
    const analyzers = []
    for (const i of range(output.numOutputChannels)) {
      const analyzer = this.audioContext.createAnalyser()
      splitter.connect(analyzer, i)
      analyzers.push(analyzer)
    }
    this.analysers.push({ formatString, analyzers })
  }
  // TODO: enable logging for FFT signals.
}