import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

// Dummy data (keyinchalik API dan olinadi)
const bookings = [
  {
    id: '1',
    car: {
      name: 'BMW X5',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
    },
    startDate: '2024-03-20',
    endDate: '2024-03-25',
    totalPrice: 750,
    status: 'approved', // pending, paid, approved, rejected
  },
  {
    id: '2',
    car: {
      name: 'Mercedes-Benz C-Class',
      image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=800&q=80',
    },
    startDate: '2024-03-28',
    endDate: '2024-04-02',
    totalPrice: 600,
    status: 'pending',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return '#4CAF50';
    case 'pending':
      return '#FFC107';
    case 'paid':
      return '#2196F3';
    case 'rejected':
      return '#F44336';
    default:
      return '#999';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'pending':
      return 'Pending';
    case 'paid':
      return 'Paid';
    case 'rejected':
      return 'Rejected';
    default:
      return status;
  }
};

export default function BookingsScreen() {
  const renderBookingCard = (booking: typeof bookings[0]) => (
    <TouchableOpacity
      key={booking.id}
      style={styles.bookingCard}
      onPress={() => router.push(`/detail?id=${booking.id}`)}
    >
      <Image source={{ uri: booking.car.image }} style={styles.carImage} />
      
      <View style={styles.bookingInfo}>
        <View style={styles.bookingHeader}>
          <ThemedText style={styles.carName}>{booking.car.name}</ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
            <ThemedText style={styles.statusText}>
              {getStatusText(booking.status)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.dateContainer}>
          <View style={styles.dateItem}>
            <IconSymbol name="calendar" size={16} color="#999" />
            <ThemedText style={styles.dateLabel}>Start</ThemedText>
            <ThemedText style={styles.dateValue}>{booking.startDate}</ThemedText>
          </View>
          <View style={styles.dateItem}>
            <IconSymbol name="calendar" size={16} color="#999" />
            <ThemedText style={styles.dateLabel}>End</ThemedText>
            <ThemedText style={styles.dateValue}>{booking.endDate}</ThemedText>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <ThemedText style={styles.priceLabel}>Total Price</ThemedText>
          <ThemedText style={styles.priceValue}>${booking.totalPrice}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>My Bookings</ThemedText>
      </View>

      <ScrollView 
        style={styles.bookingList}
        contentContainerStyle={styles.bookingListContent}
      >
        {bookings.map(renderBookingCard)}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  bookingList: {
    flex: 1,
  },
  bookingListContent: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#333',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  carImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  bookingInfo: {
    padding: 20,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  carName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateItem: {
    flex: 1,
    marginRight: 16,
  },
  dateLabel: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  priceLabel: {
    fontSize: 16,
    color: '#999',
  },
  priceValue: {
    fontSize: 20,
    color: '#FFD600',
    fontWeight: '600',
  },
}); 