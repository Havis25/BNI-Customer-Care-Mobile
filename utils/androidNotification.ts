import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const triggerAndroidNotification = async () => {
  try {
    // Request permissions for both iOS and Android
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      console.log("Notification permission denied");
      return false;
    }

    // Set up notification channel for Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("feedback", {
        name: "Feedback Notifications",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#52B5AB",
      });
    }

    // Show notification immediately for both platforms
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Feedback Berhasil Dikirim",
        body: "Terima kasih atas feedback Anda. Kami akan terus meningkatkan layanan.",
        sound: true,
      },
      trigger: null, // Show immediately
    });

    return true;
  } catch (error) {
    console.error("Error showing notification:", error);
    return false;
  }
};
