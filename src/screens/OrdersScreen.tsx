import React from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';

const orders = [
  { id: '1', name: 'Puma Running Shoes', date: '10 Oct 2024', status: 'Completed' },
  { id: '2', name: 'Men Shirt', date: '21 Nov 2024', status: 'Shipped' },
];

const OrdersScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Orders</Text>
      <FlatList
        data={orders}
        renderItem={({ item }) => (
          <View style={styles.orderItem}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.statusText}>Status: <Text style={styles.status}>{item.status}</Text></Text>
            <Text style={styles.orderDate}>Ordered on: {item.date}</Text>
            <Button 
              title="Order Details" 
              onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
            />
          </View>
        )}
        keyExtractor={(item) => item.id}
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
    marginBottom: 16, 
    color: '#333' 
  },
  orderItem: { 
    backgroundColor: '#fff', 
    padding: 16, 
    marginBottom: 12, 
    borderRadius: 8, 
    elevation: 3, 
    shadowColor: '#000',
    shadowOpacity: 0.1, 
    shadowRadius: 5 
  },
  productName: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 8 
  },
  statusText: { 
    fontSize: 16, 
    marginBottom: 8 
  },
  status: { 
    color: '#ff6347', 
    fontWeight: 'bold' 
  },
  orderDate: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 8 
  },
});

export default OrdersScreen;
