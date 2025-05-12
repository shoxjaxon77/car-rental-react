import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cars, setCars] = useState<Car[]>([]);

  const searchCars = async () => {
    if (!searchQuery.trim()) {
      setCars([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('Avtorizatsiyadan o\'tilmagan');
      }

      const response = await fetch('https://car-rental-api-gyfw.onrender.com/api/v1/cars/api/v1/cars/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Avtorizatsiyadan o\'tilmagan');
        }
        throw new Error('Qidirishda xatolik yuz berdi');
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (Array.isArray(data)) {
        const query = searchQuery.toLowerCase();
        console.log('Search Query:', query);

        const filteredCars = data.filter(car => {
          const brand = car.brand_name?.toLowerCase() || '';
          const model = car.model?.toLowerCase() || '';
          const matches = brand.includes(query) || model.includes(query);
          console.log('Car:', car.brand_name, car.model, 'Matches:', matches);
          return matches;
        });

        console.log('Filtered Cars:', filteredCars);
        setCars(filteredCars);
      } else {
        console.error('Invalid data format:', data);
        throw new Error('Serverdan noto\'g\'ri ma\'lumot formati olindi');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
      if (err instanceof Error && err.message === 'Avtorizatsiyadan o\'tilmagan') {
        router.replace('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderCarCard = (car: Car) => (
    <TouchableOpacity
      key={car.id}
      style={styles.carCard}
      onPress={() => router.push(`/car-detail?id=${car.id}`)}
    >
      <View style={[styles.carImage, { backgroundColor: '#2C2C2E', justifyContent: 'center', alignItems: 'center' }]}>
        {car.photo ? (
          <Image 
            source={{ uri: car.photo }}
            style={styles.carImage}
          />
        ) : (
          <IconSymbol name="house.fill" size={32} color="#666" />
        )}
      </View>
      <View style={styles.carInfo}>
        <ThemedText style={styles.carName}>{car.brand_name} {car.model}</ThemedText>
        <View style={styles.carDetails}>
          <View style={styles.detailRow}>
            <IconSymbol name="house.fill" size={16} color="#999" />
            <ThemedText style={styles.detailText}>{car.brand_name}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <IconSymbol name="calendar" size={16} color="#999" />
            <ThemedText style={styles.detailText}>{car.year}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <IconSymbol name="person.fill" size={16} color="#999" />
            <ThemedText style={styles.detailText}>{car.seats} o'rindiq</ThemedText>
          </View>
        </View>
        <ThemedText style={styles.carPrice}>{Number(car.price_per_day).toLocaleString()} so'm/kun</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.appName}>Qidirish</ThemedText>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Avtomobil qidirish..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchCars}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={searchCars}>
          <IconSymbol name="magnifyingglass" size={20} color="#222" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.carList}
        contentContainerStyle={styles.carListContent}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#FFD600" />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        ) : cars.length === 0 ? (
          <View style={styles.centerContainer}>
            <ThemedText style={styles.noDataText}>
              {searchQuery ? 'Avtomobillar topilmadi' : 'Avtomobil qidiring'}
            </ThemedText>
          </View>
        ) : (
          cars.map(renderCarCard)
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
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
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 46,
    backgroundColor: '#333',
    borderRadius: 23,
    paddingHorizontal: 20,
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },
  searchButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFD600',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    textAlign: 'center',
  },
  noDataText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
  carList: {
    flex: 1,
  },
  carListContent: {
    padding: 16,
  },
  carCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    width: width * 0.8, // Ekran enining 80%
    alignSelf: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  carImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    backgroundColor: '#444',
  },
  carInfo: {
    padding: 12,
  },
  carName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  carDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 6,
  },
  carPrice: {
    fontSize: 16,
    color: '#FFD600',
    fontWeight: '600',
  },
});
