import { AudioConfig, TypedConfigurable } from "../config.js"

export class ToStringAndUUID extends TypedConfigurable<AudioConfig> {
  _uuid: string
  constructor() {
    super()
    this._uuid = crypto.randomUUID()
  }
  get _className() {
    return this.constructor.name
  }
  toString() {
    return this._className
  }
  get audioContext(): AudioContext {
    return this.config.audioContext
  }
  static get audioContext(): AudioContext {
    return this.config.audioContext
  }
}