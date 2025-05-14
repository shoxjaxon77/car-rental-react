import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { createBooking, useApi } from '../hooks/useApi';

export default function Payment() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { totalDays, pricePerDay, carId, startDate, endDate, phoneNumber, note } = params;
  const api = useApi();

  // Convert params to proper types
  const carIdString = Array.isArray(carId) ? carId[0] : carId;
  const startDateString = Array.isArray(startDate) ? startDate[0] : startDate;
  const endDateString = Array.isArray(endDate) ? endDate[0] : endDate;
  const phoneNumberString = Array.isArray(phoneNumber) ? phoneNumber[0] : phoneNumber;
  const noteString = Array.isArray(note) ? note[0] : note;
  const totalDaysNum = Number(Array.isArray(totalDays) ? totalDays[0] : totalDays);
  const pricePerDayNum = Number(Array.isArray(pricePerDay) ? pricePerDay[0] : pricePerDay);

  const [cardNumber, setCardNumber] = useState('');
  const [formattedCardNumber, setFormattedCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');

  // Error states
  const [cardNumberError, setCardNumberError] = useState('');
  const [expiryDateError, setExpiryDateError] = useState('');
  const [cvvError, setCvvError] = useState('');
  const [cardHolderNameError, setCardHolderNameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = totalDaysNum * pricePerDayNum;

  const validateInputs = () => {
    let isValid = true;
    
    // Reset all errors
    setCardNumberError('');
    setExpiryDateError('');
    setCvvError('');
    setCardHolderNameError('');

    // Card number validation
    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      setCardNumberError('Karta raqami 16 ta raqamdan iborat bo\'lishi kerak');
      isValid = false;
    }

    // Expiry date validation
    if (!expiryDate || !/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiryDate)) {
      setExpiryDateError('Yaroqlilik muddati MM/YY formatida bo\'lishi kerak');
      isValid = false;
    } else {
      const [month, year] = expiryDate.split('/');
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const now = new Date();
      if (expiry < now) {
        setExpiryDateError('Karta muddati tugagan');
        isValid = false;
      }
    }

    // CVV validation
    if (!cvv || !/^[0-9]{3}$/.test(cvv)) {
      setCvvError('CVV 3 ta raqamdan iborat bo\'lishi kerak');
      isValid = false;
    }

    // Card holder name validation
    if (!cardHolderName || cardHolderName.length < 3) {
      setCardHolderNameError('Karta egasining ismini kiriting');
      isValid = false;
    }

    return isValid;
  };

  const handlePayment = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    console.log('Payment process started...');
    try {

      if (!cardNumber || cardNumber.length !== 16 || !/^\d{16}$/.test(cardNumber)) {
        setIsSubmitting(false);
        Alert.alert('Xatolik', 'Karta raqamini to\'g\'ri kiriting');
        return;
      }

      if (!expiryDate || !expiryDate.includes('/')) {
        setIsSubmitting(false);
        Alert.alert('Xatolik', 'Amal qilish muddatini to\'g\'ri kiriting (MM/YY)');
        return;
      }

      if (!cvv || cvv.length !== 3) {
        setIsSubmitting(false);
        Alert.alert('Xatolik', 'CVV kodni to\'g\'ri kiriting');
        return;
      }

      if (!cardHolderName) {
        setIsSubmitting(false);
        Alert.alert('Xatolik', 'Karta egasining ismini kiriting');
        return;
      }

      const token = await AsyncStorage.getItem('userToken');
      console.log('Token status:', token ? 'Found' : 'Not found');
      
      if (!token) {
        setIsSubmitting(false);
        Alert.alert('Xatolik', 'Avtorizatsiyadan o\'tilmagan');
        router.replace('/login');
        return;
      }

      console.log('Preparing booking data...');
      console.log('Car ID:', carIdString);
      console.log('Start Date:', startDateString);
      console.log('End Date:', endDateString);
      console.log('Total Amount:', totalAmount);
      
      // Convert dates to YYYY-MM-DD format
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
      };

      // Validate all inputs before proceeding
      if (!validateInputs()) {
        return;
      }

      const bookingData = {
        car_id: parseInt(carIdString),
        start_date: formatDate(startDateString),
        end_date: formatDate(endDateString),
        phone_number: phoneNumberString,
        note: noteString || '',
        payment_details: {
          card_number: cardNumber,  // Already clean number
          expiry_date: expiryDate,
          cvv: cvv,
          card_holder_name: cardHolderName
        }
      };

      console.log('Sending booking request...');
      
      // Token was already checked above
      
      console.log('Token verified, sending booking data:', bookingData);
      const response = await createBooking(bookingData);
      console.log('Booking response:', response);
      
      if (response.success) {
        Alert.alert(
          'Muvaffaqiyatli',
          'To\'lov amalga oshirildi va buyurtmangiz qabul qilindi. Buyurtmangiz admin tomonidan ko\'rib chiqiladi.',
          [{ text: 'OK', onPress: () => {
            console.log('Navigating to bookings...');
            router.replace('/(tabs)');
          }}]
        );
      } else {
        throw new Error(response.message || 'Buyurtma yaratishda xatolik');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      let errorMessage = 'Server bilan bog\'lanishda xatolik yuz berdi';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      if (errorMessage.includes('Token') || errorMessage.includes('avtorizatsiya')) {
        router.replace('/login');
      }
      
      Alert.alert('Xatolik', errorMessage);
      setIsSubmitting(false);
    } finally {
      console.log('Payment process completed');
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>To'lov ma'lumotlari</Text>
        
        <Text style={styles.label}>Karta raqami</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, cardNumberError ? styles.inputError : null]}
            placeholder="0000 0000 0000 0000"
            value={formattedCardNumber}
            onChangeText={(text) => {
              setCardNumberError('');
              // Remove any non-digit characters
              const cleanNumber = text.replace(/\D/g, '');
              
              // Format the number with spaces
              const parts = [];
              for (let i = 0; i < cleanNumber.length && i < 16; i += 4) {
                parts.push(cleanNumber.slice(i, i + 4));
              }
              const formatted = parts.join(' ');
              
              setFormattedCardNumber(formatted);
              setCardNumber(cleanNumber);
            }}
            keyboardType="numeric"
            maxLength={19}
          />
          {cardNumberError ? <Text style={styles.errorText}>{cardNumberError}</Text> : null}
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Amal qilish muddati</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, expiryDateError ? styles.inputError : null]}
                placeholder="MM/YY"
                value={expiryDate}
                onChangeText={(text) => {
                  setExpiryDateError('');
                  const formattedText = text
                    .replace(/\D/g, '')
                    .replace(/^([0-9]{2})/, '$1/')
                    .trim();
                  setExpiryDate(formattedText);
                }}
                keyboardType="numeric"
                maxLength={5}
              />
              {expiryDateError ? <Text style={styles.errorText}>{expiryDateError}</Text> : null}
            </View>
          </View>

          <View style={styles.half}>
            <Text style={styles.label}>CVV</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, cvvError ? styles.inputError : null]}
                placeholder="123"
                value={cvv}
                onChangeText={(text) => {
                  setCvvError('');
                  setCvv(text);
                }}
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
              />
              {cvvError ? <Text style={styles.errorText}>{cvvError}</Text> : null}
            </View>
          </View>
        </View>

        <Text style={styles.label}>Karta egasining ismi</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, cardHolderNameError ? styles.inputError : null]}
            placeholder="JOHN DOE"
            value={cardHolderName}
            onChangeText={(text) => {
              setCardHolderNameError('');
              setCardHolderName(text.toUpperCase());
            }}
            autoCapitalize="characters"
          />
          {cardHolderNameError ? <Text style={styles.errorText}>{cardHolderNameError}</Text> : null}
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryText}>Kunlik narx: {pricePerDay} so'm</Text>
          <Text style={styles.summaryText}>Kunlar soni: {totalDays}</Text>
          <Text style={styles.totalAmount}>Jami: {totalAmount} so'm</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handlePayment}>
          <Text style={styles.buttonText}>To'lovni amalga oshirish</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  inputError: {
    borderColor: '#ff0000',
    borderWidth: 1,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  half: {
    width: '47%',
  },
  summary: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
