import { AudioSignalStream } from "./AudioSignalStream.js";
import { Connectable } from "./base/Connectable.js";

export interface FFTStream extends Connectable {
  ifft(fftSize?: number): AudioSignalStream;
  // TODO: add others, capture etc.
}