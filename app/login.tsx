import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      if (!username || !password) {
        alert('Iltimos, username va parolni kiriting');
        return;
      }

      // Login qilish va token olish
      console.log('Login ma\'lumotlari:', { username });
      
      const loginResponse = await fetch('https://car-rental-api-aeh4.onrender.com/api/v1/users/api/v1/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      console.log('Login javob holati:', loginResponse.status);
      
      const responseText = await loginResponse.text();
      console.log('Javob:', responseText);
      
      let loginData;
      try {
        loginData = JSON.parse(responseText);
      } catch (e) {
        console.error('JSON parse error:', e);
        alert('Server javobini qayta ishlashda xatolik');
        return;
      }

      if (!loginResponse.ok) {
        alert(loginData.detail || 'Username yoki parol noto\'g\'ri');
        return;
      }

      const token = loginData.access;
      console.log('Token olingan:', token ? 'Ha' : 'Yo\'q');

      // Foydalanuvchi ma'lumotlarini olish
      const userResponse = await fetch('https://car-rental-api-aeh4.onrender.com/api/v1/users/api/v1/me/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Foydalanuvchi ma\'lumotlari holati:', userResponse.status);
      
      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error('User info error:', errorText);
        alert('Foydalanuvchi ma\'lumotlarini olishda xatolik');
        return;
      }

      const userDataText = await userResponse.text();
      console.log('Foydalanuvchi ma\'lumotlari:', userDataText);
      
      let userDataResponse;
      try {
        userDataResponse = JSON.parse(userDataText);
      } catch (e) {
        console.error('User data parse error:', e);
        alert('Foydalanuvchi ma\'lumotlarini qayta ishlashda xatolik');
        return;
      }
      
      if (!userDataResponse.success) {
        alert('Foydalanuvchi ma\'lumotlarini olishda xatolik');
        return;
      }

      const userData = userDataResponse.data;
      
      // Foydalanuvchi ma'lumotlarini saqlash
      const userDataToSave = {
        username: userData.username,
        email: userData.email,
        phone_number: userData.phone_number,
        first_name: userData.first_name,
        last_name: userData.last_name
      };
      
      console.log('Foydalanuvchi ma\'lumotlari saqlanmoqda:', userDataToSave);
      await AsyncStorage.setItem('userData', JSON.stringify(userDataToSave));

      // Token ni saqlash va login qilish
      console.log('Token saqlanmoqda va tizimga kirilmoqda');
      await AsyncStorage.setItem('userToken', token);
      await login(token);
    } catch (error) {
      console.error('Login error details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Noma\'lum xatolik';
      alert(`Xatolik yuz berdi: ${errorMessage}`);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>Xush kelibsiz!</ThemedText>
        <ThemedText style={styles.subtitle}>Davom etish uchun tizimga kiring</ThemedText>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Login</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Loginingizni kiriting"
              placeholderTextColor="#666"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Parol</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Parolingizni kiriting"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <ThemedText style={styles.forgotPasswordText}>Parolni unutdingizmi?</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <ThemedText style={styles.loginButtonText}>Kirish</ThemedText>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <ThemedText style={styles.signupText}>Hisobingiz yo'qmi? </ThemedText>
            <TouchableOpacity onPress={() => router.replace('/register')}>
              <ThemedText style={styles.signupLink}>Ro'yxatdan o'tish</ThemedText>
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