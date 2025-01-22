import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../services/apiClient';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Email and password cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/login', { email, password });
      const { success, token, message } = response.data;

      if (success) {
        // Save token to AsyncStorage
        await AsyncStorage.setItem('authToken', token);

        // Navigate to TabApp (main app navigation)
        navigation.replace('TabApp');
      } else {
        Alert.alert('Login Failed', message || 'Invalid credentials');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Something went wrong';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={styles.input}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#ff6347" />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}
      <Text style={styles.text}>
        Belum punya akun?{' '}
        <Text
          style={styles.link}
          onPress={() => navigation.navigate('Register')}
        >
          Daftar
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  link: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
