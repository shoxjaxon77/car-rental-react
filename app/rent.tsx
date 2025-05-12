import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthenticatedApi } from '@/hooks/useApi';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, ViewStyle, TextStyle } from 'react-native';

type Car = {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  seats: number;
  price_per_day: number;
  image: string;
  description: string;
};

export default function RentScreen() {
  const { id } = useLocalSearchParams();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [note, setNote] = useState('');
  const companyAddress = "Toshkent sh., Chilonzor tumani, Bunyodkor ko'chasi, 15-uy";

  useEffect(() => {
    if (id) {
      fetchCarDetails();
    } else {
      setError('Avtomobil identifikatori topilmadi');
    }
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.replace('/login');
        throw new Error('Avtorizatsiyadan o\'tilmagan');
      }

      const response = await fetch(`https://car-rental-api-gyfw.onrender.com/api/v1/cars/api/v1/cars/${id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          router.replace('/login');
          throw new Error('Avtorizatsiyadan o\'tilmagan');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Avtomobil ma\'lumotlarini yuklashda xatolik');
      }

      const data = await response.json();
      if (!data) {
        throw new Error('Avtomobil ma\'lumotlari topilmadi');
      }
      setCar(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
      if (err instanceof Error && err.message === 'Avtorizatsiyadan o\'tilmagan') {
        router.replace('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
    }
    
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(0, 0, 0, 0);
      setStartDate(newDate);
      
      // Agar tanlangan sana tugash sanasidan keyin bo'lsa
      if (newDate > endDate) {
        setEndDate(newDate);
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndPicker(false);
    }
    
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(23, 59, 59, 999);
      
      // Agar tanlangan sana boshlanish sanasidan oldin bo'lsa
      if (newDate < startDate) {
        setEndDate(startDate);
      } else {
        setEndDate(newDate);
      }
    }
  };

  const handleDatePickerConfirm = () => {
    setShowStartPicker(false);
    setShowEndPicker(false);
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^\+?998[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Telefon raqamni tekshirish
      if (!phoneNumber.trim()) {
        throw new Error('Telefon raqamingizni kiriting');
      }

      if (!validatePhoneNumber(phoneNumber.trim())) {
        throw new Error('Telefon raqamini to\'g\'ri formatda kiriting (+998XXXXXXXXX)');
      }

      // Sanalarni tekshirish
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        throw new Error('Boshlanish sanasi bugundan oldin bo\'lishi mumkin emas');
      }

      // Kunlar sonini hisoblash
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (totalDays < 1) {
        throw new Error('Ijara muddati kamida 1 kun bo\'lishi kerak');
      }

      if (!car) {
        throw new Error('Avtomobil ma\'lumotlari yuklanmagan');
      }

      // Check if car is available
      const api = await getAuthenticatedApi();
      const response = await api.get(`/api/v1/cars/api/v1/cars/${car?.id}/`);
      const carDetails = response.data;

      if (!carDetails.is_available || carDetails.available_count === 0) {
        throw new Error('Kechirasiz, bu mashina hozirda band');
      }

      // To'lov sahifasiga o'tish
      router.push({
        pathname: '/payment',
        params: {
          carId: id,
          totalDays: totalDays.toString(),
          pricePerDay: car.price_per_day.toString(),
          phoneNumber: phoneNumber.trim(),
          note: note.trim(),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD600" />
      </ThemedView>
    );
  }

  if (error || !car) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color="#fff" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Xatolik</ThemedText>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.errorText}>{error || 'Avtomobil topilmadi'}</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Avtomobilni ijaraga olish</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.carInfo}>
          <ThemedText style={styles.carName}>{car.brand} {car.model}</ThemedText>
          <ThemedText style={styles.price}>{car.price_per_day.toLocaleString()} so'm / kun</ThemedText>
        </View>

        <View style={styles.formSection}>
          <ThemedText style={styles.sectionTitle}>Ijara vaqti</ThemedText>
          
          {Platform.OS === 'web' ? (
            <>
              <View style={styles.dateInput}>
                <IconSymbol name="calendar" size={20} color="#999" />
                <input
                  style={{
                    marginLeft: 8,
                    fontSize: 16,
                    flex: 1,
                    color: '#fff',
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none'
                  }}
                  value={startDate.toISOString().split('T')[0]}
                  placeholder="Boshlanish sanasi"
                  type="date"
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    newDate.setHours(0, 0, 0, 0);
                    setStartDate(newDate);
                    if (newDate > endDate) {
                      setEndDate(newDate);
                    }
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
              </View>

              <View style={styles.dateInput}>
                <IconSymbol name="calendar" size={20} color="#999" />
                <input
                  style={{
                    marginLeft: 8,
                    fontSize: 16,
                    flex: 1,
                    color: '#fff',
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none'
                  }}
                  value={endDate.toISOString().split('T')[0]}
                  placeholder="Tugash sanasi"
                  type="date"
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    newDate.setHours(23, 59, 59, 999);
                    if (newDate < startDate) {
                      setEndDate(startDate);
                    } else {
                      setEndDate(newDate);
                    }
                  }}
                  min={startDate.toISOString().split('T')[0]}
                />
              </View>
            </>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowStartPicker(true)}
              >
                <IconSymbol name="calendar" size={20} color="#999" />
                <ThemedText style={styles.dateText}>
                  {startDate.toLocaleDateString()}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowEndPicker(true)}
              >
                <IconSymbol name="calendar" size={20} color="#999" />
                <ThemedText style={styles.dateText}>
                  {endDate.toLocaleDateString()}
                </ThemedText>
              </TouchableOpacity>

              {showStartPicker && (
                <DateTimePicker
                  testID="startDatePicker"
                  value={startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleStartDateChange}
                  minimumDate={new Date()}
                  style={{ width: Platform.OS === 'ios' ? '100%' : undefined }}
                />
              )}
              
              {showEndPicker && (
                <DateTimePicker
                  testID="endDatePicker"
                  value={endDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleEndDateChange}
                  minimumDate={startDate}
                  style={{ width: Platform.OS === 'ios' ? '100%' : undefined }}
                />
              )}
              
              {Platform.OS === 'ios' && (showStartPicker || showEndPicker) && (
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity onPress={handleDatePickerConfirm}>
                      <ThemedText style={styles.datePickerDone}>Tayyor</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.formSection}>
          <ThemedText style={styles.sectionTitle}>Kompaniya manzili</ThemedText>
          <View style={styles.addressContainer}>
            <IconSymbol name="house.fill" size={20} color="#999" />
            <ThemedText style={styles.addressText}>{companyAddress}</ThemedText>
          </View>
          <ThemedText style={styles.noteText}>* Avtomobilni kompaniya ofisidan olib ketasiz va shu yerga qaytarasiz</ThemedText>
        </View>

        <View style={styles.formSection}>
          <ThemedText style={styles.sectionTitle}>Aloqa ma'lumotlari</ThemedText>
          
          <View style={styles.inputContainer}>
            <IconSymbol name="person.fill" size={20} color="#999" />
            <TextInput
              style={styles.input}
              placeholder="Telefon raqamingiz"
              placeholderTextColor="#999"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <IconSymbol name="paperplane.fill" size={20} color="#999" />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Qo'shimcha izoh (ixtiyoriy)"
              placeholderTextColor="#999"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {error && (
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.submitButton, !phoneNumber.trim() && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!phoneNumber.trim() || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#222" />
          ) : (
            <ThemedText style={styles.submitButtonText}>Bronlash</ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  datePickerContainer: {
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0
  } as ViewStyle,
  
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  } as ViewStyle,
  
  datePickerCancel: {
    color: '#999',
    fontSize: 16
  } as TextStyle,
  
  datePickerDone: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold'
  } as TextStyle,
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  addressText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
  noteText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#222',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  carInfo: {
    marginBottom: 24,
  },
  carName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    color: '#FFD600',
    fontWeight: 'bold',
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  dateText: {
    marginLeft: 12,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#222',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  submitButton: {
    backgroundColor: '#FFD600',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#666',
  },
  submitButtonText: {
    color: '#222',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
