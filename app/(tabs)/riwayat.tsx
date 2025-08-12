import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '@/constants/Fonts';

export default function RiwayatScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Riwayat Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: Fonts.regular,
    fontSize: 16,
  },
});