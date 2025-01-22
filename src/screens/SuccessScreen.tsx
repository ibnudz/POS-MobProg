import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SuccessScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Payment Successful!</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
  },
});

export default SuccessScreen;
