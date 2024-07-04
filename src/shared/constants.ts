export default Object.freeze({
  MUTED_CLASS: "component-muted",
  BYPASSED_CLASS: "component-bypassed",
  COMPONENT_CONTAINER_CLASS: "modular-container",
  KEYBOARD_KEY_CLASS: "keyboard-key",
  KEYBOARD_KEY_PRESSED_CLASS: "keyboard-key-pressed",
  BYPASS_INDICATOR_CLASS: "bypass-indicator",
  MONITOR_VALUE_CLASS: "monitor-value",
  MONITOR_OUT_OF_BOUNDS_CLASS: "monitor-out-of-bounds",
  UNINITIALIZED_CLASS: "component-uninitialized",
  BANG_CLASS: "bang",
  BANG_PRESSED_CLASS: "bang-pressed",
  MIDI_LEARN_LISTENING_CLASS: "midi-learn-listening",
  MIDI_LEARN_ASSIGNED_CLASS: "midi-learn-assigned",
  EVENT_MOUSEDOWN: "mousedown",
  EVENT_MOUSEUP: "mouseup",
  TRIGGER: Symbol("trigger"),
  MIN_PLAYBACK_RATE: 0.0625,
  MAX_PLAYBACK_RATE: 16.0,
  // Special placeholder for when an input both has no defaultValue and it has 
  // never been set.
  // TODO: need special value?
  UNSET_VALUE: undefined
})