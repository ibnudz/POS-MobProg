import React from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const cartItems = [
  { id: '1', name: 'FAST-R NITRO™ Elite 2 Running Shoes Men', price: 3999000, quantity: 2, image: 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/310217/01/sv01/fnd/IDN/fmt/png/FAST-R-NITRO%E2%84%A2-Elite-2-Running-Shoes-Men' },
  { id: '2', name: 'Call It Spring Moxiee Ankle Strap Sandal Heels', price: 1230000, quantity: 1, image: 'https://dynamic.zacdn.com/e1zI-19jQhvqXJFv4RciZ-2qGDw=/filters:quality(70):format(webp)/https://static-id.zacdn.com/p/call-it-spring-2075-5876954-2.jpg' },
];

const CartScreen = () => {
  const navigation = useNavigation();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Shopping Cart</Text>
      <FlatList
        data={cartItems}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDetails}>
              {item.quantity} x {formatPrice(item.price)}
            </Text>
            <Text style={styles.itemTotal}>
              Total: {formatPrice(item.price * item.quantity)}
            </Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
      <Button title="Proceed to Checkout" onPress={() => navigation.navigate('Checkout' as never)} />
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
  cartItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 3
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  itemDetails: {
    fontSize: 16,
    color: '#555'
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#ff6347'
  },
});

export default CartScreen;
