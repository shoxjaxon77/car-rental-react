import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, TextInput, TouchableOpacity, View, Alert } from 'react-native';

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login } = useAuth();

  const validateUzbekPhoneNumber = (phone: string) => {
    const phoneRegex = /^\+998[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // If the number doesn't start with 998, add it
    const withPrefix = cleaned.startsWith('998') ? cleaned : `998${cleaned}`;
    
    // Add the + sign at the beginning
    return `+${withPrefix}`;
  };

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Xatolik', 'Parollar bir xil emas');
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!validateUzbekPhoneNumber(formattedPhone)) {
      Alert.alert('Xatolik', 'Telefon raqamni to\'g\'ri formatda kiriting\n(Masalan: +998901234567)');
      return;
    }

    try {
      const response = await fetch('https://car-rental-api-gyfw.onrender.com/api/v1/users/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          phone_number: formatPhoneNumber(phoneNumber),
        }),
      });

      const responseData = await response.text();
      console.log('Response status:', response.status);
      console.log('Response data:', responseData);

      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseData);
          if (errorData.username) {
            alert('Bu username allaqachon mavjud');
          } else if (errorData.email) {
            alert('Bu email allaqachon ro\'yxatdan o\'tgan');
          } else {
            alert('Ro\'yxatdan o\'tishda xatolik yuz berdi');
          }
        } catch {
          alert('Ro\'yxatdan o\'tishda xatolik yuz berdi');
        }
        return;
      }

      // Ro'yxatdan o'tish muvaffaqiyatli bo'lsa, login qilamiz
      const loginResponse = await fetch('https://car-rental-api-gyfw.onrender.com/api/v1/users/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (loginResponse.ok) {
        const data = await loginResponse.json();
        const token = data.access;

        // Foydalanuvchi ma'lumotlarini olish
        const userResponse = await fetch('https://car-rental-api-gyfw.onrender.com/api/v1/users/me/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!userResponse.ok) {
          alert('Foydalanuvchi ma\'lumotlarini olishda xatolik');
          return;
        }

        const userData = await userResponse.json();
        
        // Foydalanuvchi ma'lumotlarini saqlash
        await AsyncStorage.setItem('userData', JSON.stringify({
          username: userData.username,
          email: userData.email,
          phone_number: userData.phone_number
        }));

        await login(token);
      } else {
        console.error('Login failed after registration');
        alert('Ro\'yxatdan o\'tish muvaffaqiyatli, lekin tizimga kirishda xatolik yuz berdi');
      }
    } catch (error) {
      alert('Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring');
      console.error('Signup error:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>Create Account</ThemedText>
        <ThemedText style={styles.subtitle}>Sign up to get started</ThemedText>

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
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Phone Number</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="+998 90 123 45 67"
              placeholderTextColor="#666"
              value={phoneNumber}
              onChangeText={(text) => {
                // Only allow digits and + symbol
                const cleaned = text.replace(/[^0-9+]/g, '');
                setPhoneNumber(cleaned);
              }}
              keyboardType="phone-pad"
              maxLength={13}
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

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Confirm Password</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#666"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={styles.signupButton}
            onPress={handleSignup}
          >
            <ThemedText style={styles.signupButtonText}>Sign Up</ThemedText>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <ThemedText style={styles.loginText}>Already have an account? </ThemedText>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <ThemedText style={styles.loginLink}>Sign In</ThemedText>
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
  signupButton: {
    backgroundColor: '#FFD600',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  signupButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: '#999',
    fontSize: 14,
  },
  loginLink: {
    color: '#FFD600',
    fontSize: 14,
    fontWeight: '600',
  },
}); 