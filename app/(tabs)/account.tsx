import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const settings = [
  {
    id: 'favorites',
    title: 'Favorite Cars',
    icon: 'heart.fill',
    route: '/(tabs)' as const,
  },
  {
    id: 'bookings',
    title: 'My Bookings',
    icon: 'calendar',
    route: '/(tabs)/bookings' as const,
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'gearshape.fill',
    route: '/(tabs)' as const,
  },
] as const;

export default function AccountScreen() {
  const { logout } = useAuth();
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    phone_number: ''
  });

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const parsedUserData = JSON.parse(userDataString);
          setUserData(parsedUserData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    getUserData();
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Profile</ThemedText>
      </View>

      <ScrollView style={styles.content}>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <Image 
            source={require('@/assets/images/avatar.jpg')} 
            style={styles.avatar} 
          />
          <View style={styles.userInfo}>
            <ThemedText style={styles.userName}>{userData.username}</ThemedText>
            <ThemedText style={styles.userEmail}>{userData.email}</ThemedText>
            <ThemedText style={styles.userPhone}>{userData.phone_number}</ThemedText>
          </View>
        </View>

        {/* Settings List */}
        <View style={styles.settingsSection}>
          {settings.map((setting) => (
            <TouchableOpacity
              key={setting.id}
              style={styles.settingItem}
              onPress={() => router.push(setting.route)}
            >
              <View style={styles.settingLeft}>
                <IconSymbol name={setting.icon} size={24} color="#999" />
                <ThemedText style={styles.settingTitle}>{setting.title}</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color="#FF4444" />
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#333',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#999',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 16,
    color: '#999',
  },
  settingsSection: {
    backgroundColor: '#333',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF4444',
    marginLeft: 8,
    fontWeight: '600',
  },
}); 