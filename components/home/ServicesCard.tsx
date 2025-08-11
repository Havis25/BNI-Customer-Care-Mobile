import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const services = [
  { id: 1, name: "Produk", icon: "💳" },
  { id: 2, name: "Promo", icon: "🎁" },
  { id: 3, name: "Cabang Dana TM", icon: "🏪" },
  { id: 4, name: "Layanan Digital", icon: "📱" },
  { id: 5, name: "Agent BNI", icon: "👨‍💼" },
  { id: 6, name: "Wondr by BNI", icon: "✨" },
];

export default function ServicesCard() {
  return (
    <View style={styles.servicesCard}>
      <View style={styles.cardHeader}>
        <ThemedText style={styles.cardIcon}>🏦</ThemedText>
        <ThemedText type="subtitle" style={styles.cardTitle}>
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
                  route = "services/digital";
                  break;
                case 5:
                  route = "services/agent";
                  break;
                case 6:
                  route = "services/wondr";
                  break;
              }
              router.push(route as any);
            }}
          >
            <View style={styles.serviceIconContainer}>
              <ThemedText style={styles.serviceIcon}>{service.icon}</ThemedText>
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
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFE4D6",
    shadowColor: "#E0EE59",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  serviceItem: {
    width: "30%",
    alignItems: "center",
    marginBottom: 20,
  },
  serviceIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: "#FFF3E0",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  serviceIcon: {
    fontSize: 20,
  },
  serviceName: {
    fontSize: 11,
    textAlign: "center",
    color: "#333",
    fontWeight: "500",
  },
});
