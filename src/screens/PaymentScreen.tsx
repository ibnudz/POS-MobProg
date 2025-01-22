import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation } from '@react-navigation/native';

const PaymentScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const { token } = route.params as { token: string };

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${token}` }}
        onNavigationStateChange={(navState: { url: string | string[]; }) => {
          if (navState.url.includes('transaction-success')) {
            navigation.navigate('Success');
          } else if (navState.url.includes('transaction-failed')) {
            navigation.navigate('Failed');
          }
        }}
      />
    </View>
    
  );
};

export default PaymentScreen;
