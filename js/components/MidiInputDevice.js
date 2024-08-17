import { SelectDisplay } from "../ui/SelectDisplay.js";
import { mapLikeToObject } from "../shared/util.js";
import { MidiLearn } from "../shared/MidiLearn.js";
import { MidiAccessListener, MidiMessageListener } from "../shared/MidiListener.js";
import { VisualComponent } from "./base/VisualComponent.js";
export var DefaultDeviceBehavior;
(function (DefaultDeviceBehavior) {
    DefaultDeviceBehavior["NONE"] = "none";
    DefaultDeviceBehavior["ALL"] = "all";
    DefaultDeviceBehavior["NEWEST"] = "newest";
})(DefaultDeviceBehavior || (DefaultDeviceBehavior = {}));
const NO_INPUT_ID = 'none';
const ALL_INPUT_ID = 'all';
const SELECT_NO_DEVICE = { id: NO_INPUT_ID, name: "<no midi input>" };
const SELECT_ALL_DEVICES = { id: ALL_INPUT_ID, name: "* (all midi inputs)" };
const DEFAULT_SELECTIONS = [SELECT_NO_DEVICE, SELECT_ALL_DEVICES];
export class MidiInputDevice extends VisualComponent {
    constructor(defaultDeviceBehavior = DefaultDeviceBehavior.ALL) {
        super();
        this.defaultDeviceBehavior = defaultDeviceBehavior;
        // Used by display.
        this.selectOptions = DEFAULT_SELECTIONS;
        // Internals.
        this.deviceMap = {};
        this.display = new SelectDisplay(this);
        this.selectedDeviceInput = this.defineControlInput('selectedDeviceInput');
        this.midiOut = this.defineControlOutput('midiOut');
        this.availableDevices = this.defineControlOutput('availableDevices');
        this.activeDevices = this.defineControlOutput('selectedDevicesOutput');
        // Update the menu and outputs when access changes.
        this.accessListener = new MidiAccessListener(this.onMidiAccessChange.bind(this));
        // Send filtered MIDI messages out.
        this.messageListener = new MidiMessageListener(this.sendMidiMessage.bind(this));
        // Context menu triggers MIDI learn mode: select the MIDI input based 
        // on which input device is currently being used.
        this.midiLearn = new MidiLearn({
            learnMode: MidiLearn.Mode.INPUT,
            contextMenuSelector: this.uniqueDomSelector,
            onMidiLearnConnection: input => this.selectDevice(input.id)
        });
    }
    static buildSelectOptions(inputMap) {
        var _a;
        const selectOptions = [...DEFAULT_SELECTIONS];
        for (const id in inputMap) {
            const name = `${(_a = inputMap[id].manufacturer) !== null && _a !== void 0 ? _a : ''} ${inputMap[id].name}`;
            selectOptions.push({ id, name });
        }
        return selectOptions;
    }
    getSelectedMidiDevicesById(id) {
        if (id == NO_INPUT_ID) {
            return [];
        }
        else if (id == ALL_INPUT_ID) {
            return Object.values(this.deviceMap);
        }
        return [this.deviceMap[id]];
    }
    selectDevice(id) {
        if (id != this.selectedId) {
            this.selectedId = id;
            const devices = this.getSelectedMidiDevicesById(id);
            this.activeDevices.setValue(devices);
        }
        // Update display.
        this.display.refresh();
    }
    onMidiAccessChange(access, event) {
        var _a, _b;
        if (((_a = event === null || event === void 0 ? void 0 : event.port) === null || _a === void 0 ? void 0 : _a.type) === "output") {
            return; // We only care about input changes.
        }
        // Set available inputs.
        this.deviceMap = mapLikeToObject(access.inputs);
        this.availableDevices.setValue(this.deviceMap, true);
        this.selectOptions = MidiInputDevice.buildSelectOptions(this.deviceMap);
        // Set selected input(s).
        const newId = (_b = this.autoSelectNewDevice(this.deviceMap, event)) !== null && _b !== void 0 ? _b : NO_INPUT_ID;
        this.selectDevice(newId);
    }
    autoSelectNewDevice(deviceMap, event) {
        var _a, _b, _c;
        const inputs = Object.values(deviceMap);
        if (this.defaultDeviceBehavior instanceof Function) {
            // Custom selector function.
            const chosenInput = this.defaultDeviceBehavior(inputs);
            return chosenInput === null || chosenInput === void 0 ? void 0 : chosenInput.id;
        }
        // Catch special case where user-selected option has precedence.
        const isSpecialId = [ALL_INPUT_ID, NO_INPUT_ID].includes(this.selectedId);
        const selectedDeviceIsAvailable = this.selectedId && inputs.some(input => input.id == this.selectedId);
        if ((selectedDeviceIsAvailable || isSpecialId)
            && this.defaultDeviceBehavior !== DefaultDeviceBehavior.NEWEST) {
            // No change. The only mode in which the previously-selected option would 
            // update is NEWEST.
            return this.selectedId;
        }
        switch (this.defaultDeviceBehavior) {
            case DefaultDeviceBehavior.NEWEST:
                if (this.selectedId === ALL_INPUT_ID) {
                    // The user explicitly selected using "all", so don't box them in.
                    return this.selectedId;
                }
                else if (((_a = event === null || event === void 0 ? void 0 : event.port) === null || _a === void 0 ? void 0 : _a.state) === "connected") {
                    // Connect to the new device.
                    return event.port.id;
                }
                else if (((_b = event === null || event === void 0 ? void 0 : event.port) === null || _b === void 0 ? void 0 : _b.state) === "disconnected" && event.port.id !== this.selectedId) {
                    // Disconnection was irrelevant; keep same device.
                    return this.selectedId;
                }
                else {
                    // Disconnection was relevant OR we are choosing an initial device
                    // (event === undefined).
                    return (_c = inputs[inputs.length - 1]) === null || _c === void 0 ? void 0 : _c.id;
                }
            case DefaultDeviceBehavior.ALL:
                return ALL_INPUT_ID;
            default: // NONE
                return NO_INPUT_ID;
        }
    }
    sendMidiMessage(midiInput, e) {
        if (e.data == null)
            return;
        if ([midiInput.id, ALL_INPUT_ID].includes(this.selectedId)) {
            const [cmd, key, v] = e.data;
            this.midiOut.setValue([cmd, key, v]);
        }
    }
    inputDidUpdate(input, newValue) {
        if (input == this.selectedDeviceInput) {
            this.setOption(newValue);
            this.display.refresh();
        }
    }
    setOption(id) {
        this.selectDevice(id);
    }
}
