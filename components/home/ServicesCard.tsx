import { ThemedText } from "@/components/ThemedText";
import { Fonts } from "@/constants/Fonts";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const services = [
  { id: 1, name: "Produk Bank BNI", icon: "credit-card-multiple-outline", bgColor: "#1F72F1" },
  { id: 2, name: "Promo BNI", icon: "shopping", bgColor: "#71DAD3" },
  { id: 3, name: "Cabang & ATM", icon: "home-city-outline", bgColor: "#9C7FDC" },
  { id: 4, name: "Merchant Agen 46", icon: "face-agent", bgColor: "#FFC533" },
  { id: 5, name: "Layanan Digital", icon: "cellphone", bgColor: "#FF8636" },
  { id: 6, name: "Wondr by BNI", icon: require("@/assets/images/wondr.png"), bgColor: "#E0EE59", isImage: true },
];

export default function ServicesCard() {
  return (
    <View style={styles.servicesCard}>
      <View style={styles.cardHeader}>
        <ThemedText style={styles.cardTitle}>
          Layanan BNI
        </ThemedText>
      </View>

      <View style={styles.servicesGrid}>
        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={styles.serviceItem}
            onPress={() => {
              let route = "";
              switch (service.id) {
                case 1:
                  route = "services/produk";
                  break;
                case 2:
                  route = "services/promo";
                  break;
                case 3:
                  route = "services/cabang";
                  break;
                case 4:
                  route = "services/agent";
                  break;
                case 5:
                  route = "services/digital";
                  break;
                case 6:
                  route = "services/wondr";
                  break;
              }
              router.push(route as any);
            }}
          >
            <View
              style={[
                styles.serviceIconContainer,
                { backgroundColor: service.bgColor },
              ]}
            >
              {service.isImage ? (
                <Image
                  source={service.icon}
                  style={{ width: 24, height: 24, resizeMode: "contain" }}
                />
              ) : (
                <MaterialCommunityIcons
                  name={service.icon as any}
                  size={24}
                  color="white"
                />
              )}
            </View>
            <ThemedText style={styles.serviceName}>{service.name}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  servicesCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 80,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: "black",
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  serviceItem: {
    width: "30%",
    alignItems: "center",
    // marginBottom: 24,
  },
  serviceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 12,
    textAlign: "center",
    color: "black",
    paddingHorizontal: 20,
    lineHeight: 16,
    fontFamily: Fonts.medium,
    marginBottom: 16,
  },
});
