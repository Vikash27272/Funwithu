export type HapticStrength = "light" | "medium" | "heavy";

export function vibrate(type: HapticStrength) {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return;
  }

  if (type === "light") {
    navigator.vibrate(10);
    return;
  }

  if (type === "medium") {
    navigator.vibrate(20);
    return;
  }

  navigator.vibrate([30, 20, 30]);
}
