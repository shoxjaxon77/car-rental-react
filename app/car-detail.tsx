import { View, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

      const response = await fetch(`https://car-rental-api-gyfw.onrender.com/api/v1/cars/cars/${id}/`, {
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
      <ScrollView>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: car.image }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        <View style={styles.contentContainer}>
          <ThemedText style={styles.brand}>{car.brand}</ThemedText>
          <ThemedText style={styles.name}>{car.model}</ThemedText>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <IconSymbol name="calendar" size={20} color="#999" />
              <ThemedText style={styles.detailText}>{car.year}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <IconSymbol name="person.fill" size={20} color="#999" />
              <ThemedText style={styles.detailText}>{car.seats} o'rindiq</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.price}>
            {car.price_per_day.toLocaleString()} so'm / kun
          </ThemedText>
          
          <ThemedText style={styles.sectionTitle}>Ta'rif</ThemedText>
          <ThemedText style={styles.description}>{car.description}</ThemedText>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bookButton} onPress={() => {/* TODO: Add booking logic */}}>
          <ThemedText style={styles.bookButtonText}>Bron qilish</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#333',
  },
  container: {
    flex: 1,
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
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 16,
  },
  brand: {
    fontSize: 18,
    color: '#999',
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  detailText: {
    fontSize: 16,
    color: '#999',
    marginLeft: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD600',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#999',
    marginBottom: 100, // Add space for bottom bar
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#222',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  bookButton: {
    backgroundColor: '#FFD600',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#222',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
