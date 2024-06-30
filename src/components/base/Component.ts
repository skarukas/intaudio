import { AbstractInput } from "../../io/input/AbstractInput.js";
import { ComponentInput } from "../../io/input/ComponentInput.js";
import { ControlInput } from "../../io/input/ControlInput.js";
import { AbstractOutput } from "../../io/output/AbstractOutput.js";
import { Connectable } from "../../shared/base/Connectable.js";
import constants from "../../shared/constants.js";
import { CanBeConnectedTo } from "../../shared/types.js";

export interface Component {
  isBypassed: ControlInput<boolean>
  isMuted: ControlInput<boolean>
  triggerInput: ControlInput<typeof constants.TRIGGER>

  outputs: { [name: string]: AbstractOutput };
  inputs: { [name: string]: AbstractInput };
  getDefaultInput(): ComponentInput<unknown>;
  getDefaultOutput(): AbstractOutput<unknown>;
  outputAdded<T>(output: AbstractOutput<T>): void;
  inputAdded<T>(input: AbstractInput<T>): void;
  inputDidUpdate<T>(input: AbstractInput<T>, newValue: T);
  setBypassed(isBypassed?: boolean): void;
  setMuted(isMuted?: boolean): void;
  connect<T extends CanBeConnectedTo>(destination: T): Component;
  setValues(valueObj: any);
  wasConnectedTo(other: Connectable): void;
  sampleSignal(samplePeriodMs?: number): Component;
  propagateUpdatedInput<T>(input: AbstractInput<T>, newValue: T);
}