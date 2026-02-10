import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const decodeHTML = (html: string) => {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&nbsp;/g, ' ');
};

const stripHTML = (html: string) => {
  return html.replace(/<[^>]*>/g, '');
};

export default function ArticleScreen() {
  const { title, date, content } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        <Text style={styles.title}>{decodeHTML(title as string)}</Text>
        <Text style={styles.date}>
          {new Date(date as string).toLocaleDateString()} at {new Date(date as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <View style={styles.divider} />
        <Text style={styles.content}>{stripHTML(decodeHTML(content as string))}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 10,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  divider: {
    height: 2,
    backgroundColor: '#8B0000',
    marginBottom: 15,
  },
  content: {
    fontSize: 16,
    lineHeight: 26,
    color: '#333',
  },
});