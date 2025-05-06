import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const languages = [
  { id: 'en', name: 'English', code: 'EN' },
  { id: 'es', name: 'Español', code: 'ES' },
  { id: 'fr', name: 'Français', code: 'FR' },
  { id: 'de', name: 'Deutsch', code: 'DE' },
  { id: 'it', name: 'Italiano', code: 'IT' },
  { id: 'pt', name: 'Português', code: 'PT' },
  { id: 'ru', name: 'Русский', code: 'RU' },
  { id: 'zh', name: '中文', code: 'ZH' },
  { id: 'ja', name: '日本語', code: 'JA' },
  { id: 'ko', name: '한국어', code: 'KO' },
];

export default function LanguageScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleLanguageSelect = (languageId: string) => {
    setSelectedLanguage(languageId);
    // TODO: Implement language change logic
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Language</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.languageList}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.id}
              style={styles.languageItem}
              onPress={() => handleLanguageSelect(language.id)}
            >
              <View style={styles.languageInfo}>
                <ThemedText style={styles.languageName}>{language.name}</ThemedText>
                <ThemedText style={styles.languageCode}>{language.code}</ThemedText>
              </View>
              {selectedLanguage === language.id && (
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
  languageList: {
    backgroundColor: '#333',
    borderRadius: 16,
    margin: 16,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  languageCode: {
    fontSize: 14,
    color: '#999',
  },
}); 