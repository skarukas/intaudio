import { AbstractInput } from "../../io/input/AbstractInput.js";
import { ComponentInput } from "../../io/input/ComponentInput.js";
import { ControlInput } from "../../io/input/ControlInput.js";
import { AbstractOutput } from "../../io/output/AbstractOutput.js";
import { Connectable } from "../../shared/base/Connectable.js";
import { ToStringAndUUID } from "../../shared/base/ToStringAndUUID.js";
import constants from "../../shared/constants.js";
import { AnyInput, AnyOutput, CanBeConnectedTo } from "../../shared/types.js";

export interface Component<
  InputTypes extends AnyInput = AnyInput,
  OutputTypes extends AnyOutput = AnyOutput
> extends ToStringAndUUID {
  readonly isComponent: true
  isBypassed: ControlInput<boolean>
  isMuted: ControlInput<boolean>
  triggerInput: ControlInput<typeof constants.TRIGGER>

  outputs: OutputTypes;
  inputs: InputTypes;
  getDefaultInput(): ComponentInput<unknown>;
  getDefaultOutput(): AbstractOutput<unknown>;
  //outputAdded<T>(output: AbstractOutput<T>): void;
  //inputAdded<T>(input: AbstractInput<T>): void;
  //inputDidUpdate<T>(input: AbstractInput<T>, newValue: T);
  setBypassed(isBypassed?: boolean): void;
  setMuted(isMuted?: boolean): void;
  connect<T extends CanBeConnectedTo>(destination: T): Component;
  withInputs(inputDict: { [name: string]: Connectable }): Component;
  setValues(valueObj: any);
  wasConnectedTo(other: Connectable): void;
  sampleSignal(samplePeriodMs?: number): Component;
  propagateUpdatedInput<T>(input: AbstractInput<T>, newValue: T);
}