import React from 'react';
import { StyleSheet, Text, Button } from 'react-native';
import { useFonts } from 'expo-font';
import 'localstorage-polyfill';
// In a React Native application
import Navigate from './navigate';


export default function App() {
  let [fontsLoaded] = useFonts({
    'Gilroy': require('./assets/fonts/gilroy-regular.ttf')
  });

  if (!fontsLoaded) {
    return <Text>Загрузка...</Text>;
  }
  return (
    <Navigate />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});