import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Colors } from '../constants/Colors';

export default function Splashscreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/log-bcare copy.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.brightGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});
