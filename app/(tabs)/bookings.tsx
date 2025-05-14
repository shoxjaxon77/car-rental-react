import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  formatted_start_date: string;
  formatted_end_date: string;
  duration_days: number;
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
    console.log('Booking data:', JSON.stringify(booking, null, 2));

    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      Alert.alert('Xatolik', 'Avtorizatsiyadan o\'tilmagan');
      return;
    }

    if (!booking.contract?.id) {
      Alert.alert('Xatolik', 'Shartnoma ma\'lumotlari topilmadi');
      return;
    }

    // Shartnomani yuklab olish uchun API so'rovi
    const response = await axios.get(
      `https://car-rental-api-aeh4.onrender.com/api/v1/cars/api/v1/contracts/${booking.contract.id}/download/`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        responseType: 'blob'
      }
    );

    // PDF faylni yuklab olish
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    // Yangi oynada PDF ni ochish
    window.open(url, '_blank');

    // Vaqtinchalik URL ni tozalash
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 100);

  } catch (error: any) {
    console.error('Shartnomani yuklashda xatolik:', error);
    if (error.response?.status === 403) {
      Alert.alert('Xatolik', 'Sizda ushbu shartnomani yuklab olish uchun ruxsat yo\'q');
    } else if (error.response?.status === 404) {
      Alert.alert('Xatolik', 'Shartnoma mavjud emas');
    } else {
      Alert.alert('Xatolik', 'Shartnomani yuklab olishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring');
    }
  }
};

const styles = StyleSheet.create({
  carDetails: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
  },
  contractDownloadButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  contractDownloadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  dateInfo: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: '#999',
  },
  dateValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  durationBadge: {
    backgroundColor: '#FFD600',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  durationText: {
    color: '#222',
    fontSize: 14,
    fontWeight: '600',
  },
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
  dateLabelSecondary: {
    width: 75,
    color: '#999',
    fontSize: 13,
  },
  dateValueSecondary: {
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
      const apiUrl = 'https://car-rental-api-aeh4.onrender.com/api/v1/cars/api/v1/bookings/';
      console.log('API so\'rov yuborilmoqda:', apiUrl);

      // Buyurtmalarni olish
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Buyurtmalar olindi:', response.data.length);

      // Har bir buyurtma uchun alohida shartnoma so'rovi yuborish
      const bookingsWithContracts = await Promise.all(response.data.map(async (booking: any) => {
        console.log(`Buyurtma ${booking.id} uchun ma'lumotlar:`, JSON.stringify(booking, null, 2));
        
        if (booking.status === 'accepted') {
          try {
            // Shartnomani olish
            const contractResponse = await axios.get(
              `https://car-rental-api-aeh4.onrender.com/api/v1/cars/api/v1/contracts/${booking.id}/`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              }
            );
            console.log(`Buyurtma ${booking.id} uchun shartnoma:`, JSON.stringify(contractResponse.data, null, 2));
            return {
              ...booking,
              contract: contractResponse.data
            };
          } catch (error) {
            console.log(`Buyurtma ${booking.id} uchun shartnoma topilmadi:`, error);
            return booking;
          }
        }
        return booking;
      }));

      console.log('API javob:', JSON.stringify(bookingsWithContracts, null, 2));
      console.log('Birinchi buyurtma:', JSON.stringify(bookingsWithContracts[0], null, 2));
      setBookings(bookingsWithContracts);
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
    // UTC vaqtni mahalliy vaqtga o'tkazish
    const localDate = new Date(date.getTime() + (5 * 60 * 60 * 1000)); // UTC+5 uchun
    const day = localDate.getDate().toString().padStart(2, '0');
    const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
    const year = localDate.getFullYear();
    const hours = localDate.getHours().toString().padStart(2, '0');
    const minutes = localDate.getMinutes().toString().padStart(2, '0');
    
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
          <Text style={styles.emptyStateText}>Hozircha buyurtmalar mavjud emas. Mashinani ijaraga olish uchun asosiy sahifaga o'ting.</Text>
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
              <Text style={styles.carName}>{booking.car.brand_name} {booking.car.model}</Text>
            </View>

            <View style={styles.dateInfo}>
              <View style={styles.dateRow}>
                <Text style={styles.dateLabelSecondary}>Boshlanish sanasi:</Text>
                <Text style={styles.dateValueSecondary}>{booking.formatted_start_date}</Text>
              </View>
              
              <View style={styles.dateRow}>
                <Text style={styles.dateLabelSecondary}>Tugash sanasi:</Text>
                <Text style={styles.dateValueSecondary}>{booking.formatted_end_date}</Text>
              </View>

              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>
                  {booking.duration_days} kun
                </Text>
              </View>
            </View>

            <View
              style={{
                backgroundColor: getStatusColor(booking.status).bg,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                alignSelf: 'flex-start',
                marginBottom: 12,
              }}
            >
              <Text style={{ color: getStatusColor(booking.status).text, fontWeight: '500' }}>
                {booking.status_display}
              </Text>
            </View>

            <Text style={{ color: '#FFD600', fontSize: 16, fontWeight: '600' }}>
              Umumiy narx: {booking.total_price} so'm
            </Text>

            {/* Avtomobil ma'lumotlari */}
            <View style={styles.carDetails}>
              <Text style={styles.detailLabel}>Rangi:</Text>
              <Text style={styles.detailValue}>{booking.car.color}</Text>
              
              <Text style={styles.detailLabel}>O'rindiqlar soni:</Text>
              <Text style={styles.detailValue}>{booking.car.seats} ta</Text>
              
              <Text style={styles.detailLabel}>Transmissiya:</Text>
              <Text style={styles.detailValue}>{booking.car.transmission}</Text>
              
              <Text style={styles.detailLabel}>Ishlab chiqarilgan yil:</Text>
              <Text style={styles.detailValue}>{booking.car.year}</Text>
            </View>

            {/* Shartnoma yuklash tugmasi */}
            {(() => {
              console.log('Buyurtma statusi:', booking.status);
              console.log('Buyurtma ma\'lumotlari:', JSON.stringify(booking, null, 2));
              
              if (booking.status === 'qabul_qilindi') {
                return (
                  <TouchableOpacity 
                    style={styles.contractDownloadButton}
                    onPress={() => {
                      console.log('Shartnoma yuklab olish boshlandi');
                      downloadContract(booking);
                    }}
                  >
                    <Text style={styles.contractDownloadButtonText}>Shartnomani yuklab olish</Text>
                  </TouchableOpacity>
                );
              }
              return null;
            })()}
          </TouchableOpacity>
        ))
      )}
      </ScrollView>
    </ThemedView>
  );
}
