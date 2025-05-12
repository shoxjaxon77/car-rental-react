import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const { login } = useAuth();

  const handleRegister = async () => {
    try {
      // Validatsiya
      if (!username || !password || !confirmPassword || !firstName || !lastName || !phoneNumber) {
        alert('Iltimos, barcha maydonlarni to\'ldiring');
        return;
      }

      if (password !== confirmPassword) {
        alert('Parollar mos kelmadi');
        return;
      }

      // Telefon raqam validatsiyasi
      const phoneRegex = /^\+998\d{9}$/;
      if (!phoneRegex.test(phoneNumber)) {
        alert('Telefon raqamni to\'g\'ri formatda kiriting: +998901234567');
        return;
      }

      // Email validatsiyasi (agar kiritilgan bo'lsa)
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          alert('Email formatini to\'g\'ri kiriting');
          return;
        }
      }

      // Ro'yxatdan o'tish
      console.log('Foydalanuvchi ro\'yxatdan o\'tmoqda:', { username, firstName, lastName, phoneNumber, email });
      const registerResponse = await fetch('https://car-rental-api-gyfw.onrender.com/api/v1/users/api/v1/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          password2: password,  // Backend password2 ni ham talab qiladi
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          email: email || '',
        }),
      });

      console.log('Ro\'yxatdan o\'tish holati:', registerResponse.status);
      const responseText = await registerResponse.text();
      console.log('Javob:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('JSON o\'qish xatosi:', e);
        alert('Server javobini qayta ishlashda xatolik');
        return;
      }

      if (!registerResponse.ok) {
        if (responseData && typeof responseData === 'object' && 'errors' in responseData) {
          // Barcha xatoliklarni bir xabarda ko'rsatish
          const errors = responseData.errors as Record<string, string[]>;
          const errorMessages = Object.entries(errors)
            .map(([field, fieldErrors]) => `${field}: ${fieldErrors.join(', ')}`)
            .join('\n');
          alert(`Xatoliklar:\n${errorMessages}`);
        } else {
          const message = responseData && typeof responseData === 'object' ?
            (responseData.detail || responseData.message) : 'Ro\'yxatdan o\'tishda xatolik yuz berdi';
          alert(message);
        }
        return;
      }

      // Login qilish
      const loginResponse = await fetch('https://car-rental-api-gyfw.onrender.com/api/v1/users/api/v1/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const loginData = await loginResponse.json();
      if (!loginResponse.ok) {
        alert(loginData.detail || 'Login qilishda xatolik');
        return;
      }

      const token = loginData.access;

      // User ma'lumotlarini saqlash
      const userDataToSave = {
        username,
        email,
        phone_number: phoneNumber,
        first_name: firstName,
        last_name: lastName,
      };

      await AsyncStorage.setItem('userData', JSON.stringify(userDataToSave));
      await AsyncStorage.setItem('token', token);
      await login(token);

    } catch (error) {
      console.error('Ro\'yxatdan o\'tish xatosi:', error);
      const errorMessage = error instanceof Error ? error.message : 'Noma\'lum xatolik';
      alert(`Ro'yxatdan o'tishda xatolik: ${errorMessage}`);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>Ro'yxatdan o'tish</ThemedText>

        <TextInput
          style={styles.input}
          placeholder="Login"
          placeholderTextColor="#666"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="Ismingiz"
          placeholderTextColor="#666"
          value={firstName}
          onChangeText={setFirstName}
        />

        <TextInput
          style={styles.input}
          placeholder="Familiyangiz"
          placeholderTextColor="#666"
          value={lastName}
          onChangeText={setLastName}
        />

        <TextInput
          style={styles.input}
          placeholder="Telefon raqamingiz (+998901234567)"
          placeholderTextColor="#666"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Email (ixtiyoriy maydon)"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Parolingiz"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Parolingizni tasdiqlang"
          placeholderTextColor="#666"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <ThemedText style={styles.buttonText}>Ro'yxatdan o'tish</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/login')}>
          <ThemedText style={styles.linkText}>Hisobingiz bormi? Kirish</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FFD600',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#FFD600',
    textAlign: 'center',
    marginTop: 20,
  },
});
