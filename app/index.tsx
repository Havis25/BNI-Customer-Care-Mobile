// app/index.tsx
import Splashscreen from "@/components/Splashscreen";
import { router } from "expo-router";
import { useEffect, useState, startTransition } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (!splashDone) return;

    (async () => {
      const loginStatus = await AsyncStorage.getItem("isLoggedIn");
      const isLoggedIn = loginStatus === "true";
      startTransition(() => {
        router.replace(isLoggedIn ? "/(tabs)" : "/WelcomePage");
      });
    })();
  }, [splashDone]);

  return <Splashscreen onFinish={() => setSplashDone(true)} />;
}
