import { AbstractInput } from "../../io/input/AbstractInput.js";
import { ComponentInput } from "../../io/input/ComponentInput.js";
import { ControlInput } from "../../io/input/ControlInput.js";
import { BaseConnectable } from "../../shared/base/BaseConnectable.js";
import { Connectable } from "../../shared/base/Connectable.js";
import { ToStringAndUUID } from "../../shared/base/ToStringAndUUID.js";
import constants from "../../shared/constants.js";
import { AnyInput, AnyOutput, CanBeConnectedTo, ObjectOf } from "../../shared/types.js";
export interface Component<InputTypes extends AnyInput = AnyInput, OutputTypes extends AnyOutput = AnyOutput> extends ToStringAndUUID, BaseConnectable {
    readonly isComponent: true;
    isBypassed: ControlInput<boolean>;
    isMuted: ControlInput<boolean>;
    triggerInput: ControlInput<typeof constants.TRIGGER>;
    outputs: OutputTypes;
    inputs: InputTypes;
    get defaultInput(): ComponentInput<unknown>;
    getDefaultInput(): ComponentInput<unknown>;
    setBypassed(isBypassed?: boolean): void;
    setMuted(isMuted?: boolean): void;
    connect<T extends CanBeConnectedTo>(destination: T): Component | undefined;
    withInputs(inputDict: {
        [name: string]: Connectable;
    }): Component;
    setValues(valueObj: ObjectOf<any>): void;
    wasConnectedTo(other: Connectable): void;
    sampleSignal(samplePeriodMs?: number): Component;
    propagateUpdatedInput<T>(input: AbstractInput<T>, newValue: T): void;
}
