import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface Car {
  id: string;
  name: string;
  brand: number;
  brand_name: string;
  model: string;
  year: number;
  seats: number;
  price_per_day: number;
  image: string;
  description: string;
};

export default function HomeScreen() {
  const [selectedBrand, setSelectedBrand] = React.useState('All');
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [brands, setBrands] = useState<string[]>(['All']);

  const filteredCars = React.useMemo(() => {
    return cars.filter(car => {
      if (selectedBrand === 'All') return true;
      return car.brand_name === selectedBrand;
    });
  }, [cars, selectedBrand]);

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

      const response = await fetch('https://car-rental-api-gyfw.onrender.com/api/v1/cars/api/v1/brands/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('So\'rov holati:', response.status);
      console.log('So\'rov ma\'lumotlari:', response.headers);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Avtorizatsiyadan o\'tilmagan');
        }
        const responseText = await response.text();
        console.log('Xatolik javobi:', responseText);
        
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.detail || 'Avtomobil brendlarini yuklashda xatolik');
        } catch (parseError) {
          throw new Error(`Server xatosi: ${responseText}`);
        }
      }

      const responseText = await response.text();
      console.log('Javob:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON o\'qish xatosi:', parseError);
        throw new Error(`Ma\'lumotlarni o\'qishda xatolik: ${responseText.substring(0, 100)}...`);
      }
      
      // API response ni tekshirish
      if (data && typeof data === 'object') {
        let brandsList: string[] = [];
        
        interface Brand {
          name: string;
          [key: string]: any;
        }

        const isBrand = (brand: any): brand is Brand => {
          return brand && typeof brand === 'object' && typeof brand.name === 'string';
        };

        console.log('API javob tuzilishi:', JSON.stringify(data, null, 2));

        // results massivini tekshirish
        if (Array.isArray(data.results)) {
          brandsList = data.results
            .filter(isBrand)
            .map((brand: Brand) => brand.name);
        }
        // brands massivini tekshirish
        else if (Array.isArray(data.brands)) {
          brandsList = data.brands
            .filter(isBrand)
            .map((brand: Brand) => brand.name);
        }
        // to'g'ridan-to'g'ri massiv kelgan bo'lsa
        else if (Array.isArray(data)) {
          brandsList = data
            .filter(isBrand)
            .map((brand: Brand) => brand.name);
        }

        console.log('Parsed brands list:', brandsList);

        // Dublikatlarni olib tashlash va saralash
        const uniqueBrands = [...new Set(brandsList)].sort();
        setBrands(['All', ...uniqueBrands]);
      } else {
        throw new Error('Serverdan noto\'g\'ri ma\'lumot formati olindi');
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      // Xatolik bo'lsa ham 'All' ni ko'rsatamiz
      setBrands(['All']);
      
      if (error instanceof Error && error.message === 'Avtorizatsiyadan o\'tilmagan') {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('userData');
        router.replace('/login');
      }
    }
  };

  const fetchCars = async () => {
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
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Avtomobillarni yuklashda xatolik yuz berdi');
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        // API dan kelgan ma'lumotlarni Car tipiga moslashtirish
        const formattedCars: Car[] = data.map((car: any) => ({
          id: car.id?.toString() || '',
          name: car.name || '',
          brand: car.brand || '',
          brand_name: car.brand_name || '',
          model: car.model || '',
          year: parseInt(car.year) || 0,
          seats: parseInt(car.seats) || 0,
          price_per_day: parseFloat(car.price_per_day) || 0,
          image: car.image || '',
          description: car.description || ''
        }));
        
        setCars(formattedCars);
      } else {
        throw new Error('Serverdan noto\'g\'ri ma\'lumot formati olindi');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Xatolik yuz berdi';
      setError(errorMessage);
      
      if (errorMessage === 'Avtorizatsiyadan o\'tilmagan') {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        router.replace('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      router.replace('/login');
    } catch (error) {
      console.error('Tizimdan chiqishda xatolik:', error);
      Alert.alert('Xatolik', 'Tizimdan chiqishda xatolik yuz berdi');
    }
  };

  const handleCarPress = (carId: string) => {
    router.push(`/car-detail?id=${carId}`);
    console.log('Avtomobil tanlandi:', carId);
  };

  const renderCarCard = (car: Car) => (
    <TouchableOpacity 
      key={car.id} 
      style={styles.carCard}
      onPress={() => handleCarPress(car.id)}
    >
      <Image
        source={{ uri: car.image }}
        style={styles.carImage}
      />
      <View style={styles.carInfo}>
        <ThemedText style={styles.carName}>{car.brand_name} {car.model}</ThemedText>
        <View style={styles.carDetails}>
          <View style={styles.detailRow}>
            <IconSymbol name="calendar" size={16} color="#999" />
            <ThemedText style={styles.detailText}>{car.year}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <IconSymbol name="person.fill" size={16} color="#999" />
            <ThemedText style={styles.detailText}>{car.seats} o'rindiq</ThemedText>
          </View>
        </View>
        <ThemedText style={styles.carPrice}>{car.price_per_day.toLocaleString()} so'm/kun</ThemedText>
      </View>
    </TouchableOpacity>
  );

  const menuItems = [
    { id: 'profile', title: 'Profil', icon: 'person.fill' as const, onPress: () => router.push('/profile') },
    { id: 'favorites', title: 'Sevimli avtomobillar', icon: 'heart.fill' as const, onPress: () => router.push('/(tabs)') },
    { id: 'bookings', title: 'Mening bronlarim', icon: 'calendar' as const, onPress: () => router.push('/(tabs)/bookings') },
    { id: 'settings', title: 'Sozlamalar', icon: 'gearshape.fill' as const, onPress: () => router.push('/(tabs)/profile') },
    { id: 'logout', title: 'Chiqish', icon: 'rectangle.portrait.and.arrow.right' as const, onPress: handleLogout },
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/profile')}
        >
          <Image 
            source={require('../../assets/images/avatar.jpg')} 
            style={styles.profileAvatar}
          />
        </TouchableOpacity>

        <ThemedText style={styles.appName}>Avtomobil ijarasi</ThemedText>

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
        {brands.map((brand) => (
          <TouchableOpacity
            key={brand}
            style={[styles.brandButton, selectedBrand === brand && styles.selectedBrandButton]}
            onPress={() => setSelectedBrand(brand)}
          >
            <ThemedText style={[styles.brandText, selectedBrand === brand && styles.selectedBrandText]}>
              {brand}
            </ThemedText>
          </TouchableOpacity>
        ))}
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
            <ThemedText style={styles.errorText}>Avtomobillarni yuklashda xatolik</ThemedText>
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
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingBottom: 100,
  },
  carCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    overflow: 'hidden',
    width: (width - 48) / 2,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  carImage: {
    width: '100%',
    height: width * 0.25,
    resizeMode: 'cover',
    backgroundColor: '#2C2C2E',
  },
  carInfo: {
    padding: 12,
    gap: 8,
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
