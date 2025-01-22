import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import apiClient from '../services/apiClient'; // Pastikan Anda memiliki konfigurasi apiClient

const TransactionScreen = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/transactions'); // Endpoint untuk mendapatkan data transaksi
      setTransactions(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateTransactionStatus = async (orderId: string) => {
    try {
      const response = await apiClient.post('/transaction-notification', {
        order_id: orderId,
        transaction_status: 'settlement', // Anda bisa menyesuaikan status yang dikirim
      });

      Alert.alert('Success', `Transaction updated to: ${response.data.message}`);
      fetchTransactions(); // Refresh data transaksi setelah pembaruan
    } catch (error) {
      Alert.alert('Error', 'Failed to update transaction status. Please try again.');
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const renderTransaction = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.text}>
        <Text style={styles.label}>Order ID: </Text>
        {item.id}
      </Text>
      <Text style={styles.text}>
        <Text style={styles.label}>Amount: </Text>
        {item.total_amount}
      </Text>
      <Text style={styles.text}>
        <Text style={styles.label}>Status: </Text>
        {item.payment_status}
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => updateTransactionStatus(item.id)}
      >
        <Text style={styles.buttonText}>Update Status</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6347" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTransaction}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No transactions available.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  text: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  label: {
    fontWeight: 'bold',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#ff6347',
    borderRadius: 4,
    paddingVertical: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#aaa',
    marginTop: 20,
  },
});

export default TransactionScreen;
