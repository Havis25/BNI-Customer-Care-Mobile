import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TestNotification() {
  const [token, setToken] = useState('');

  const getToken = async () => {
    const savedToken = await AsyncStorage.getItem('pushToken');
    setToken(savedToken || 'No token found');
    Alert.alert('Push Token', savedToken || 'No token found');
  };

  const sendLocalNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Local Notification",
        body: 'This is a test notification from your app!',
        data: { data: 'test' },
      },
      trigger: { seconds: 1 },
    });
  };

  const sendPushNotification = async () => {
    const savedToken = await AsyncStorage.getItem('pushToken');
    if (!savedToken) {
      Alert.alert('Error', 'No push token found');
      return;
    }

    const message = {
      to: savedToken,
      sound: 'default',
      title: 'Test Push Notification',
      body: 'Hello from your app!',
      data: { someData: 'test' },
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    Alert.alert('Success', 'Push notification sent!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Notifications</Text>
      
      <TouchableOpacity style={styles.button} onPress={getToken}>
        <Text style={styles.buttonText}>Get Push Token</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={sendLocalNotification}>
        <Text style={styles.buttonText}>Send Local Notification</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={sendPushNotification}>
        <Text style={styles.buttonText}>Send Push Notification</Text>
      </TouchableOpacity>

      {token ? <Text style={styles.token}>Token: {token}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    minWidth: 200,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  token: {
    marginTop: 20,
    fontSize: 12,
    textAlign: 'center',
  },
});