import { ThemedText } from '@/components/ThemedText';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  Alert
} from 'react-native';

export default function BookingScreen() {
  const { id } = useLocalSearchParams();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    startDate: '',
    endDate: '',
    address: ''
  });

  const handleSubmit = () => {
    // Form validation
    if (!formData.fullName || !formData.email || !formData.phone || 
        !formData.startDate || !formData.endDate || !formData.address) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Here you would typically send the data to your backend
    console.log('Booking data:', { carId: id, ...formData });
    
    // Show success message and navigate back
    Alert.alert(
      'Success',
      'Your booking has been submitted successfully!',
      [
        {
          text: 'OK',
          onPress: () => router.push('/(tabs)')
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>Book Your Car</ThemedText>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Full Name</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#666"
            value={formData.fullName}
            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Email</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#666"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Phone Number</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            placeholderTextColor="#666"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Start Date</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#666"
            value={formData.startDate}
            onChangeText={(text) => setFormData({ ...formData, startDate: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>End Date</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#666"
            value={formData.endDate}
            onChangeText={(text) => setFormData({ ...formData, endDate: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Address</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter your address"
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
          />
        </View>

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <ThemedText style={styles.submitButtonText}>Submit Booking</ThemedText>
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
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#444',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#FFD600',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
});
