import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { login } = useAuth();

  const handleLogin = async () => {
    console.log('Login started with:', { username, password });
    try {
      const response = await fetch('https://car-rental-api-gyfw.onrender.com/api/v1/users/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const responseData = await response.text();
      console.log('Response status:', response.status);
      console.log('Response data:', responseData);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = JSON.parse(responseData);
        console.log('Parsed data:', data);
        // Token ni saqlash va login qilish
        console.log('Trying to save token:', data.access);
        await login(data.access);
        console.log('Token saved, redirecting...');
      } else {
        // Login xatoligi yuz bersa
        alert('Username yoki parol noto\'g\'ri');
      }
    } catch (error) {
      alert('Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring');
      console.error('Login error:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>Welcome Back!</ThemedText>
        <ThemedText style={styles.subtitle}>Sign in to continue</ThemedText>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Username</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              placeholderTextColor="#666"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Password</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <ThemedText style={styles.forgotPasswordText}>Forgot Password?</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <ThemedText style={styles.loginButtonText}>Sign In</ThemedText>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <ThemedText style={styles.signupText}>Don't have an account? </ThemedText>
            <TouchableOpacity onPress={() => router.replace('/signup')}>
              <ThemedText style={styles.signupLink}>Sign Up</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#FFD600',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#FFD600',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: '#999',
    fontSize: 14,
  },
  signupLink: {
    color: '#FFD600',
    fontSize: 14,
    fontWeight: '600',
  },
}); 