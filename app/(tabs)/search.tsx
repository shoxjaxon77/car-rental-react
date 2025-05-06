import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

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
];

// Filter options
const brands = ['All', 'BMW', 'Mercedes', 'Audi', 'Toyota'];
const priceRanges = ['All', '$0-50', '$51-100', '$101-150', '$151+'];
const seatOptions = ['All', '2', '4', '5', '7+'];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [selectedSeats, setSelectedSeats] = useState('All');

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
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search cars..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

     

      {/* Car List */}
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
  container: {
    flex: 1,
    backgroundColor: '#222',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#222',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: '#fff',
    fontSize: 16,
  },
  filtersContainer: {
    maxHeight: 200,
  },
  filtersContent: {
    paddingHorizontal: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#333',
    marginRight: 8,
  },
  selectedFilterButton: {
    backgroundColor: '#FFD600',
  },
  filterText: {
    color: '#fff',
    fontSize: 14,
  },
  selectedFilterText: {
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
    width: (width - 48) / 2,
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