import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="WelcomePage">
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="WelcomePage" options={{ headerShown: false }} />
        <Stack.Screen name="feedbackSuccess" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="faq" options={{ headerShown: false }} />
        <Stack.Screen name="services/produk" options={{ headerShown: false }} />
        <Stack.Screen name="services/promo" options={{ headerShown: false }} />
        <Stack.Screen name="services/cabang" options={{ headerShown: false }} />
        <Stack.Screen name="riwayat/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="services/digital"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="services/agent" options={{ headerShown: false }} />
        <Stack.Screen name="services/wondr" options={{ headerShown: false }} />
        <Stack.Screen name="complaint/chat" options={{ headerShown: false }} />
        <Stack.Screen
          name="complaint/confirmation"
          options={{ headerShown: false }}
        />

        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
