import { SelectDisplay } from "../ui/SelectDisplay.js";
import { mapLikeToObject } from "../shared/util.js";
import { MidiLearnableComponent } from "./base/MidiLearnableComponent.js";
import { MidiAccessListener, MidiMessageListener } from "../shared/MidiListener.js";
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
export class MidiInputDevice extends MidiLearnableComponent {
    constructor(defaultDeviceBehavior = DefaultDeviceBehavior.ALL) {
        super();
        this.defaultDeviceBehavior = defaultDeviceBehavior;
        this.selectOptions = DEFAULT_SELECTIONS;
        this.display = new SelectDisplay(this);
        this.selectedDeviceInput = this._defineControlInput('selectedDeviceInput');
        this.midiOut = this._defineControlOutput('midiOut');
        this.availableDevices = this._defineControlOutput('availableDevices');
        this.activeDevices = this._defineControlOutput('selectedDevicesOutput');
        this.accessListener = new MidiAccessListener(this.onMidiAccessChange.bind(this));
        this.messageListener = new MidiMessageListener(this.sendMidiMessage.bind(this));
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
        var _a;
        if ((event === null || event === void 0 ? void 0 : event.port.type) === "output") {
            return; // We only care about input changes.
        }
        // Set available inputs.
        this.deviceMap = mapLikeToObject(access.inputs);
        this.availableDevices.setValue(this.deviceMap, true);
        this.selectOptions = MidiInputDevice.buildSelectOptions(this.deviceMap);
        // Set selected input(s).
        const newId = (_a = this.autoSelectNewDevice(this.deviceMap, event)) !== null && _a !== void 0 ? _a : NO_INPUT_ID;
        this.selectDevice(newId);
    }
    autoSelectNewDevice(deviceMap, event) {
        var _a;
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
                else if ((event === null || event === void 0 ? void 0 : event.port.state) === "connected") {
                    // Connect to the new device.
                    return event.port.id;
                }
                else if ((event === null || event === void 0 ? void 0 : event.port.state) === "disconnected" && event.port.id !== this.selectedId) {
                    // Disconnection was irrelevant; keep same device.
                    return this.selectedId;
                }
                else {
                    // Disconnection was relevant OR we are choosing an initial device
                    // (event === undefined).
                    return (_a = inputs[inputs.length - 1]) === null || _a === void 0 ? void 0 : _a.id;
                }
            case DefaultDeviceBehavior.ALL:
                return ALL_INPUT_ID;
            default: // NONE
                return NO_INPUT_ID;
        }
    }
    sendMidiMessage(midiInput, e) {
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
    onMidiLearnConnection(input) {
        this.selectDevice(input.id);
    }
}
