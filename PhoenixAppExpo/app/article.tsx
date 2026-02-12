import React, { useMemo } from 'react';
import { Image } from 'expo-image';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const { title, date, content, author, imageUrl } = useLocalSearchParams();

  // Memoize expensive string operations
  const decodedTitle = useMemo(() => {
    if (!title || typeof title !== 'string') return 'Untitled';
    return decodeHTML(title);
  }, [title]);

  const decodedContent = useMemo(() => {
    if (!content || typeof content !== 'string') return 'No content available';
    return stripHTML(decodeHTML(content));
  }, [content]);

  const formattedDate = useMemo(() => {
    if (!date || typeof date !== 'string') return 'Date unavailable';
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return 'Date unavailable';
      return `${dateObj.toLocaleDateString()} at ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return 'Date unavailable';
    }
  }, [date]);

  const authorName = useMemo(() => {
    if (!author || typeof author !== 'string') return 'The Loyola Phoenix';
    return author;
  }, [author]);

  const imageUri = useMemo(() => {
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl === '') return null;
    return imageUrl;
  }, [imageUrl]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{decodedTitle}</Text>
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
            placeholder={{ blurhash: 'LKO2?V%2Tw=w]~RBVZRi};RPxuwH' }}
          />
        )}
        <Text style={styles.author}>{authorName}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
        <View style={styles.divider} />
        <Text style={styles.content}>{decodedContent}</Text>
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
  author: {
  fontSize: 14,
  color: '#8B0000',
  fontWeight: '600',
  marginBottom: 5,
},
image: {
  width: '100%',
  height: 220,
  borderRadius: 8,
  marginBottom: 10,
},
});