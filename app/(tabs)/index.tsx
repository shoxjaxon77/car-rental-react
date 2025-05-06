import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

// Dummy data (keyinchalik API dan olinadi)
const cars = [
  {
    id: '1',
    name: 'BMW X5',
    brand: 'BMW',
    model: 'X5',
    year: 2023,
    seats: 5,
    price_per_day: 150,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
    description: 'Luxury SUV with advanced features.'
  },
  {
    id: '2',
    name: 'Mercedes-Benz C-Class',
    brand: 'Mercedes',
    model: 'C-Class',
    year: 2023,
    seats: 5,
    price_per_day: 120,
    image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=800&q=80',
    description: 'Elegant sedan with premium comfort.'
  },
  {
    id: '3',
    name: 'Audi Q7',
    brand: 'Audi',
    model: 'Q7',
    year: 2023,
    seats: 7,
    price_per_day: 180,
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80',
    description: 'Spacious luxury SUV with premium features.'
  },
  {
    id: '4',
    name: 'Toyota Camry',
    brand: 'Toyota',
    model: 'Camry',
    year: 2023,
    seats: 5,
    price_per_day: 90,
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80',
    description: 'Reliable and comfortable sedan.'
  },
  {
    id: '5',
    name: 'BMW M3',
    brand: 'BMW',
    model: 'M3',
    year: 2023,
    seats: 5,
    price_per_day: 200,
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
    description: 'High-performance luxury sports sedan.'
  },
  {
    id: '6',
    name: 'Mercedes-Benz GLS',
    brand: 'Mercedes',
    model: 'GLS',
    year: 2023,
    seats: 7,
    price_per_day: 220,
    image: 'https://images.unsplash.com/photo-1653417580576-1664b850d70f?auto=format&fit=crop&w=800&q=80',
    description: 'Full-size luxury SUV with third-row seating.'
  },
  {
    id: '7',
    name: 'Audi A4',
    brand: 'Audi',
    model: 'A4',
    year: 2023,
    seats: 5,
    price_per_day: 130,
    image: 'https://images.unsplash.com/photo-1606664455348-3e0cd1b46e85?auto=format&fit=crop&w=800&q=80',
    description: 'Sophisticated sedan with cutting-edge technology.'
  },
  {
    id: '8',
    name: 'Toyota Land Cruiser',
    brand: 'Toyota',
    model: 'Land Cruiser',
    year: 2023,
    seats: 8,
    price_per_day: 170,
    image: 'https://images.unsplash.com/photo-1594505096846-a6fff0a761c4?auto=format&fit=crop&w=800&q=80',
    description: 'Legendary SUV with exceptional off-road capability.'
  }
];

// Brendlar ro'yxati
const brands = ['All', 'BMW', 'Mercedes', 'Audi', 'Toyota'];

export default function HomeScreen() {
  const [selectedBrand, setSelectedBrand] = React.useState('All');
  const [menuVisible, setMenuVisible] = useState(false);

  const menuItems = [
    { id: 'profile', title: 'Profile', icon: 'person.fill' as const, onPress: () => router.push('/profile') },
    { id: 'favorites', title: 'Favorite Cars', icon: 'heart.fill' as const, onPress: () => router.push('/(tabs)') },
    { id: 'bookings', title: 'My Bookings', icon: 'calendar' as const, onPress: () => router.push('/(tabs)/bookings') },
    { id: 'settings', title: 'Settings', icon: 'gearshape.fill' as const, onPress: () => router.push('/(tabs)/account') },
  ];

  const renderCarCard = (car: typeof cars[0]) => (
    <TouchableOpacity
      key={car.id}
      style={styles.carCard}
      onPress={() => router.push(`/detail?id=${car.id}`)}
    >
      <Image source={{ uri: car.image }} style={styles.carImage} />
      <View style={styles.carInfo}>
        <ThemedText style={styles.carName}>{car.name}</ThemedText>
        <ThemedText style={styles.carPrice}>${car.price_per_day}/day</ThemedText>
        <ThemedText style={styles.carDescription}>{car.description}</ThemedText>
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
        {cars.map(renderCarCard)}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
  },
  carCard: {
    backgroundColor: '#333',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    width: (width - 48) / 2, // 2 cards per row with 16px spacing
    marginHorizontal: 8,
  },
  carImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  carInfo: {
    padding: 12,
  },
  carName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  carPrice: {
    fontSize: 15,
    color: '#FFD600',
    fontWeight: '600',
    marginBottom: 4,
  },
  carDescription: {
    fontSize: 12,
    color: '#ccc',
    lineHeight: 16,
  },
});
