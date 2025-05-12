import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ImageStyle, ScrollView, StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

const { width } = Dimensions.get('window');

interface Car {
  id: string;
  brand: number;
  brand_name: string;
  model: string;
  year: number;
  seats: number;
  price_per_day: string;
  photo: string | null;
  description: string;
  available_count: number;
  is_available: boolean;
};

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
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
          throw new Error('Avtorizatsiyadan o\'tilmagan');
        }
        throw new Error('Avtomobil ma\'lumotlarini yuklashda xatolik');
      }

      const data = await response.json();
      
      // Brand ma'lumotlarini olish
      let brandName = '';
      if (data.brand) {
        try {
          const brandResponse = await fetch(`https://car-rental-api-gyfw.onrender.com/api/v1/cars/api/v1/brands/${data.brand}/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (brandResponse.ok) {
            const brandData = await brandResponse.json();
            brandName = brandData.brand_name || brandData.name || '';
          }
        } catch (error) {
          console.error('Error fetching brand:', error);
        }
      }
      
      setCar({
        ...data,
        brandName: brandName
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
      if (err instanceof Error && err.message === 'Avtorizatsiyadan o\'tilmagan') {
        router.replace('/login');
      }
    } finally {
      setLoading(false);
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
      <ThemedView style={styles.loadingContainer}>
        <ThemedText style={styles.errorText}>{error || 'Avtomobil topilmadi'}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          {car.photo ? (
            <Image
              source={{ uri: car.photo }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.image, { backgroundColor: '#2C2C2E', justifyContent: 'center', alignItems: 'center' }]}>
              <IconSymbol name="house.fill" size={48} color="#666" />
            </View>
          )}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color="#FFD600" />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.priceContainer}>
            <ThemedText style={styles.priceLabel}>Narxi</ThemedText>
            <ThemedText style={styles.price}>{Number(car.price_per_day).toLocaleString()} so'm/kun</ThemedText>
          </View>

          <View style={styles.titleContainer}>
            <ThemedText style={styles.brandText}>{car.brand_name}</ThemedText>
            <ThemedText style={styles.modelText}>{car.model}</ThemedText>
          </View>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <IconSymbol name="calendar" size={20} color="#FFD600" />
              <ThemedText style={styles.detailText}>{car.year}-yil</ThemedText>
            </View>

            <View style={styles.detailRow}>
              <IconSymbol name="person.fill" size={20} color="#FFD600" />
              <ThemedText style={styles.detailText}>{car.seats} o'rindiq</ThemedText>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <ThemedText style={styles.descriptionTitle}>Tavsif</ThemedText>
            <ThemedText style={styles.descriptionText}>{car.description || 'Tavsif mavjud emas'}</ThemedText>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.rentButton} 
          onPress={() => router.push(`/rent?id=${car.id}`)}
        >
          <ThemedText style={styles.rentButtonText}>Ijaraga olish</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({  
  container: {
    flex: 1,
  } as ViewStyle,
  scrollContent: {
    flexGrow: 1,
  } as ViewStyle,
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  } as TextStyle,
  imageContainer: {
    width: width,
    height: width * 0.7,
    backgroundColor: '#2C2C2E',
    position: 'relative',
  } as ViewStyle,
  image: {
    width: '100%',
    height: '100%',
  } as ImageStyle,
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
    zIndex: 1,
  } as ViewStyle,
  contentContainer: {
    flex: 1,
    padding: 20,
  } as ViewStyle,
  priceContainer: {
    backgroundColor: '#FFD600',
    padding: 15,
    borderRadius: 10,
    marginTop: -30,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  } as ViewStyle,
  priceLabel: {
    fontSize: 14,
    color: '#000',
  } as TextStyle,
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 4,
  } as TextStyle,
  titleContainer: {
    marginTop: 20,
  } as ViewStyle,
  brandText: {
    fontSize: 20,
    color: '#999',
  } as TextStyle,
  modelText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 5,
  } as TextStyle,
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 20,
    backgroundColor: 'rgba(255, 214, 0, 0.1)',
    padding: 15,
    borderRadius: 10,
  } as ViewStyle,
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 30,
  } as ViewStyle,
  detailText: {
    marginLeft: 8,
    fontSize: 16,
  } as TextStyle,
  descriptionContainer: {
    marginTop: 25,
  } as ViewStyle,
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  } as TextStyle,
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#999',
  } as TextStyle,
  bottomBar: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#1C1C1E',
  } as ViewStyle,
  rentButton: {
    backgroundColor: '#FFD600',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  } as ViewStyle,
  rentButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  } as TextStyle,
});
