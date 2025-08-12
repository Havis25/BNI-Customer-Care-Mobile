import { router } from "expo-router";
import { useEffect } from "react";
import Splashscreen from "../components/Splashscreen";

export default function Index() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/WelcomePage");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return <Splashscreen />;
}
