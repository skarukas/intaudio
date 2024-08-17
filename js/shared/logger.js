import { ToStringAndUUID } from "./base/ToStringAndUUID.js";
import { range } from "./util.js";
function numberToString(n) {
    return n >= 0.1 ? n.toPrecision(4) : n.toExponential(4);
}
function getFormattedChannelData(node) {
    const values = node.analyzers.map(getCurrentSignalValue);
    const valueStrings = values.map(numberToString).join(", ");
    return node.formatString.replace(/\{\w*\}/g, `[${valueStrings}]`);
}
function getCurrentSignalValue(analyzer) {
    const dataArray = new Float32Array(1);
    analyzer.getFloatTimeDomainData(dataArray);
    return dataArray[0];
}
export class SignalLogger extends ToStringAndUUID {
    constructor(samplePeriodMs = 1000) {
        super();
        this.samplePeriodMs = samplePeriodMs;
        this.analysers = [];
        this.start();
    }
    start() {
        this.stop();
        this.interval = window.setInterval(() => {
            const messages = this.analysers.map(getFormattedChannelData);
            const logString = messages.join("\n");
            console.log(logString);
        }, this.samplePeriodMs);
    }
    stop() {
        clearInterval(this.interval);
    }
    /**
     * Register a node to be monitored.
     */
    register(output, formatString) {
        const splitter = this.audioContext.createChannelSplitter(output.numOutputChannels);
        output.connect(splitter);
        const analyzers = [];
        for (const i of range(output.numOutputChannels)) {
            const analyzer = this.audioContext.createAnalyser();
            splitter.connect(analyzer, i);
            analyzers.push(analyzer);
        }
        this.analysers.push({ formatString, analyzers });
    }
}
