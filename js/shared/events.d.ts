import { ToStringAndUUID } from "./base/ToStringAndUUID.js";
export declare class BaseEvent extends ToStringAndUUID {
    #private;
    _isLocal: boolean;
    ignoreDefault(): void;
    defaultIsIgnored(): boolean;
}
export declare class BypassEvent extends BaseEvent {
    shouldBypass: boolean;
    _isLocal: boolean;
    constructor(shouldBypass: boolean);
}
export declare class MuteEvent extends BaseEvent {
    shouldMute: boolean;
    _isLocal: boolean;
    constructor(shouldMute: boolean);
}
export declare enum KeyEventType {
    KEY_DOWN = "keydown",
    KEY_UP = "keyup"
}
export declare class KeyEvent extends BaseEvent {
    eventType: KeyEventType;
    eventPitch: number;
    eventVelocity: number;
    key: any;
    constructor(eventType: KeyEventType, eventPitch?: number, eventVelocity?: number, key?: any);
}
