import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import apiClient from '../services/apiClient';

const ProductScreen = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  // Fetch products from the server
  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products');
      setProducts(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch products.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddOrUpdateProduct = async () => {
    if (!name || !price) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      if (editingProductId) {
        // Update product
        await apiClient.put(`/products/${editingProductId}`, { name, price });
        Alert.alert('Success', 'Product updated successfully.');
      } else {
        // Add product
        await apiClient.post('/products', { name, price });
        Alert.alert('Success', 'Product added successfully.');
      }

      setName('');
      setPrice('');
      setEditingProductId(null);
      fetchProducts();
    } catch (error) {
      Alert.alert('Error', 'Failed to save product.');
    }
  };

  const handleEditProduct = (product: any) => {
    setName(product.name);
    setPrice(product.price.toString());
    setEditingProductId(product.id);
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await apiClient.delete(`/products/${id}`);
      Alert.alert('Success', 'Product deleted successfully.');
      fetchProducts();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete product.');
    }
  };

  const renderProduct = ({ item }: { item: any }) => (
    <View style={styles.productItem}>
      <Text style={styles.productText}>Name: {item.name}</Text>
      <Text style={styles.productText}>Price: Rp.{item.price}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditProduct(item)}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteProduct(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Products</Text>
      <TextInput
        placeholder="Product Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button
        title={editingProductId ? 'Update Product' : 'Add Product'}
        onPress={handleAddOrUpdateProduct}
      />
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  listContainer: {
    marginTop: 20,
  },
  productItem: {
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  productText: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ProductScreen;
