var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _BaseEvent_defaultIgnored;
import { ToStringAndUUID } from "./base/ToStringAndUUID.js";
export class BaseEvent extends ToStringAndUUID {
    constructor() {
        super(...arguments);
        this._isLocal = false;
        _BaseEvent_defaultIgnored.set(this, false);
    }
    ignoreDefault() {
        __classPrivateFieldSet(this, _BaseEvent_defaultIgnored, true, "f");
    }
    defaultIsIgnored() {
        return __classPrivateFieldGet(this, _BaseEvent_defaultIgnored, "f");
    }
}
_BaseEvent_defaultIgnored = new WeakMap();
export class BypassEvent extends BaseEvent {
    constructor(shouldBypass) {
        super();
        this.shouldBypass = shouldBypass;
        this._isLocal = true;
    }
}
export class MuteEvent extends BaseEvent {
    constructor(shouldMute) {
        super();
        this.shouldMute = shouldMute;
        this._isLocal = true;
    }
}
export var KeyEventType;
(function (KeyEventType) {
    KeyEventType["KEY_DOWN"] = "keydown";
    KeyEventType["KEY_UP"] = "keyup";
})(KeyEventType || (KeyEventType = {}));
export class KeyEvent extends BaseEvent {
    constructor(eventType, eventPitch = 64, eventVelocity = 64, key) {
        super();
        this.eventType = eventType;
        this.eventPitch = eventPitch;
        this.eventVelocity = eventVelocity;
        this.key = key !== null && key !== void 0 ? key : eventPitch;
    }
}
