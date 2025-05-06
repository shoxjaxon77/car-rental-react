import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function SecurityScreen() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSave = () => {
    // TODO: Implement password change logic
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Security</ThemedText>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <ThemedText style={styles.saveButtonText}>Save</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Current Password</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.currentPassword}
              onChangeText={(text) => setFormData({ ...formData, currentPassword: text })}
              placeholderTextColor="#666"
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>New Password</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.newPassword}
              onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
              placeholderTextColor="#666"
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Confirm New Password</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              placeholderTextColor="#666"
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.securityOptions}>
          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <IconSymbol name="fingerprint" size={24} color="#999" />
              <ThemedText style={styles.optionTitle}>Biometric Authentication</ThemedText>
            </View>
            <IconSymbol name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <IconSymbol name="bell" size={24} color="#999" />
              <ThemedText style={styles.optionTitle}>Login Notifications</ThemedText>
            </View>
            <IconSymbol name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>
        </View>
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
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#FFD600',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  formSection: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#999',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
  },
  securityOptions: {
    backgroundColor: '#333',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },
}); 