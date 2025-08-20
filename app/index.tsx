import Splashscreen from "@/components/Splashscreen";
import { router } from "expo-router";
import { useEffect, useState, startTransition } from "react";

export default function Index() {
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (splashDone) {
      startTransition(() => {
        router.replace("/WelcomePage");
      });
    }
  }, [splashDone]);

  return <Splashscreen onFinish={() => setSplashDone(true)} />;
}
