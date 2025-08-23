import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Fonts } from "@/constants/Fonts";

const { width, height } = Dimensions.get("window");

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  image: any;
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    title: "Sampaikan Keluhan dengan Mudah",
    description:
      "Ajukan keluhan hanya dalam beberapa langkah. Pilih kanal, tulis kronologi, dan kirim tanpa ribet.",
    image: require("../assets/images/onboarding/ob1.png"),
  },
  {
    id: 2,
    title: "Pantau Progres Secara Real-time",
    description:
      "Lihat status penanganan dari diterima, verifikasi, hingga selesai—semuanya diperbarui otomatis.",
    image: require("../assets/images/onboarding/ob2.png"),
  },
  {
    id: 3,
    title: "Chat dan Call dengan Agen",
    description:
      "Terhubung lewat live chat dan call untuk pertanyaan atau pembaruan cepat kapan pun dibutuhkan.",
    image: require("../assets/images/onboarding/ob3.png"),
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      router.replace("/login");
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
    }
  };

  const handleSkip = () => router.replace("/login");

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      {/* Ilustrasi */}
      <Image
        source={item.image}
        resizeMode="contain"
        style={styles.illustration}
      />
      {/* Teks */}
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#DEEF5A", "#FCFDEE"]}
        locations={[0.23, 0.37]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header with Logo and Skip */}
      <View style={styles.header}>
        <Image
          source={require("../assets/images/log-bcare.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Lewati</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
        style={styles.flatList}
      />

      {/* Navigasi */}
      <View style={styles.navigation}>
        {currentIndex > 0 ? (
          <TouchableOpacity style={styles.backButton} onPress={handlePrevious}>
            <MaterialIcons name="arrow-back" size={20} color="#52B5AB" />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <View style={styles.pagination}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex && styles.activeDot]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <MaterialIcons
            name={
              currentIndex === slides.length - 1 ? "check" : "arrow-forward"
            }
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const PRIMARY = "#52B5AB";

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  logo: {
    width: 100,
    height: 40,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: "#52B5AB",
  },

  flatList: {
    flex: 1,
  },

  slide: {
    width,
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 28,
    paddingTop: -4,
  },
  illustration: {
    width: 359,
    height: 359,
    marginTop: 80,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.semiBold,
    color: "#22413F",
    textAlign: "center",
    marginTop: 18,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#396D6A",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 0,
  },

  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 6,
  },
  nextButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#52B5AB",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#52B5AB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
  },
  placeholder: {
    width: 48,
    height: 48,
  },

  pagination: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  activeDot: {
    width: 24,
    backgroundColor: PRIMARY,
  },
});
