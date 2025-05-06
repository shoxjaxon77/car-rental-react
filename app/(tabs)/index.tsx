import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

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



export default function HomeScreen() {
  const [selectedBrand, setSelectedBrand] = React.useState('All');
  console.log('Current selected brand:', selectedBrand);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [brands, setBrands] = useState<string[]>(['All']);

  useEffect(() => {
    fetchBrands();
    fetchCars();
  }, []);

  const fetchBrands = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('Avtorizatsiyadan o\'tilmagan');
      }

      const response = await fetch('https://car-rental-api-gyfw.onrender.com/api/v1/cars/brands/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Avtorizatsiyadan o\'tilmagan');
        }
        throw new Error('Brandlarni yuklashda xatolik');
      }

      const data = await response.json();
      console.log('Brands API response:', data);
      if (Array.isArray(data)) {
        const brandNames = ['All', ...data.map((brand: any) => brand.name)];
        console.log('Setting brands to:', brandNames);
        setBrands(brandNames);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      // Don't show error to user for brands, just keep 'All' as default
      setBrands(['All']);
    }
  };

  const fetchCars = async () => {
    try {
      console.log('Fetching cars...');
      setLoading(true);
      setError(null);
      
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      console.log('Token retrieved:', token ? 'Yes' : 'No');
      if (!token) {
        throw new Error('Avtorizatsiyadan o\'tilmagan');
      }

      console.log('Making API request...');
      const response = await fetch('https://car-rental-api-gyfw.onrender.com/api/v1/cars/cars/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Avtorizatsiyadan o\'tilmagan');
        }
        throw new Error('Avtomobillarni yuklashda xatolik yuz berdi');
      }

      const data = await response.json();
      console.log('API response:', data);
      
      if (Array.isArray(data)) {
        console.log('First car data:', data[0]); // Log first car to see structure
        setCars(data);
        console.log('Cars loaded successfully:', data.length, 'cars');
      } else {
        console.error('Invalid data format received:', data);
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

  // Filter cars based on selected brand
  const filteredCars = React.useMemo(() => {
    console.log('Filtering cars. Selected brand:', selectedBrand);
    console.log('Available cars:', cars.length);
    if (selectedBrand === 'All') {
      return cars;
    }
    const filtered = cars.filter(car => car.brand === selectedBrand);
    console.log('Filtered cars:', filtered.length);
    return filtered;
  }, [cars, selectedBrand]);

  const menuItems = [
    { id: 'profile', title: 'Profile', icon: 'person.fill' as const, onPress: () => router.push('/profile') },
    { id: 'favorites', title: 'Favorite Cars', icon: 'heart.fill' as const, onPress: () => router.push('/(tabs)') },
    { id: 'bookings', title: 'My Bookings', icon: 'calendar' as const, onPress: () => router.push('/(tabs)/bookings') },
    { id: 'settings', title: 'Settings', icon: 'gearshape.fill' as const, onPress: () => router.push('/(tabs)/account') },
  ];

  const renderCarCard = (car: Car) => (
    <TouchableOpacity 
      key={car.id} 
      style={styles.carCard}
      onPress={() => router.push(`/car-detail?id=${car.id}`)}
    >
      <Image
        source={{ uri: car.image }}
        style={styles.carImage}
      />
      <View style={styles.carInfo}>
        <ThemedText style={styles.carName}>{car.brand} {car.model}</ThemedText>
        <View style={styles.carDetails}>
          <View style={styles.detailRow}>
            <IconSymbol name="calendar" size={16} color="#999" />
            <ThemedText style={styles.detailText}>{car.year}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <IconSymbol name="person.fill" size={16} color="#999" />
            <ThemedText style={styles.detailText}>{car.seats} seats</ThemedText>
          </View>
        </View>
        <ThemedText style={styles.carPrice}>${car.price_per_day}/day</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/account')}
        >
          <Image 
            source={require('../../assets/images/avatar.jpg')} 
            style={styles.profileAvatar}
          />
        </TouchableOpacity>

        <ThemedText style={styles.appName}>Car Rental</ThemedText>

        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setMenuVisible(!menuVisible)}
        >
          <IconSymbol name="ellipsis" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Menu Popup */}
        {menuVisible && (
          <View style={styles.menuPopup}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  item.onPress();
                }}
              >
                <IconSymbol name={item.icon} size={24} color="#999" />
                <ThemedText style={styles.menuItemText}>{item.title}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.brandFilter}
        contentContainerStyle={styles.brandFilterContent}
      >
        {brands.map((brand) => {
          const isSelected = selectedBrand === brand;
          console.log(`Brand: ${brand}, isSelected: ${isSelected}`);
          return (
            <TouchableOpacity
              key={brand}
              style={[styles.brandButton, isSelected && styles.selectedBrandButton]}
              onPress={() => {
                console.log('Setting selected brand to:', brand);
                setSelectedBrand(brand);
              }}
            >
              <ThemedText style={[styles.brandText, isSelected && styles.selectedBrandText]}>
                {brand}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

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
        ) : filteredCars.length === 0 ? (
          <View style={styles.centerContainer}>
            <ThemedText style={styles.noDataText}>Avtomobillar mavjud emas</ThemedText>
          </View>
        ) : (
          filteredCars.map(renderCarCard)
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    width: '100%',
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
  menuPopup: {
    position: 'absolute',
    top: 120,
    right: 16,
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 8,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#fff',
  },
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
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandFilter: {
    maxHeight: 50,
  },
  brandFilterContent: {
    paddingHorizontal: 16,
  },
  brandButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#333',
    marginRight: 10,
  },
  selectedBrandButton: {
    backgroundColor: '#FFD600',
  },
  brandText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedBrandText: {
    color: '#222',
    fontWeight: '600',
  },
  carList: {
    flex: 1,
  },
  carListContent: {
    padding: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 100, // Add extra padding at bottom for scrolling
  },
  carCard: {
    backgroundColor: '#333',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    width: (width - 32) / 2, // 2 cards per row with less spacing
    marginHorizontal: 8,
    elevation: 4, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  carImage: {
    width: '100%',
    height: width * 0.3, // Make height proportional to screen width
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
