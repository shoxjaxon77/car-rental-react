import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const themes = [
  {
    id: 'system',
    name: 'System',
    description: 'Follow system theme settings',
    icon: 'smartphone',
  },
  {
    id: 'light',
    name: 'Light',
    description: 'Light theme for day time',
    icon: 'sun',
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Dark theme for night time',
    icon: 'moon',
  },
];

export default function ThemeScreen() {
  const [selectedTheme, setSelectedTheme] = useState('system');

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    // TODO: Implement theme change logic
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Theme</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.themeList}>
          {themes.map((theme) => (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.themeItem,
                selectedTheme === theme.id && styles.selectedThemeItem,
              ]}
              onPress={() => handleThemeSelect(theme.id)}
            >
              <View style={styles.themeInfo}>
                <View style={styles.themeHeader}>
                  <IconSymbol name={theme.icon} size={24} color="#FFD600" />
                  <ThemedText style={styles.themeName}>{theme.name}</ThemedText>
                </View>
                <ThemedText style={styles.themeDescription}>
                  {theme.description}
                </ThemedText>
              </View>
              {selectedTheme === theme.id && (
                <IconSymbol name="check" size={24} color="#FFD600" />
              )}
            </TouchableOpacity>
          ))}
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  themeList: {
    backgroundColor: '#333',
    borderRadius: 16,
    margin: 16,
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  selectedThemeItem: {
    backgroundColor: '#444',
  },
  themeInfo: {
    flex: 1,
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  themeName: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
    fontWeight: '600',
  },
  themeDescription: {
    fontSize: 14,
    color: '#999',
    marginLeft: 36,
  },
}); 