import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Alert, Dimensions } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

const { width } = Dimensions.get('window');

interface Car {
  id: number;
  brand: number;
  brand_name: string;
  model: string;
  year: number;
  seats: number;
  color: string;
  price_per_day: string;
  transmission: string;
  photo: string | null;
  description: string;
  available_count: number;
  is_available: boolean;
}

interface Contract {
  id: number;
  booking_id: number;
  file_url: string;
  created_at: string;
}

interface Booking {
  id: number;
  car: Car;
  start_date: string;
  end_date: string;
  status: string;
  status_display: string;
  total_price: string;
  created_at: string;
  contract?: Contract;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'kutilmoqda':
      return {
        bg: '#FFF3D4',
        text: '#B86E00'
      };
    case 'qabul_qilindi':
      return {
        bg: '#E5F5E6',
        text: '#1B873B'
      };
    case 'rad_etildi':
      return {
        bg: '#FFEBE9',
        text: '#CF222E'
      };
    default:
      return {
        bg: '#F6F8FA',
        text: '#57606A'
      };
  }
};

const downloadContract = async (booking: Booking) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      Alert.alert('Xatolik', 'Avtorizatsiyadan o\'tilmagan');
      return;
    }

    console.log('Buyurtma ID:', booking.id);

    // Avval shartnoma ma'lumotlarini olish
    const contractsResponse = await axios.get(
      `https://car-rental-api-gyfw.onrender.com/api/v1/cars/api/v1/contracts/`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    console.log('Barcha shartnomalar:', JSON.stringify(contractsResponse.data, null, 2));

    // Buyurtmaga tegishli shartnomani topish
    const contract = contractsResponse.data.find((c: any) => {
      console.log('Tekshirilmoqda:', c.booking_id, booking.id, c.booking_id === booking.id);
      return c.booking_id === booking.id;
    });
    
    if (!contract) {
      throw new Error('Shartnoma topilmadi');
    }

    // Shartnoma faylini yuklash
    const contractFileResponse = await axios.get(
      `https://car-rental-api-gyfw.onrender.com/api/v1/cars/api/v1/contracts/${contract.id}/`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        responseType: 'blob',
      }
    );

    if (!contractFileResponse.data) {
      throw new Error('Shartnoma faylini yuklab bo\'lmadi');
    }

    // PDF faylni yuklash
    const pdfBlob = new Blob([contractFileResponse.data], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Shartnomani brauzerda ochish
    await WebBrowser.openBrowserAsync(pdfUrl);
    console.log('Shartnoma muvaffaqiyatli yuklandi');

    // URL ni tozalash
    URL.revokeObjectURL(pdfUrl);
  } catch (error) {
    console.error('Shartnomani yuklashda xatolik:', error);
    Alert.alert('Xatolik', 'Shartnomani yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring');
  }
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  loadingText: {
    color: '#FFD600',
    marginTop: 12,
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#222',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#222',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#222',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#FFD600',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#222',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  carName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  downloadButton: {
    backgroundColor: '#0969DA',
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#2C2C2E',
    padding: 10,
    borderRadius: 8,
    flex: 1,
  },
  dateLabel: {
    width: 75,
    color: '#999',
    fontSize: 13,
  },
  dateValue: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  priceLabel: {
    color: '#999',
    fontSize: 14,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B873B',
  },
});

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    console.log('Buyurtmalar yuklanmoqda...');
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Token:', token ? 'mavjud' : 'topilmadi');
      
      if (!token) {
        console.log('Token topilmadi, avtorizatsiya sahifasiga yo\'naltirilmoqda...');
        router.replace('/login');
        return;
      }

      // Use your actual API URL
      const apiUrl = 'https://car-rental-api-gyfw.onrender.com/api/v1/cars/api/v1/bookings/';
      console.log('API so\'rov yuborilmoqda:', apiUrl);

      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('API javob:', JSON.stringify(response.data, null, 2));
      console.log('Birinchi buyurtma:', JSON.stringify(response.data[0], null, 2));
      setBookings(response.data);
    } catch (error: any) {
      console.error('Buyurtmalarni yuklashda xatolik:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        Alert.alert('Xatolik', 'Avtorizatsiyadan o\'tilmagan');
        router.replace('/login');
        return;
      }
      Alert.alert('Xatolik', 'Ma\'lumotlarni yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring');
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Status code:', error.response.status);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <ThemedText style={styles.loadingText}>Yuklanmoqda...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Mening buyurtmalarim</ThemedText>
      </View>
      <ScrollView 
        style={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#FFD600"
            colors={['#FFD600']}
          />
        }
      >
      
      {bookings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Buyurtmalar topilmadi</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshButtonText}>Yangilash</Text>
          </TouchableOpacity>
        </View>
      ) : (
        bookings.map((booking) => (
          <TouchableOpacity 
            key={booking.id} 
            style={styles.card}
            onPress={() => {
              // TODO: Navigate to booking details
              console.log('Buyurtma tafsilotlarini ko\'rish:', booking.id);
            }}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.carName}>{booking.car.brand} {booking.car.model}</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status).bg, borderWidth: 1, borderColor: getStatusColor(booking.status).text }]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(booking.status).text }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(booking.status).text }]}>
                    {booking.status_display}
                  </Text>
                </View>
                {booking.status === 'qabul_qilindi' && (
                  <TouchableOpacity 
                    style={styles.downloadButton}
                    onPress={() => downloadContract(booking)}
                  >
                    <IconSymbol name="chevron.left.forwardslash.chevron.right" size={18} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Yaratildi:</Text>
              <Text style={styles.dateValue}>{formatDate(booking.created_at)}</Text>
            </View>
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Boshlash:</Text>
              <Text style={styles.dateValue}>{formatDate(booking.start_date)}</Text>
            </View>
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Tugash:</Text>
              <Text style={styles.dateValue}>{formatDate(booking.end_date)}</Text>
            </View>
            
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Umumiy narx:</Text>
              <Text style={styles.priceValue}>{booking.total_price.toLocaleString()} so'm</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
      </ScrollView>
    </ThemedView>
  );
}
