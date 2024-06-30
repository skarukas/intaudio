import { ToStringAndUUID } from "./base/ToStringAndUUID.js"

export class BaseEvent extends ToStringAndUUID {
  _isLocal = false
  #defaultIgnored = false
  ignoreDefault() {
    this.#defaultIgnored = true
  }
  defaultIsIgnored() {
    return this.#defaultIgnored
  }
}

export class BypassEvent extends BaseEvent {
  _isLocal = true
  constructor(public shouldBypass: boolean) { super() }
}

export class MuteEvent extends BaseEvent {
  _isLocal = true
  constructor(public shouldMute: boolean) { super() }
}
export enum KeyEventType {
  KEY_DOWN = 'keydown',
  KEY_UP = 'keyup'
}

export class KeyEvent extends BaseEvent {
  key: any
  constructor(
    public eventType: KeyEventType,
    public eventPitch: number = 64,
    public eventVelocity: number = 64,
    key? : any) {
    super()
    this.key = key ?? eventPitch
  }
}