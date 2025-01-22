import React from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';

const CheckoutScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>      
      <Text style={styles.label}>Delivery Address</Text>
      <TextInput
        placeholder="Enter your delivery address"
        style={styles.input}
        multiline={true}
        numberOfLines={4}
      />

      <Button 
        title="Proceed to Pay" 
        onPress={() => navigation.navigate('Orders')} 
        color="#ff6347"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: '#f9f9f9'
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 16 
  },
  label: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 8 
  },
  input: { 
    width: '100%', 
    padding: 12, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderRadius: 8, 
    borderColor: '#ddd', 
    backgroundColor: '#fff', 
    textAlignVertical: 'top',
  },
});

export default CheckoutScreen;
