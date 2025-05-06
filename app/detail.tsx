import { ThemedText } from '@/components/ThemedText';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

// Dummy data (keyinchalik API dan olinadi)
const car = {
  id: '1',
  name: 'BMW X5',
  brand: 'BMW',
  model: 'X5',
  year: 2023,
  seats: 5,
  price_per_day: 150,
  image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
  description: 'Luxury SUV with advanced features. Perfect for family trips and long journeys.',
  features: [
    'Automatic transmission',
    '4x4 drive',
    'Leather seats',
    'Navigation system',
    'Bluetooth connectivity',
    'Parking sensors'
  ]
};

export default function DetailScreen() {
  const { id } = useLocalSearchParams();

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: car.image }} style={styles.carImage} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={styles.carName}>{car.name}</ThemedText>
          <ThemedText style={styles.carPrice}>${car.price_per_day}/day</ThemedText>
        </View>

        <View style={styles.infoSection}>
          <ThemedText style={styles.sectionTitle}>Car Details</ThemedText>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>Brand</ThemedText>
              <ThemedText style={styles.detailValue}>{car.brand}</ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>Model</ThemedText>
              <ThemedText style={styles.detailValue}>{car.model}</ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>Year</ThemedText>
              <ThemedText style={styles.detailValue}>{car.year}</ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>Seats</ThemedText>
              <ThemedText style={styles.detailValue}>{car.seats}</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <ThemedText style={styles.sectionTitle}>Description</ThemedText>
          <ThemedText style={styles.description}>{car.description}</ThemedText>
        </View>

        <View style={styles.infoSection}>
          <ThemedText style={styles.sectionTitle}>Features</ThemedText>
          {car.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureDot} />
              <ThemedText style={styles.featureText}>{feature}</ThemedText>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => router.push(`/booking?id=${id}`)}
        >
          <ThemedText style={styles.bookButtonText}>Book Now</ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
  },
  carImage: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  carName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  carPrice: {
    fontSize: 24,
    color: '#FFD600',
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  detailItem: {
    width: '50%',
    padding: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD600',
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#fff',
  },
  bookButton: {
    backgroundColor: '#FFD600',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
}); 