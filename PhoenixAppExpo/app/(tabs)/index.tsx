import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';

import { useCategory } from '@/contexts/category-context';

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

// Memoized article item component for better performance
const ArticleItem = React.memo(({
  id,
  title,
  author,
  date,
  imageUrl,
  content,
  onPress
}: {
  id: number;
  title: string;
  author: string;
  date: string;
  imageUrl?: string;
  content: string;
  onPress: () => void;
}) => {
  const decodedTitle = useMemo(() => decodeHTML(title), [title]);
  const formattedDate = useMemo(() => {
    try {
      const dateObj = new Date(date);
      return `${dateObj.toLocaleDateString()} at ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return 'Date unavailable';
    }
  }, [date]);

  return (
    <TouchableOpacity style={styles.article} onPress={onPress}>
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
        />
      )}
      <Text style={styles.title} numberOfLines={3}>{decodedTitle}</Text>
      <Text style={styles.author}>{author}</Text>
      <Text style={styles.date}>{formattedDate}</Text>
    </TouchableOpacity>
  );
});

export default function HomeScreen() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { selectedCategory } = useCategory();
  const router = useRouter();

  const fetchArticles = useCallback((categoryId: number[], pageNum: number, append: boolean = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    fetch(`https://loyolaphoenix.com/wp-json/wp/v2/posts?categories=${categoryId.join(',')}&per_page=20&page=${pageNum}&orderby=date&order=desc&_embed`, {
      signal: controller.signal
    })
      .then(response => {
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const totalPages = response.headers.get('X-WP-TotalPages');
        setHasMore(pageNum < parseInt(totalPages || '1'));
        return response.json();
      })
      .then(data => {
        if (append) {
          setArticles(prev => {
            const existingIds = new Set(prev.map(article => article.id));
            const newArticles = data.filter((article: any) => !existingIds.has(article.id));
            return [...prev, ...newArticles];
          });
        } else {
          setArticles(data);
        }
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        setError(null);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        console.error(error);
        const errorMessage = error.name === 'AbortError'
          ? 'Request timed out. Please check your connection.'
          : 'Failed to load articles. Please try again.';
        setError(errorMessage);
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setArticles([]);
    fetchArticles(selectedCategory, 1, false);
  }, [selectedCategory]);

  const loadMore = () => {
    if (!loadingMore && hasMore && !error) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchArticles(selectedCategory, nextPage, true);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    setError(null);
    fetchArticles(selectedCategory, 1, false);
  }, [selectedCategory, fetchArticles]);

  const retryFetch = useCallback(() => {
    setError(null);
    setPage(1);
    setHasMore(true);
    fetchArticles(selectedCategory, 1, false);
  }, [selectedCategory, fetchArticles]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#8B0000" />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  const renderItem = useCallback(({ item }: { item: any }) => {
    const imageUrl = item._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    const title = item.title?.rendered || 'Untitled';
    const author = item._embedded?.author?.[0]?.name || 'The Loyola Phoenix';
    const content = item.content?.rendered || '';
    const date = item.date;

    return (
      <ArticleItem
        id={item.id}
        title={title}
        author={author}
        date={date}
        imageUrl={imageUrl}
        content={content}
        onPress={() => router.push({
          pathname: '/article' as any,
          params: {
            title,
            date,
            content,
            author,
            imageUrl: imageUrl || '',
          }
        })}
      />
    );
  }, [router]);

  const ListEmptyComponent = useMemo(() => {
    if (loading) return null;
    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={retryFetch}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No articles found</Text>
      </View>
    );
  }, [loading, error, retryFetch]);

  return (
    <View style={styles.container}>
      {loading && articles.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#8B0000" />
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={ListEmptyComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#8B0000']}
              tintColor="#8B0000"
            />
          }
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  article: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  author: {
    fontSize: 13,
    color: '#8B0000',
    fontWeight: '600',
    marginBottom: 3,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
