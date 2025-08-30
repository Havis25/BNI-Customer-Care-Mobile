import { DeviceEventEmitter } from "react-native";

/**
 * Trigger user activity untuk reset auto logout timer
 * Dapat dipanggil dari komponen mana saja
 */
export const triggerUserActivity = () => {
  // Emit custom event
  DeviceEventEmitter.emit("userActivity");

  // Juga panggil global function jika tersedia
  if ((global as any).triggerUserActivity) {
    (global as any).triggerUserActivity();
  }
};

/**
 * Simple utility hook untuk mengakses triggerUserActivity
 * Gunakan ini untuk utility sederhana
 */
export const useUserActivityUtil = () => {
  return {
    triggerActivity: triggerUserActivity,
  };
};
