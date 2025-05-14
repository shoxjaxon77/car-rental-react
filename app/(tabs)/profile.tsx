import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ActivityIndicator, Alert, TextInput, Modal, ScrollView } from 'react-native';

type UserData = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
};

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) {
        throw new Error('Foydalanuvchi ma\'lumotlari topilmadi');
      }

      const userData = JSON.parse(userDataString);
      setUserData(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
      router.replace('/login');
    }
  };

  const handleEdit = () => {
    setEditedData(userData);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedData) return;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('Token topilmadi');

      const response = await fetch('https://car-rental-api-aeh4.onrender.com/api/v1/users/api/v1/me/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: editedData.first_name,
          last_name: editedData.last_name,
          phone_number: editedData.phone_number,
          email: editedData.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Ma\'lumotlarni saqlashda xatolik');
      }

      await AsyncStorage.setItem('userData', JSON.stringify(editedData));
      setUserData(editedData);
      setIsEditing(false);
      Alert.alert('Muvaffaqiyatli', 'Ma\'lumotlar saqlandi');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Xatolik', error instanceof Error ? error.message : 'Noma\'lum xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!userData) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD600" />
          <ThemedText style={styles.loadingText}>Ma'lumotlar yuklanmoqda...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const renderEditModal = () => {
    if (!editedData) return null;

    return (
      <Modal
        visible={isEditing}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Ma'lumotlarni tahrirlash</ThemedText>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Ism</ThemedText>
              <TextInput
                style={styles.input}
                value={editedData.first_name}
                onChangeText={(text) => setEditedData({...editedData, first_name: text})}
                placeholder="Ismingiz"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Familiya</ThemedText>
              <TextInput
                style={styles.input}
                value={editedData.last_name}
                onChangeText={(text) => setEditedData({...editedData, last_name: text})}
                placeholder="Familiyangiz"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Telefon</ThemedText>
              <TextInput
                style={styles.input}
                value={editedData.phone_number}
                onChangeText={(text) => setEditedData({...editedData, phone_number: text})}
                placeholder="+998901234567"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <TextInput
                style={styles.input}
                value={editedData.email}
                onChangeText={(text) => setEditedData({...editedData, email: text})}
                placeholder="email@example.com"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={handleCancel}
              >
                <ThemedText style={styles.modalButtonText}>Bekor qilish</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <ThemedText style={styles.modalButtonText}>Saqlash</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>
                {userData.first_name[0]}{userData.last_name[0]}
              </ThemedText>
            </View>
            <ThemedText style={styles.name}>
              {userData.first_name} {userData.last_name}
            </ThemedText>
            <ThemedText style={styles.username}>@{userData.username}</ThemedText>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Shaxsiy ma'lumotlar</ThemedText>
              <TouchableOpacity onPress={handleEdit}>
                <ThemedText style={styles.editButton}>Tahrirlash</ThemedText>
              </TouchableOpacity>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <ThemedText style={styles.label}>Telefon raqam</ThemedText>
                <ThemedText style={styles.value}>{userData.phone_number}</ThemedText>
              </View>
              {userData.email && (
                <View style={styles.infoItem}>
                  <ThemedText style={styles.label}>Email</ThemedText>
                  <ThemedText style={styles.value}>{userData.email}</ThemedText>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <TouchableOpacity style={styles.menuItem}>
              <ThemedText style={styles.menuItemText}>Buyurtmalarim</ThemedText>
              <ThemedText style={styles.menuItemArrow}>→</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <ThemedText style={styles.menuItemText}>Sozlamalar</ThemedText>
              <ThemedText style={styles.menuItemArrow}>→</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, styles.logoutMenuItem]} 
              onPress={handleLogout}
            >
              <ThemedText style={[styles.menuItemText, styles.logoutText]}>Chiqish</ThemedText>
              <ThemedText style={[styles.menuItemArrow, styles.logoutText]}>→</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {renderEditModal()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#444',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  saveButton: {
    backgroundColor: '#FFD600',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  editButton: {
    color: '#FFD600',
    fontSize: 14,
    fontWeight: '500',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFD600',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  infoContainer: {
    flex: 1,
  },
  section: {
    backgroundColor: '#333',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD600',
  },
  infoRow: {
    padding: 16,
  },
  infoItem: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuItemArrow: {
    fontSize: 18,
    color: '#999',
  },
  logoutMenuItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#FF4444',
  },
});
