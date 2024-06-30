

import { ControlOutput } from "../io/output/ControlOutput.js";
import { SelectDisplay } from "../ui/SelectDisplay.js";
import { mapLikeToObject } from "../shared/util.js";
import { MidiLearn } from "../shared/MidiLearn.js";
import { ControlInput } from "../io/input/ControlInput.js";
import { MidiAccessListener, MidiMessageListener } from "../shared/MidiListener.js";
import { VisualComponent } from "./base/VisualComponent.js";

type MidiEvent = [number, number, number];

export interface SupportsSelect {
  selectOptions: { id: string, name: string }[]
  readonly selectedId: string
  setOption(id: string): void
}

export enum DefaultDeviceBehavior {
  NONE = "none",
  ALL = "all",
  NEWEST = "newest"
}
type DeviceSelectorFn = (inputs: MIDIInput[]) => MIDIInput

const NO_INPUT_ID = 'none'
const ALL_INPUT_ID = 'all'
const SELECT_NO_DEVICE = { id: NO_INPUT_ID, name: "<no midi input>" }
const SELECT_ALL_DEVICES = { id: ALL_INPUT_ID, name: "* (all midi inputs)" }
const DEFAULT_SELECTIONS = [SELECT_NO_DEVICE, SELECT_ALL_DEVICES]

export class MidiInputDevice extends VisualComponent implements SupportsSelect {
  // I/O.
  readonly selectedDeviceInput: ControlInput<string>
  readonly midiOut: ControlOutput<MidiEvent>
  readonly availableDevices: ControlOutput<{ [id: string]: MIDIInput }>
  readonly device: ControlOutput<MIDIInput>
  readonly activeDevices: ControlOutput<MIDIInput[]>

  // Used by display.
  public selectOptions: { id: string, name: string }[] = DEFAULT_SELECTIONS
  public selectedId: string

  // Internals.
  protected deviceMap: { [id: string]: MIDIInput } = {}
  protected accessListener: MidiAccessListener
  protected messageListener: MidiMessageListener
  protected midiLearn: MidiLearn

  constructor(
    public defaultDeviceBehavior: DefaultDeviceBehavior | DeviceSelectorFn = DefaultDeviceBehavior.ALL
  ) {
    super()
    this.display = new SelectDisplay(this)
    this.selectedDeviceInput = this._defineControlInput('selectedDeviceInput')

    this.midiOut = this._defineControlOutput('midiOut')
    this.availableDevices = this._defineControlOutput('availableDevices')
    this.activeDevices = this._defineControlOutput('selectedDevicesOutput')

    // Update the menu and outputs when access changes.
    this.accessListener = new MidiAccessListener(this.onMidiAccessChange.bind(this))
    // Send filtered MIDI messages out.
    this.messageListener = new MidiMessageListener(this.sendMidiMessage.bind(this))

    // Context menu triggers MIDI learn mode: select the MIDI input based 
    // on which input device is currently being used.
    this.midiLearn = new MidiLearn({
      learnMode: MidiLearn.Mode.INPUT,
      contextMenuSelector: this.uniqueDomSelector,
      onMidiLearnConnection: input => this.selectDevice(input.id)
    })
  }
  protected static buildSelectOptions(inputMap: { [id: string]: MIDIInput }) {
    const selectOptions = [...DEFAULT_SELECTIONS]
    for (const id in inputMap) {
      const name = `${inputMap[id].manufacturer ?? ''} ${inputMap[id].name}`
      selectOptions.push({ id, name })
    }
    return selectOptions
  }
  protected getSelectedMidiDevicesById(id: string): MIDIInput[] {
    if (id == NO_INPUT_ID) {
      return []
    } else if (id == ALL_INPUT_ID) {
      return Object.values(this.deviceMap)
    }
    return [this.deviceMap[id]]
  }
  selectDevice(id: string) {
    if (id != this.selectedId) {
      this.selectedId = id
      const devices = this.getSelectedMidiDevicesById(id)
      this.activeDevices.setValue(devices)
    }
    // Update display.
    this.display.refresh()
  }
  protected onMidiAccessChange(
    access: MIDIAccess,
    event?: MIDIConnectionEvent
  ) {
    if (event?.port.type === "output") {
      return  // We only care about input changes.
    }
    // Set available inputs.
    this.deviceMap = mapLikeToObject(access.inputs)
    this.availableDevices.setValue(this.deviceMap, true)
    this.selectOptions = MidiInputDevice.buildSelectOptions(this.deviceMap)

    // Set selected input(s).
    const newId = this.autoSelectNewDevice(this.deviceMap, event) ?? NO_INPUT_ID
    this.selectDevice(newId)
  }
  protected autoSelectNewDevice(
    deviceMap: { [id: string]: MIDIInput },
    event?: MIDIConnectionEvent
  ): string | undefined {
    const inputs = Object.values(deviceMap)
    if (this.defaultDeviceBehavior instanceof Function) {
      // Custom selector function.
      const chosenInput = this.defaultDeviceBehavior(inputs)
      return chosenInput?.id
    }
    // Catch special case where user-selected option has precedence.
    const isSpecialId = [ALL_INPUT_ID, NO_INPUT_ID].includes(this.selectedId)
    const selectedDeviceIsAvailable = this.selectedId && inputs.some(input => input.id == this.selectedId)
    if ((selectedDeviceIsAvailable || isSpecialId)
      && this.defaultDeviceBehavior !== DefaultDeviceBehavior.NEWEST) {
      // No change. The only mode in which the previously-selected option would 
      // update is NEWEST.
      return this.selectedId
    }
    switch (this.defaultDeviceBehavior) {
      case DefaultDeviceBehavior.NEWEST:
        if (this.selectedId === ALL_INPUT_ID) {
          // The user explicitly selected using "all", so don't box them in.
          return this.selectedId
        } else if (event?.port.state === "connected") {
          // Connect to the new device.
          return event.port.id
        } else if (event?.port.state === "disconnected" && event.port.id !== this.selectedId) {
          // Disconnection was irrelevant; keep same device.
          return this.selectedId
        } else {
          // Disconnection was relevant OR we are choosing an initial device
          // (event === undefined).
          return inputs[inputs.length - 1]?.id
        }
      case DefaultDeviceBehavior.ALL:
        return ALL_INPUT_ID
      default:  // NONE
        return NO_INPUT_ID
    }
  }
  protected sendMidiMessage(midiInput: MIDIInput, e: MIDIMessageEvent) {
    if ([midiInput.id, ALL_INPUT_ID].includes(this.selectedId)) {
      const [cmd, key, v] = e.data
      this.midiOut.setValue([cmd, key, v])
    }
  }
  inputDidUpdate<T>(input: ControlInput<T>, newValue: T): void {
    if (input == this.selectedDeviceInput) {
      this.setOption(<string>newValue)
      this.display.refresh()
    }
  }
  setOption(id: string) {
    this.selectDevice(id)
  }
}
