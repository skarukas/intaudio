const _MUTED_CLASS = "component-muted"
const _BYPASSED_CLASS = "component-bypassed"
const _COMPONENT_CONTAINER_CLASS = "modular-container"
const _KEYBOARD_KEY_CLASS = "keyboard-key"
const _KEYBOARD_KEY_PRESSED_CLASS = "keyboard-key-pressed"
const _BYPASS_INDICATOR_CLASS = "bypass-indicator"
const _MONITOR_VALUE_CLASS = "monitor-value"
const _MONITOR_OUT_OF_BOUNDS_CLASS = "monitor-out-of-bounds"

const _EVENT_MOUSEDOWN = "mousedown"
const _EVENT_MOUSEUP = "mouseup"

// TODO: transform constructors and some functions to take in objects instead 
// of a list of parameters (can't specify named parameters)

class ToStringAndUUID {
  constructor() {
    this._uuid = crypto.randomUUID()
  }
  get _className() {
    return this.constructor.name
  }
  toString() {
    return this._className
  }
}

class HasScope extends ToStringAndUUID {
  get scope() {
    return _GLOBAL_SCOPE
  }
  get audioContext() {
    return this.scope.audioContext
  }
  get _() { // Internal namespace in the same scope.
    return this.scope.internals
  }
  get scopeId() {
    return this.scope.id
  }
}


class Connectable extends HasScope {
  connect(destination) {}
  getDestinationInfo(destination) {
    if (destination instanceof Function) {
      destination = new this._.FunctionComponent(destination)
    }
    let component, input;
    if ((destination instanceof AudioNode)
      || (destination instanceof AudioParam)) {
      component = new this._.AudioComponent(destination)
      input = component.getDefaultInput()
    } else if (destination instanceof AbstractInput) {
      component = destination.parent
      input = destination
    } else if (destination instanceof BaseComponent) {
      component = destination
      input = destination.getDefaultInput()
    } else {
      throw new Error("Improper input type for connect(). " + destination)
    }
    if (destination.scopeId && destination.scopeId != this.scopeId) {
      throw new Error(`Unable to connect components from different scopes. Given ${this} (scope ID: ${this.scopeId}) and ${destination} (scope ID: ${destination.scopeId})`)
    }
    return { component, input }
  }
}

class BaseEvent extends ToStringAndUUID {
  _isLocal = false
  #defaultIgnored = false
  ignoreDefault() {
    this.#defaultIgnored = true
  }
  defaultIsIgnored() {
    return this.#defaultIgnored
  }
}

class BypassEvent extends BaseEvent {
  _isLocal = true
  constructor(shouldBypass) {
    super()
    this.shouldBypass = shouldBypass
  }
}

class MuteEvent extends BaseEvent {
  _isLocal = true
  constructor(shouldMute) {
    super()
    this.shouldMute = shouldMute
  }
}
const KeyEventType = {
  KEY_DOWN: 'keydown',
  KEY_UP: 'keyup'
}

class KeyEvent extends BaseEvent {
  constructor(eventType, eventPitch = 64, eventVelocity = 64, key = null) {
    super()
    this.eventType = eventType
    this.eventPitch = eventPitch
    this.eventVelocity = eventVelocity
    this.key = key ?? eventPitch
  }
}

class HandlerMixin extends Connectable {

  #getHandlers() {
    return [
      { class: BaseEvent, callback: this.onAnyEvent },
      { class: MuteEvent, callback: this.onMuteEvent },
      { class: BypassEvent, callback: this.onBypassEvent },
      { class: KeyEvent, callback: this.onKeyEvent },
    ]
  }

  onMuteEvent(event) { }
  onAnyEvent(event) { }
  onBypassEvent(event) { }
  onKeyEvent(event) { }

  _handleEvent(event) {
    for (let handler of this.#getHandlers()) {
      if (event instanceof handler.class) {
        handler.callback.bind(this)(event)
      }
    }
  }
}

class AbstractOutput extends Connectable {
  connections = []
  callbacks = []
  connect(destination) { }
}

class ControlOutput extends AbstractOutput {
  connect(destination) {
    this.connections.push(destination)
    return destination
  }
  update(value) {
    for (let c of this.connections) {
      c.setValue(value)
    }
    for (const callback of this.callbacks) {
      callback(value)
    }
  }
  onUpdate(callback) {
    this.callbacks.push(callback)
  }
  setValue(value) {
    this.update(value)
  }
}

function createConstantSource(audioContext) {
  let src = audioContext.createConstantSource()
  src.offset.setValueAtTime(0, audioContext.currentTime)
  src.start()
  return src
}

// TODO: Add a GainNode here to allow muting and mastergain of the component.
class AudioRateOutput extends AbstractOutput {
  constructor(audioNode) {
    super()
    this.audioNode = audioNode
  }
  connect(destination) {
    let { component, input } = this.getDestinationInfo(destination)
    if (!(input instanceof AudioRateInput)) {
      throw new Error(`Can only connect audio-rate outputs to inputs that support audio-rate signals. Given: ${input}. Use ${AudioRateSignalSampler.name} to force a conversion.`)
    }
    input.audioSink && this.audioNode.connect(input.audioSink)
    this.connections.push(input)
    component?.wasConnectedTo(this)
    return component
  }
  sampleSignal(samplePeriodMs = _GLOBAL_STATE.defaultSamplePeriodMs) {
    return this.connect(new this._.AudioRateSignalSampler(samplePeriodMs))
  }
}


class AbstractInput extends HasScope {
  constructor(parent, isRequired) {
    super()
    this.parent = parent
    this.isRequired = isRequired
  }
  get value() { }
  setValue(value) { }
  trigger() {
    this.setValue(TRIGGER)
  }
}

// Special placeholder for when an input both has no defaultValue and it has 
// never been set. Not using undefined or null because these can potentially be 
// set as "legitimate" args by the caller.
// TODO: need special value?
const _UNSET_VALUE = undefined // Symbol("UNSET")

class ControlInput extends AbstractInput {
  _value
  constructor(parent, defaultValue = _UNSET_VALUE, isRequired = false) {
    super(parent, isRequired)
    this._value = defaultValue
  }
  get value() {
    return this._value
  }
  setValue(value) {
    if (value == TRIGGER && this.value != undefined) {
      value = this.value
    }
    this._value = value
    this.parent?.propagateUpdatedInput(this, value)
  }
}

const TRIGGER = Symbol('trigger')

class AudioRateInput extends AbstractInput {
  constructor(parent, audioSink) {
    super(parent, false)
    this.audioSink = audioSink
  }
  get value() {
    return this.audioSink.value
  }
  setValue(value) {
    if (value == TRIGGER) {
      value = this.value
    }
    this.audioSink.value = value
  }
}

class HybridInput extends AudioRateInput {
  _value
  // Hybrid input can connect an audio input to a sink, but it also can
  // receive control inputs.
  constructor(parent, audioSink, defaultValue = _UNSET_VALUE, isRequired = false) {
    super(parent, audioSink)
    this._value = defaultValue
    this.isRequired = isRequired
  }
  get value() {
    return this._value
  }
  setValue(value) {
    if (value == TRIGGER && this.value != undefined) {
      value = this.value
    }
    this._value = value
    this.audioSink.value = value
    this.parent?.propagateUpdatedInput(this, value)
  }
}


class DefaultInput extends AudioRateInput {
  constructor(parent, wrappedInput=undefined) {
    super(parent, wrappedInput?.audioSink)
    this.defaultInput = wrappedInput
    this._value = wrappedInput?.value
  }
  setValue(value) {
    // JS objects represent collections of parameter names and values
    const isPlainObject = value.constructor === Object
    if (isPlainObject && !value._raw) {
      // Validate each param is defined in the target.
      for (let key in value) {
        if (!(key in this.parent.inputs)) {
          throw new Error(`Given parameter object ${JSON.stringify(value)} but destination ${this.parent} has no input named '${key}'. To pass a raw object without changing properties, set _raw: true on the object.`)
        }
      }
      for (let key in value) {
        this.parent.inputs[key].setValue(value[key])
      }
    } else if (this.defaultInput == undefined) {
      throw new Error(`Component ${this.parent} unable to receive input because it has no default input configured. Either connect to one of its named inputs [${Object.keys(destination.inputs)}], or send a message as a plain JS object, with one or more input names as keys.`)
    } else {
      isPlainObject && delete value._raw
      this.defaultInput.setValue(value)
    }
  }
}

class HybridOutput extends AudioRateOutput {
  constructor(audioNode) {
    super()
    this.audioNode = audioNode
  }
  connect(destination) {
    let { input } = this.getDestinationInfo(destination)
    if (input instanceof AudioRateInput) {
      return AudioRateOutput.prototype.connect.bind(this)(destination)
    } else if (input instanceof ControlInput) {
      return ControlOutput.prototype.connect.bind(this)(destination)
    } else {
      throw new Error("Unable to connect to " + destination)
    }
  }
  update(value) {
    for (let c of this.connections) {
      c.setValue(value)
    }
  }
}


class BaseComponent extends HandlerMixin {
  outputs = {}
  inputs = {}
  _defaultInput
  _defaultOutput
  constructor() {
    super()
    // Reserved default inputs.
    this.isBypassed = this._defineControlInput('isBypassed', false)
    this.isMuted = this._defineControlInput('isMuted', false)
    this.triggerInput = this._defineControlInput('triggerInput')

    // Special inputs that are not automatically set as default I/O.
    this._reservedInputs = [this.isBypassed, this.isMuted, this.triggerInput]
    this._reservedOutputs = []
    this._preventIOOverwrites()
  }

  toString() {
    function _getNames(obj, except) {
      let entries = Object.keys(obj).filter(i => !except.includes(obj[i]))
      if (entries.length == 1) {
        return `${entries.join(", ")}`
      }
      return `(${entries.join(", ")})`
    }
    let inp = _getNames(this.inputs, this._reservedInputs)
    let out = _getNames(this.outputs, this._reservedOutputs)
    return `${this._className}(${inp} => ${out})`
  }
  _now() {
    return this.audioContext.currentTime
  }
  _validateIsSingleton() {
    if (this.constructor.__instanceExists) {
      throw new Error(`Only one instance of ${this.constructor} can exist.`)
    }
    this.constructor.__instanceExists = true
  }

  _preventIOOverwrites() {
    Object.keys(this.inputs).map(this.#freezeProperty.bind(this))
    Object.keys(this.outputs).map(this.#freezeProperty.bind(this))
  }
  #freezeProperty(propName) {
    Object.defineProperty(this, propName, {
      writable: false,
      configurable: false
    })
  }
  #defineInputOrOutput(propName, inputOrOutput, inputsOrOutputsArray) {
    inputsOrOutputsArray[propName] = inputOrOutput
    return inputOrOutput
  }

  _defineControlInput(name, defaultValue = _UNSET_VALUE, isRequired = false) {
    let input = new this._.ControlInput(this, defaultValue, isRequired)
    return this.#defineInputOrOutput(name, input, this.inputs)
  }
  _defineAudioInput(name, destinationNode) {
    let input = new this._.AudioRateInput(this, destinationNode)
    return this.#defineInputOrOutput(name, input, this.inputs)
  }
  _defineHybridInput(name, destinationNode, defaultValue = _UNSET_VALUE, isRequired = false) {
    let input = new this._.HybridInput(this, destinationNode, defaultValue, isRequired)
    return this.#defineInputOrOutput(name, input, this.inputs)
  }
  _defineControlOutput(name) {
    let output = new this._.ControlOutput()
    return this.#defineInputOrOutput(name, output, this.outputs)
  }
  _defineAudioOutput(name, audioNode) {
    let output = new this._.AudioRateOutput(audioNode)
    return this.#defineInputOrOutput(name, output, this.outputs)
  }
  _defineHybridOutput(name, audioNode) {
    let output = new this._.HybridOutput(audioNode)
    return this.#defineInputOrOutput(name, output, this.outputs)
  }
  _setDefaultInput(input) {
    this._defaultInput = input
  }
  _setDefaultOutput(output) {
    this._defaultOutput = output
  }
  getDefaultInput() {
    if (this._defaultInput) {
      return new this._.DefaultInput(this, this._defaultInput)
    }
    // Skip reserved inputs, e.g. isMuted / isBypassed
    const ownInputs = Object.values(this.inputs).filter(i => !this._reservedInputs.includes(i))
    if (ownInputs.length == 1) {
      return new this._.DefaultInput(this, ownInputs[0])
    }
    return new this._.DefaultInput(this)
  }

  getDefaultOutput() {
    if (this._defaultOutput) {
      return this._defaultOutput
    }
    // Skip reserved outputs
    const ownOutputs = Object.values(this.outputs).filter(i => !this._reservedOutputs.includes(i))
    if (ownOutputs.length == 1) {
      return ownOutputs[0]
    }
  }

  #allInputsAreDefined() {
    let violations = []
    for (let inputName in this.inputs) {
      let input = this.inputs[inputName]
      if (input.isRequired && input.value == _UNSET_VALUE) {
        violations.push(inputName)
      }
    }
    return !violations.length
    /* if (violations.length) {
      throw new Error(`Unable to run ${this}. The following inputs are marked as required but do not have inputs set: [${violations}]`)
    } */
  }

  propagateUpdatedInput(inputStream, newValue) {
    if (inputStream == this.isBypassed) {
      this.onBypassEvent(newValue)
    } else if (inputStream == this.isMuted) {
      this.onMuteEvent(newValue)
    }
    if (inputStream == this.triggerInput) {
      // Always execute function, even if it's unsafe.
      this.inputDidUpdate(undefined, undefined)
    } else if (this.#allInputsAreDefined()) {
      this.inputDidUpdate(inputStream, newValue)
    }
  }

  // Abstract methods.
  outputAdded(output) { }
  inputAdded(output) { }
  processEvent(event) {
    // Method describing how an incoming event is mutated before passing to the
    // component outputs.
    return event
  }
  inputDidUpdate(input, newValue) { }

  setBypassed(isBypassed = true) {
    this.isBypassed.setValue(isBypassed)
  }
  setMuted(isMuted = true) {
    this.isMuted.setValue(isMuted)
  }

  // OLD STUFF!!

  // Private methods.
  #triggerWithDefaultCallback(event, defaultCallback) {
    // Executes the callback if the event did not have ignoreDefault called.
    this.triggerEvent(event)
    if (!event._defaultIsIgnored) {
      defaultCallback()
    }
  }
  _sendEventToOutputs(event) {
    // Should be called only by the object itself.
    if (!(event._isLocal || this.isMuted.value)) {
      for (let output of this.outputs) {
        output.triggerEvent(event)
      }
    }
  }

  // Public methods not to be overridden.
  triggerEvent(updateEvent) {
    // Should be called by other objects wanting to update state on this one.

    // Update local state.
    this._handleEvent(updateEvent)

    // Propagate.
    if (!(updateEvent._isLocal || this.isMuted.value)) {
      let transformedEvent = (
        this.isBypassed.value ? updateEvent : this.processEvent(updateEvent)
      )
      this._sendEventToOutputs(transformedEvent)
    }
  }

  connect(destination) {
    let { component, input } = this.getDestinationInfo(destination)
    if (!input) {
      throw new Error(`No default input found for ${component}, so unable to connect to it from ${this}. Found named inputs: [${Object.keys(destination.inputs)}]`)
    }
    component && this.outputAdded(input)
    const output = this.getDefaultOutput()
    if (!output) {
      throw new Error(`No default output found for ${this}, so unable to connect to destination: ${component}. Found named outputs: [${Object.keys(this.outputs)}]`)
    }
    output.connect(input)
    return component
  }
  setValues(valueObj) {
    return this.getDefaultInput().setValue(valueObj)
  }
  wasConnectedTo(other) {
    this.inputAdded(other)
    return other
  }
  sampleSignal(samplePeriodMs = _GLOBAL_STATE.defaultSamplePeriodMs) {
    return this.connect(new this._.AudioRateSignalSampler(samplePeriodMs))
  }
}

class AudioComponent extends BaseComponent {
  constructor(inputNode) {
    super()
    this.input = this._defineAudioInput('input', inputNode)
    if (inputNode instanceof AudioNode) {
      this.output = this._defineAudioOutput('output', inputNode)
    } else if (!(inputNode instanceof AudioParam)) {
      throw new Error("AudioComponents must be built from either and AudioNode or AudioParam")
    }
    this._preventIOOverwrites()
  }
}

// TODO: Fix all the displays to work with BaseDisplay.
class BaseDisplay {
  constructor(component) {
    this.component = component
  }
  assertInitialized() {
    if (!$) {
      throw new Error("jquery not found.")
    }
  }
  _display($root, width, height) {
    throw new Error("_display unimplemented.")
  }
  _refreshDisplay(input, newValue) {
    throw new Error("_refreshDisplay() not implemented yet.")
  }
}

class VisualComponent extends BaseComponent {
  $container
  display
  #addBypassIndicator() {
    this.$bypassIndicator = $(document.createElement('span'))
      .addClass(_BYPASS_INDICATOR_CLASS)
    this.$container.append(this.$bypassIndicator)
  }
  #assertDisplayIsUsable() {
    if (this.display == undefined || !(this.display instanceof BaseDisplay)) {
      throw new Error(`No display logic found: invalid ${this._className}.display value. Each VisualComponent must define a 'display' property of type BaseDisplay.`)
    }
    this.display.assertInitialized()
  }
  addToDom(root) {
    this.#assertDisplayIsUsable()
    // Display background during load.
    this.$container = $(root)

    // Container
    let height = Number(this.$container.attr('height'))
    let width = Number(this.$container.attr('width'))
    if (!this.$container.hasClass(_COMPONENT_CONTAINER_CLASS)) {
      this.$container.addClass(_COMPONENT_CONTAINER_CLASS)
      this.#addBypassIndicator()
      //this.$container.css({ width, height })
    }

    // Main component
    let $component = $(document.createElement('div')).css({ width, height}).addClass('component')
    this.$container.append($component)
    this.display._display($component, width, height)
    return $component
  }
  refreshDom() {
    throw new Error("TODO: Remove refreshDom. Individual methods should be written instead.")
    this.#assertDisplayIsUsable()
    if (this.$container) {
      this.display._refreshDisplay(undefined, undefined)
    }
  }
  onMuteEvent(event) {
    if (this.$container) {
      if (event.shouldMute) {
        this.$container.addClass(_MUTED_CLASS)
      } else {
        this.$container.removeClass(_MUTED_CLASS)
      }
    }
  }
  onBypassEvent(event) {
    if (this.$container) {
      if (event.shouldBypass) {
        this.$container.addClass(_BYPASSED_CLASS)
        this.$bypassIndicator?.show()
      } else {
        this.$container.removeClass(_BYPASSED_CLASS)
        this.$bypassIndicator?.hide()
      }
    }
  }
}

class IgnoreDuplicates extends BaseComponent {
  #value
  constructor() {
    super()
    this.input = this._defineControlInput('input')
    this.output = this._defineControlOutput('output')
  }
  inputDidUpdate(input, newValue) {
    if (newValue != this.#value) {
      this.output.update(newValue)
      this.#value = newValue
    }
  }
}

class AudioRateSignalSampler extends BaseComponent {
  #interval
  // Utility for converting an audio-rate signal into a control signal.
  constructor(samplePeriodMs = _GLOBAL_STATE.defaultSamplePeriodMs) {
    super()
    this._analyzer = this.audioContext.createAnalyser()

    // Inputs
    this.samplePeriodMs = this._defineControlInput('samplePeriodMs', samplePeriodMs)
    this.audioInput = this._defineAudioInput('audioInput', this._analyzer)
    this._setDefaultInput(this.audioInput)

    // Output
    this.controlOutput = this._defineControlOutput('controlOutput')
    this._preventIOOverwrites()
  }
  #getCurrentSignalValue() {
    const dataArray = new Float32Array(1)
    this._analyzer.getFloatTimeDomainData(dataArray)
    return dataArray[0]
  }
  #setInterval(period) {
    this.#interval = setInterval(() => {
      try {
        const signal = this.#getCurrentSignalValue()
        this.controlOutput.update(signal)
      } catch (e) {
        this.stop()
        throw e
      }
    }, period)
  }
  stop() {
    // TODO: figure out how to actually stop this...
    clearInterval(this.#interval)
  }
  inputAdded(input) {
    if (this.#interval) {
      throw new Error("AudioToControlConverter can only have one input.")
    }
    this.#setInterval(this.samplePeriodMs.value)
  }

  inputDidUpdate(input, newValue) {
    if (input == this.samplePeriodMs) {
      this.stop()
      this.#setInterval(newValue)
    }
  }
}


class ScrollingAudioMonitorDisplay extends BaseDisplay {
  _display($container, width, height) {
    let size = {
      width: width,
      height: height,
    }
    this.$canvas = $(document.createElement('canvas')).css(size).attr(size)
    this.$minValueDisplay = $(document.createElement('span'))
      .addClass(_MONITOR_VALUE_CLASS)
      .css("bottom",  "5px")
    this.$maxValueDisplay = $(document.createElement('span'))
      .addClass(_MONITOR_VALUE_CLASS)
      .css("top",  "5px")
    $container.append(this.$canvas, this.$minValueDisplay, this.$maxValueDisplay)
    this.$container = $container
    this.updateWaveformDisplay()
  }
  updateWaveformDisplay() {
    if (this.$container) {
      const { minValue, maxValue } = this.component.getCurrentValueRange()
      this.$minValueDisplay.text(this.#valueToDisplayableText(minValue))
      this.$maxValueDisplay.text(this.#valueToDisplayableText(maxValue))
      this.#displayWaveform(minValue, maxValue)
    }
  }
  #valueToDisplayableText(value) {
    if (value == "auto") {
      return ""
    } else {
      return value.toFixed(2)
    }
  }
  #displayWaveform(minValue, maxValue) {
    let maxX = this.$canvas.attr('width')
    let memory = this.component._memory
    let entryWidth = maxX / memory.length
    let maxY = this.$canvas.attr('height')
    const canvas = this.$canvas[0]

    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let hasOutOfBoundsValues = false
    const toX = i => i * entryWidth
    const toY = v => {
      let zeroOneScaled = (v - minValue) / (maxValue - minValue)
      let coordValue = (1 - zeroOneScaled) * maxY
      hasOutOfBoundsValues = hasOutOfBoundsValues 
        || v && ((coordValue > maxY) || (coordValue < 0))
      return coordValue
    }
    // Draw 0 line
    const zeroY = toY(0)
    if (zeroY <= maxY) {
      ctx.strokeStyle = "rgba(255, 0, 0, 0.6)";
      ctx.beginPath()
      ctx.moveTo(0, zeroY)
      ctx.lineTo(maxX, zeroY);
      ctx.stroke();
    }

    // Draw graph
    ctx.beginPath();
    ctx.strokeStyle = "black";
    for (let i = 0; i < memory.length; i++) {
      if (this.component.hideZeroSignal.value) {
        if (memory[i]) {
          ctx.lineTo(toX(i), toY(memory[i]));
          ctx.stroke();  
        } else {
          ctx.beginPath();
        }
      } else {
        // undefined if out of the memory range.
        if (memory[i] != undefined) {
          ctx.lineTo(toX(i), toY(memory[i]));
          ctx.stroke();  
        } else {
          ctx.beginPath();
        }
      }
    }

    // Warn user visually if the range of the signal is not captured.
    if (hasOutOfBoundsValues) {
      this.$container.addClass(_MONITOR_OUT_OF_BOUNDS_CLASS)
    } else {
      this.$container.removeClass(_MONITOR_OUT_OF_BOUNDS_CLASS)
    }
  }
}

// TODO: this has a limited sample rate. Instead, develop an "oscilloscope" 
// one that captures N samples and displays them all at the same time.
class ScrollingAudioMonitor extends VisualComponent {
  constructor(
    samplePeriodMs=_GLOBAL_STATE.defaultSamplePeriodMs,
    memorySize=128,
    minValue='auto',
    maxValue='auto',
    hideZeroSignal=true
  ) {
    super()
    this.display = new this._.ScrollingAudioMonitorDisplay(this)
    this._sampler = new this._.AudioRateSignalSampler(samplePeriodMs)
    this._passthrough = createConstantSource(this.audioContext)

    // Inputs
    this.samplePeriodMs = this._defineControlInput('samplePeriodMs', samplePeriodMs)
    this.memorySize = this._defineControlInput('memorySize', memorySize)
    this.minValue = this._defineControlInput('minValue', minValue)
    this.maxValue = this._defineControlInput('maxValue', maxValue)
    this.hideZeroSignal = this._defineControlInput('hideZeroSignal', hideZeroSignal)
    this.input = this._defineAudioInput('input', this._passthrough.offset)
    this._setDefaultInput(this.input)

    // Output
    this.audioOutput = this._defineAudioOutput('audioOutput', this._passthrough)
    this.controlOutput = this._defineControlOutput('controlOutput')

    // Routing
    this.audioOutput.connect(this._sampler.audioInput)
    this._sampler.controlOutput.connect(this.controlOutput)
    this._sampler.controlOutput.onUpdate(v => {
      this.#addToMemory(v)
      this.display.updateWaveformDisplay()
    })

    this._memory = Array(this.memorySize.value).fill(0.)
    this._preventIOOverwrites()
  }
  inputDidUpdate(input, newValue) {
    if (input == this.memorySize) {
      throw new Error("Can't update memorySize yet.")
    } else if (input == this.samplePeriodMs) {
      this._sampler.samplePeriodMs.update(newValue)
    }
  }
  #addToMemory(v) {
    this._memory.push(v)
    if (this._memory.length > this.memorySize.value) {
      this._memory.shift()
    }
  }
  getCurrentValueRange() {
    let minValue = this.minValue.value == 'auto' ? Math.min(...this._memory) : this.minValue.value
    let maxValue = this.maxValue.value == 'auto' ? Math.max(...this._memory) : this.maxValue.value
    let isEmptyRange = (minValue == maxValue)
    if (!Number.isFinite(minValue) || isEmptyRange) {
      minValue = -1
    }
    if (!Number.isFinite(maxValue) || isEmptyRange) {
      maxValue = 1
    }
    return {minValue, maxValue}
  }
}

class Wave extends BaseComponent {
  static Type = {
    SINE: "sine",
    SQUARE: "square", 
    SAWTOOTH: "sawtooth",
    TRIANGLE: "triangle"
    // TODO: add more
  }
  constructor(wavetableOrType, frequency) {
    super()
    let waveType, wavetable;
    if (wavetableOrType in Object.values(Wave.Type)) {
      waveType = wavetableOrType
    } else if (wavetableOrType instanceof PeriodicWave) {
      wavetable = wavetableOrType
      waveType = 'custom'
    }
    this._oscillatorNode = new OscillatorNode(this.audioContext, { 
      type: waveType,
      frequency: frequency,
      periodicWave: wavetable
    })
    this._oscillatorNode.start()
    this.type = this._defineControlInput('type', waveType)
    this.waveTable = this._defineControlInput('waveTable', wavetable)
    this.frequency = this._defineAudioInput('frequency', this._oscillatorNode.frequency)

    this.output = this._defineAudioOutput('output', this._oscillatorNode)
  }
  inputDidUpdate(input, newValue) {
    if (input == this.waveTable) {
      this._oscillatorNode.setPeriodicWave(newValue)
    } else if (input == this.type) {
      this._oscillatorNode.type = newValue
    }
  }
  static fromPartials(frequency, magnitudes, phases=undefined) {
    let realCoefficients = []
    let imagCoefficients = []
    for (let i = 0; i < magnitudes.length; i++) {
      let theta = phases?.at(i) ?? 0
      let r = magnitudes[i]
      realCoefficients.push(r * Math.cos(theta))
      imagCoefficients.push(r * Math.sin(theta))
    }
    // this == class in static contexts.
    return this.fromCoefficients(frequency, realCoefficients, imagCoefficients)
  }
  static fromCoefficients(frequency, real, imaginary) {
    const wavetable = this.audioContext.createPeriodicWave(real, imaginary)
    return new this._.Wave(wavetable)
  }
}


// https://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically
function _getArgs(func) {
  const funcString = func.toString()
  let paramString;
  if (funcString.startsWith('function')) {
    // Normal function
    paramString = funcString
      .replace(/[/][/].*$/mg, '') // strip single-line comments
      .replace(/\s+/g, '') // strip white space
      .replace(/[/][*][^/*]*[*][/]/g, '') // strip multi-line comments  
      .split('){', 1)[0].replace(/^[^(]*[(]/, '') // extract the parameters  
  } else {
    // Arrow function
    paramString = funcString
      .split('=>')[0]
      .trim()
      .replace(")", "")
      .replace("(", "")
      .trim()
  }
  return _parseParamString(paramString)
}

function _parseParamString(paramString) {
  // Parse the string in between parens including the param names.
  if (paramString) {
    return paramString.split(/\s*,\s*/).filter(Boolean).map(param => {
      let p = param.trim()
      let [name, defaultValueString] = p.split("=")
      return { name, hasDefault: Boolean(defaultValueString) }
    })
  } else {
    return []
  }
}


class FunctionComponent extends BaseComponent {
  _orderedFunctionInputs = []
  constructor(fn) {
    super()
    this.fn = fn
    let args = _getArgs(fn)

    // TODO: This assumes each input is mono. This should not be a requirement.
    let numChannelsPerInput = 1 // TODO: Have a way of getting this info
    this._audioProcessor = this._createScriptProcessor(args.length, numChannelsPerInput)
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      const inputName = "$" + arg.name
      const isRequired = !arg.hasDefault
  
      //
      const passThroughInput = createConstantSource(this.audioContext)
      this[inputName] = this._defineHybridInput(inputName, passThroughInput.offset, _UNSET_VALUE, isRequired)
      for (let c = 0; c < numChannelsPerInput; c++) {
        const fromChannel = c
        const toChannel = numChannelsPerInput*i + c
        passThroughInput.connect(this.channelMerger, fromChannel, toChannel)
      }
      //

      // this[inputName] = this._defineHybridInput(inputName, this._audioProcessor, _UNSET_VALUE, isRequired)
      this._orderedFunctionInputs.push(this[inputName])
    }
    let requiredArgs = args.filter(a => !a.hasDefault)
    if (requiredArgs.length == 1) {
      this._setDefaultInput(this["$" + requiredArgs[0].name])
    }
    this.output = this._defineHybridOutput('output', this._audioProcessor)
    this._preventIOOverwrites()
  }
  _createScriptProcessor(numInputs, numChannelsPerInput) {
    const bufferSize = undefined  // 256
    let numInputChannels = (numChannelsPerInput * numInputs) || 1
    this.channelMerger = this.audioContext.createChannelMerger(numInputChannels)
    let processor = this.audioContext.createScriptProcessor(bufferSize, numInputChannels, numChannelsPerInput)
    this.channelMerger.connect(processor)

    function _getTrueChannels(buffer) {
      // Returns an array of length numChannelsPerInput, and the i'th entry
      // contains the i'th channel for each input.
      let inputsGroupedByChannel = []
      for (let c = 0; c < numChannelsPerInput; c++) {
        let channelData = []
        for (let i = 0; i < numInputs; i++) {
          channelData.push(buffer.getChannelData(c * numChannelsPerInput + i))
        }
        inputsGroupedByChannel.push(channelData)
      }
      return inputsGroupedByChannel
    }
    const handler = e => {
      // Apply the function for each sample in each channel.
      const inputChannels = _getTrueChannels(e.inputBuffer)
      let outputChannels = []
      for (let c = 0; c < numChannelsPerInput; c++) {
        outputChannels.push(e.outputBuffer.getChannelData(c))
      }
      try {
        this.#parallelApplyAcrossChannels(inputChannels, outputChannels)
      } catch (e) {
        processor.removeEventListener('audioprocess', handler)
        throw e
      }
    }
    processor.addEventListener('audioprocess', handler)
    return processor
  }
  #parallelApplyAcrossChannels(inputChannels, outputChannels) {
    for (let c = 0; c < inputChannels.length; c++) {
      let outputChannel = outputChannels[c]
      const inputChannel = inputChannels[c]
      for (let i = 0; i < outputChannel.length; i++) {
        // For the current sample and channel, apply the function across the
        // inputs.
        const inputs = inputChannel.map(inp => inp[i])
        const res = this.fn(...inputs)
        if (typeof res != 'number') {
          throw new Error("FunctionComponents that operate on audio-rate inputs must return numbers. Given: " + (typeof res))
        }
        outputChannel[i] = res
      }
    }
  }
  inputDidUpdate(input, newValue) {
    const args = this._orderedFunctionInputs.map(eachInput => eachInput.value)
    const result = this.fn(...args)
    this.output.update(result)
  }
  process(event) {
    return this.fn(event)
  }
  call(...inputs) {
    if (inputs.length > this._orderedFunctionInputs.length) {
      throw new Error(`Too many inputs for the call() method on ${this}. Expected ${this._orderedFunctionInputs.length} but got ${inputs.length}.`)
    }
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].connect(this._orderedFunctionInputs[i])
    }
    return this
  }
}

const TimeMeasure = {
  CYCLES: 'cycles',
  SECONDS: 'seconds'
}

// 
class TimeVaryingSignal extends FunctionComponent {
  constructor(generatorFn, timeMeasure=TimeMeasure.SECONDS) {
    super(generatorFn)
    if (this._orderedFunctionInputs.length != 1) {
      throw new Error(`A time-varying signal function can only have one argument. Given ${this.fn}`)
    }
    const timeRamp = this.defineTimeRamp(timeMeasure)
    timeRamp.connect(this.channelMerger, 0, 0)
    this._preventIOOverwrites()
  }
  defineTimeRamp(timeMeasure) {
    // Continuous ramp representing the AudioContext time.
    let multiplier = timeMeasure == TimeMeasure.CYCLES ? 2 * Math.PI : 1
    let timeRamp = createConstantSource(this.audioContext)
    let currTime = this._now()
    let endTime = 1e8
    timeRamp.offset.setValueAtTime(multiplier*currTime, currTime)
    timeRamp.offset.linearRampToValueAtTime(multiplier*endTime, endTime)
    return timeRamp
  }
}

// TODO: is this old code? Or maybe we should actually expose these functions.
class AudioParamControlOutput extends ControlOutput {
  connect(destination) {
    let { component, input } = this.getDestinationInfo(destination)
    if (input instanceof AudioRateInput) {
      this.connections.push(destination)
    } else {
      throw new Error("The output must be an audio-rate input.")
    }
    return destination
  }
  #map(fn, args) {
    for (let connection of this.connections) {
      connection[fn](...args)
    }
  }
  cancelAndHoldAtTime(cancelTime) {
    this.#map('cancelAndHoldAtTime', arguments)
  }
  cancelScheduledValues(cancelTime) {
    this.#map('cancelScheduledValues', arguments)
  }
  exponentialRampToValueAtTime(value, endTime) {
    this.#map('exponentialRampToValueAtTime', arguments)
  }
  linearRampToValueAtTime(value, endTime) {
    this.#map('linearRampToValueAtTime', arguments)
  }
  setTargetAtTime(value, startTime, timeConstant) {
    this.#map('setTargetAtTime', arguments)
  }
  setValueAtTime(value, startTime) {
    this.#map('setValueAtTime', arguments)
  }
  setValueCurveAtTime(values, startTime, duration) {
    this.#map('setValueCurveAtTime', arguments)
  }
}

class RangeInputDisplay extends BaseDisplay {
  updateValue(value) {}
  updateMinValue(value) {}
  updateMaxValue(value) {}
  updateStep(value) {}
}

class KnobDisplay extends RangeInputDisplay {

}

class SliderDisplay extends RangeInputDisplay {
  #getInputAttrs() {
    return {
      type: 'range',
      min: this.component.minValue.value,
      max: this.component.maxValue.value,
      step: this.component.step.value || 'any',
      value: this.component.input.value,
    }
  }
  _display($root, width, height) {
    this.$range = $(document.createElement('input'))
      .attr(this.#getInputAttrs())
      .on('input', event => {
        this.component.output.update(Number(event.target.value))
      }).css({
        width: width,
        height: height,
      })
    $root.append(this.$range)
  }
  updateValue(value) {
    this.$range?.attr('value', value)
  }
  updateMinValue(value) {
    this.$range?.attr('min', value)
  }
  updateMaxValue(value) {
    this.$range?.attr('max', value)
  }
  updateStep(value) {
    this.$range?.attr('step', value)
  }
}

class RangeInputComponent extends VisualComponent {
  static Type = {
    SLIDER: 'slider',
    KNOB: 'knob'
  }
  constructor(minValue=-1, maxValue=1, step=undefined, defaultValue=undefined, displayType = RangeInputComponent.Type.SLIDER) {
    super()
    this.display = (displayType == RangeInputComponent.Type.SLIDER) 
      ? new this._.SliderDisplay(this)
      : new this._.KnobDisplay(this)
    if (defaultValue == undefined) {
      defaultValue = (minValue + maxValue) / 2
    }
    // Inputs
    this.minValue = this._defineControlInput('minValue', minValue)
    this.maxValue = this._defineControlInput('maxValue', maxValue)
    this.step = this._defineControlInput('step', step)
    this.input = this._defineControlInput('input', defaultValue)
    this._setDefaultInput(this.input)

    // Output
    this.output = this._defineControlOutput('output')
  }
  inputDidUpdate(input, newValue) {
    if (input == this.input) {
      this.display.updateValue(newValue)
      this.output.update(newValue)
    } else if (input == this.minValue) {
      this.display.updateMinValue(newValue)
    } else if (input == this.maxValue) {
      this.display.updateMaxValue(newValue)
    } else if (input == this.step) {
      this.display.updateStep(newValue)
    }
  }
}

/* class ADSRControl extends BaseComponent {
  constructor(attackDurationMs, decayDurationMs, sustainAmplitude, releaseDurationMs) {
    this.attackDurationMs = this._defineControlInput('attackDurationMs', attackDurationMs)
    this.decayDurationMs = this._defineControlInput('decayDurationMs', decayDurationMs)
    this.sustainAmplitude = this._defineControlInput('sustainAmplitude', sustainAmplitude)
    this.releaseDurationMs = this._defineControlInput('releaseDurationMs', releaseDurationMs)
  }
} */

class ADSR extends BaseComponent {
  constructor(attackDurationMs, decayDurationMs, sustainAmplitude, releaseDurationMs) {
    super()
    // Inputs
    this.attackEvent = this._defineControlInput('attackEvent')
    this.releaseEvent = this._defineControlInput('releaseEvent')
    this.attackDurationMs = this._defineControlInput('attackDurationMs', attackDurationMs)
    this.decayDurationMs = this._defineControlInput('decayDurationMs', decayDurationMs)
    this.sustainAmplitude = this._defineControlInput('sustainAmplitude', sustainAmplitude)
    this.releaseDurationMs = this._defineControlInput('releaseDurationMs', releaseDurationMs)

    this._paramModulator = createConstantSource(this.audioContext)
    this.audioOutput = this._defineAudioOutput('audioOutput', this._paramModulator)

    this.noteStart = 0
    this.attackFinish = 0
    this.decayFinish = 0
    this._preventIOOverwrites()
  }
  inputDidUpdate(input, newValue) {
    if (input == this.attackEvent) {
      this.noteStart = this._now()
      this._paramModulator.offset.cancelScheduledValues(this.noteStart)
      this.attackFinish = this.noteStart + this.attackDurationMs.value / 1000
      this.decayFinish = this.attackFinish + this.decayDurationMs.value / 1000
      this._paramModulator.offset.setValueAtTime(0, this.noteStart)
      this._paramModulator.offset.linearRampToValueAtTime(
        1.0,
        this.attackFinish
      )
      // Starts *after* the previous event finishes.
      this._paramModulator.offset.linearRampToValueAtTime(
        this.sustainAmplitude.value,
        this.decayFinish
      )
      this._paramModulator.offset.setValueAtTime(
        this.sustainAmplitude.value,
        this.decayFinish
      )
    } else if (input == this.releaseEvent) {
      this.releaseStart = this._now()
      if (this.releaseStart > this.attackFinish && this.releaseStart < this.decayFinish) {
        // Special case: the amplitude is in the middle of increasing. If we 
        // immediately release, we risk the note being louder *longer* than if 
        // it was allowed to decay, in the case that the release is longer than 
        // the decay and sustain < 1. So, let it decay, then release.
        this.releaseFinish = this.decayFinish + this.releaseDurationMs.value / 1000
      } else {
        // Immediately release.
        this._paramModulator.offset.cancelScheduledValues(this.releaseStart)
        this._paramModulator.offset.setValueAtTime(this._paramModulator.offset.value, this.releaseStart)

        this.releaseFinish = this.releaseStart + this.releaseDurationMs.value / 1000
      }
      this._paramModulator.offset.linearRampToValueAtTime(0.0, this.releaseFinish)
    }
  }
}

class KeyboardDisplay extends BaseDisplay {
  $keys = {}
  _display($root, width, height) {
    // Obviously this is the wrong keyboard arrangement. TODO: that.
    let keyWidth = width / this.component.numKeys.value
    this.$keys = {}
    const lo = this.component.lowestPitch.value
    const hi = this.component.highestPitch
    for (let pitch = lo; pitch < hi; pitch++) {
      let $key = $(document.createElement('button'))
        .addClass(_KEYBOARD_KEY_CLASS)
        .css({
          width: keyWidth,
          height: height,
        })
        .attr('type', 'button')
        // Keydown handled locally
        .on(_EVENT_MOUSEDOWN, () => this.component._keyDown(pitch))
      this.$keys[pitch] = $key
      $root.append($key)
    }
    // Key releases are handled globally to prevent releasing when not on a 
    // button (doesn't trigger mouseup on the button).
    // TODO: isn't this inefficient to propogate 48 updates on one keydown...?
    $root.on(_EVENT_MOUSEUP, () => {
      Object.keys(this.$keys).forEach(k => this.component._keyUp(k))
    })
  }
  showKeyEvent(event) {
    let $key = this.$keys[event.eventPitch]
    if ($key) {
      if (event.eventType == KeyEventType.KEY_DOWN) {
        $key.addClass(_KEYBOARD_KEY_PRESSED_CLASS)
      } else {
        $key.removeClass(_KEYBOARD_KEY_PRESSED_CLASS)
      }
    }
  }
}

class Keyboard extends VisualComponent {
  constructor(numKeys = 48, lowestPitch = 48) {
    super()
    this.display = new this._.KeyboardDisplay(this)
    // Inputs
    this.numKeys = this._defineControlInput('numKeys', numKeys)
    this.lowestPitch = this._defineControlInput('lowestPitch', lowestPitch)
    this.midiInput = this._defineControlInput('midiInput')
    this._setDefaultInput(this.midiInput)

    // Output
    this.midiOutput = this._defineControlOutput('midiOutput')
    this._preventIOOverwrites()
  }

  inputDidUpdate(input, newValue) {
    if (input == this.numKeys || this.input == this.lowestPitch) {
      //this.refreshDom()
      throw new Error("Can't update numKeys or lowestPitch yet.")
    }
    if (input == this.midiInput) {
      // Show key being pressed.
      this.display.showKeyEvent(newValue)
      // Propagate.
      this.midiOutput.update(newValue)
    }
  }

  get highestPitch() {
    return this.lowestPitch.value + this.numKeys.value
  }
  #getKeyId(keyNumber) {
    return `${this._uuid}-k${keyNumber}`  // Unique identifier.
  }
  _keyDown(keyNumber) {
    this.midiOutput.update(new KeyEvent(KeyEventType.KEY_DOWN, keyNumber, 64, this.#getKeyId(keyNumber)))
  }
  _keyUp(keyNumber) {
    this.midiOutput.update(new KeyEvent(KeyEventType.KEY_UP, keyNumber, 64, this.#getKeyId(keyNumber)))
  }
}

const _MIDI_C0 = 12

class TypingKeyboardMIDI extends BaseComponent {
  static OCTAVE_DOWN_KEY = "z"
  static OCTAVE_UP_KEY = "x"
  static CHROMATIC_KEY_SEQUENCE = "awsedftgyhujkolp;'"  // C to F

  constructor(velocity=64, octave=4) {
    super()
    // Inputs
    this.velocity = this._defineControlInput('velocity', velocity)
    this.octaveInput = this._defineControlInput('octaveInput', octave)
    this.midiInput = this._defineControlInput('midiInput', _UNSET_VALUE, false)
    this._setDefaultInput(this.midiInput)

    // Output
    this.midiOutput = this._defineControlOutput('midiOutput')
    this.octaveOutput = this._defineControlOutput('octaveOutput')
    this._setDefaultOutput(this.midiOutput)
    this._preventIOOverwrites()
    this._validateIsSingleton()

    this.#registerKeyHandlers()
  }
  #registerKeyHandlers() {
    const keyPressedMap = {}
    const processKeyEvent = event => {
      if (event.defaultPrevented ) {
        return
      }
      const key = event.key
      const isAlreadyPressed = keyPressedMap[key]?.isPressed
      const isKeyDown = (event.type == KeyEventType.KEY_DOWN)
      let pitch;
      if (isAlreadyPressed) {
        if (isKeyDown) {
          // Extra keydown events are sent for holding, so ignore.
          return
        } else {
          // The pitch of the press may be different than the current pitch,
          // so send a note-off for that one instead.
          pitch = keyPressedMap[key].pitch
        }
      } else {
        pitch = this.#getPitchFromKey(key, isKeyDown)
      }
      if (pitch != undefined) {
        keyPressedMap[key] = { 
          isPressed: isKeyDown, 
          pitch: pitch
        }
        let id = this._uuid + key + pitch
        this.midiOutput.update(new KeyEvent(event.type, pitch, this.velocity.value, id))
      }
    }
    window.addEventListener("keydown", processKeyEvent, true)
    window.addEventListener("keyup", processKeyEvent, true)
  }
  #getPitchFromKey(key, isKeyDown) {
    const baseCPitch = _MIDI_C0 + this.octaveInput.value * 12
    const chromaticIdx = TypingKeyboardMIDI.CHROMATIC_KEY_SEQUENCE.indexOf(key)
    if (chromaticIdx != -1) {
      return chromaticIdx + baseCPitch
    } else if (isKeyDown && key == TypingKeyboardMIDI.OCTAVE_DOWN_KEY) {
      // The octaveOutput will automatically be updated
      this.octaveInput.setValue(this.octaveInput.value - 1)
    } else if (isKeyDown && key == TypingKeyboardMIDI.OCTAVE_UP_KEY) {
      this.octaveInput.setValue(this.octaveInput.value + 1)
    }
  }
  inputDidUpdate(input, newValue) {
    if (input == this.octaveInput) {
      this.octaveOutput.update(newValue)
    } else if (input == this.midiInput) {
      // Passthrough, as MIDI does not affect component state.
      this.midiOutput.update(newValue)
    }
  }
}

class BangDisplay extends BaseDisplay {
  _display($root, width, height) {
    let $button = $(document.createElement('button'))
      .on('click', () => {
        this.component.trigger()
      }).css({
        width: width,
        height: height,
      })
      .attr('type', 'button')
    $root.append($button)
  }
  // TODO: show when it receives an external trigger.
}

class Bang extends VisualComponent {
  constructor() {
    super()
    this.display = new this._.BangDisplay(this)
    this.output = this._defineControlOutput('output')
    this._preventIOOverwrites()
  }
  
  connect(destination) {
    let { component } = this.getDestinationInfo(destination)
    if (destination instanceof ControlInput) {
      this.output.connect(destination)
    } else {
      this.output.connect(component.triggerInput)
    }
    return component
  }
  trigger() {
    this.output.update(TRIGGER)
  }
}

const _GLOBAL_STATE = {
  isInitialized: false,
  audioContext: null,
  defaultSamplePeriodMs: 10
}

/* function getAudioContext() {
  if (!_GLOBAL_STATE.audioContext) {
    _GLOBAL_STATE.audioContext = new AudioContext()
  }
  return _GLOBAL_STATE.audioContext
} */

class SimplePolyphonicSynth extends BaseComponent {
  _soundNodes = []
  _currNodeIdx = 0

  constructor(numNotes = 4, waveform = 'sine') {
    super()
    this._masterGainNode = this.audioContext.createGain()

    // Inputs
    this.numNotes = this._defineControlInput('numNotes', numNotes)
    this.waveform = this._defineControlInput('waveform', waveform)
    this.midiInput = this._defineControlInput('midiInput')
    this._setDefaultInput(this.midiInput)

    // Output
    this.audioOutput = this._defineAudioOutput('audioOutput', this._masterGainNode)


    for (let i = 0; i < numNotes; i++) {
      this._soundNodes.push(
        this.#createOscillatorGraph(this.waveform.value)
      )
    }
    this._preventIOOverwrites()
  }

  #createOscillatorGraph(waveform) {
    let oscillator = this.audioContext.createOscillator()
    oscillator.type = waveform
    let gainNode = this.audioContext.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(this._masterGainNode)
    this._masterGainNode.gain.setValueAtTime(1 / this.numNotes.value, this._now())

    return {
      oscillator: oscillator,
      gainNode: gainNode,
      isPlaying: false,
      // Unique identifier to help associate NOTE_OFF events with the correct
      // oscillator.
      key: undefined
    }
  }

  inputDidUpdate(input, newValue) {
    switch (input) {
      case this.midiInput:
        this.onKeyEvent(newValue)
    }
  }

  onKeyEvent(event) {
    this.audioContext.resume()
    // Need better solution than this.
    let freq = 440 * 2 ** ((event.eventPitch - 69) / 12)
    if (event.eventType == KeyEventType.KEY_DOWN) {
      let node = this._soundNodes[this._currNodeIdx]
      
      node.isPlaying && node.oscillator.stop()
      node.oscillator = this.audioContext.createOscillator()
      node.oscillator.connect(node.gainNode)
      node.oscillator.frequency.value = freq
      node.gainNode.gain.value = event.eventVelocity / 128
      node.oscillator.start()
      node.key = event.key
      node.isPlaying = true
      this._currNodeIdx = (this._currNodeIdx + 1) % this.numNotes.value
    } else if (event.eventType == KeyEventType.KEY_UP) {
      for (let node of this._soundNodes) {
        if (event.key && (event.key == node.key)) {
          node.oscillator.stop()
          node.isPlaying = false
        }
      }
    } else {
      throw new Error("invalid keyevent")
    }
  }
}

const _INTERNAL_NAMESPACE = {
  AudioComponent,
  AudioParamControlOutput,
  AudioRateInput,
  AudioRateOutput,
  AudioRateSignalSampler,
  Bang,
  BangDisplay,
  BaseComponent,
  BaseDisplay,
  BaseEvent,
  BypassEvent,
  Connectable,
  ControlInput,
  ControlOutput,
  DefaultInput,
  FunctionComponent,
  HandlerMixin,
  HasScope,
  HybridInput,
  HybridOutput,
  IgnoreDuplicates,
  KeyEvent,
  Keyboard,
  KeyboardDisplay,
  KnobDisplay,
  MuteEvent,
  RangeInputComponent,
  RangeInputDisplay,
  ScrollingAudioMonitor,
  ScrollingAudioMonitorDisplay,
  SimplePolyphonicSynth,
  SliderDisplay,
  TimeVaryingSignal,
  ToStringAndUUID,
  TypingKeyboardMIDI,
  VisualComponent,
  Wave
}

// TODO: add all public classes
const _PUBLIC_NAMESPACE = {
  // These will be filled in.
  internals: _UNSET_VALUE,
  audioContext: _UNSET_VALUE,
  id: _UNSET_VALUE,
  //
  SimplePolyphonicSynth, Keyboard
}


class AudioScope extends ToStringAndUUID {
  static #internalCall = Symbol()
  constructor(audioContext, internalNamespace, __internal) {
    super()
    if (__internal !== AudioScope.#internalCall) {
      throw new TypeError("Illegal constructor. Call Scope.create(...) to create a new scope.")
    }
    this.audioContext = audioContext
    this.internals = internalNamespace
  }
  static #createScopedClass(Class, getScopeFn) {
    try {
      class _ScopedComponent extends Class {
        get scope() {
          // Can't set this as a property because it would be assigned *after* 
          // the constructor, and the scope needs to be defined within the 
          // constructor.
          return getScopeFn()
        }
        static Global = Class
        get _className() {
          // Classes call this to get their class name. Override to sub a 
          // different class.
          return `Scoped<${Class.name}>`
        }
      }
      return _ScopedComponent
    } catch (e) {
      // In case the argument is not an extendable class.
      return Class
    }
    
  }
  static create(audioContext=new AudioContext(), scopeId=undefined) {
    // Defined as a getter fn so that it can be mutated after the handler 
    // declaration.
    const getScopeFn = () => scopedNamespace;
    // Proxy handler that rescopes every public class.
    const addScopeHandler = {
      get(target, prop, receiver) {
        if (prop in target && target[prop] != _UNSET_VALUE) {
          const Class = target[prop]
          return AudioScope.#createScopedClass(Class, getScopeFn)
        } else if (prop in extendedProps) {
          return extendedProps[prop]
        }
      }
    }
    const scopedNamespace = new Proxy(_PUBLIC_NAMESPACE, addScopeHandler)
    // These properties are specific to the scope.
    const extendedProps = {
      id: scopeId ?? crypto.randomUUID(),
      audioContext: audioContext,
      internals: new Proxy(_INTERNAL_NAMESPACE, addScopeHandler)
    }
    return scopedNamespace
  }
}

// TODO: Remove new() calls to avoid creating stuff in the wrong scope.
const _GLOBAL_SCOPE = AudioScope.create(new AudioContext(), 'GLOBAL')
const GLOBAL_AUDIO_CONTEXT = _GLOBAL_SCOPE.audioContext
const MAIN_OUT = GLOBAL_AUDIO_CONTEXT.destination
