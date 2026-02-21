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
import { decodeHTML } from '@/utils/html';
import { getCache, setCache } from '@/utils/cache';
import { logScreenView, logArticleOpen } from '@/utils/analytics';

type Article = {
  id: number;
  title: { rendered: string };
  date: string;
  content: { rendered: string };
  _embedded?: {
    'wp:featuredmedia'?: [{ source_url: string }];
    author?: [{ name: string }];
  };
};

const ArticleItem = React.memo(({
  title,
  author,
  date,
  imageUrl,
  onPress,
}: {
  title: string;
  author: string;
  date: string;
  imageUrl?: string;
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
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isStaleData, setIsStaleData] = useState(false);
  const { selectedCategory, selectedName, isSearching, searchQuery } = useCategory();
  const router = useRouter();

  useEffect(() => {
    logScreenView('home');
  }, []);

  const fetchArticles = useCallback((categoryId: number[], pageNum: number, append: boolean = false) => {
    const url = `https://loyolaphoenix.com/wp-json/wp/v2/posts?categories=${categoryId.join(',')}&per_page=20&page=${pageNum}&orderby=date&order=desc&_fields=id,title,date,content,_links&_embed=wp:featuredmedia,author`;

    if (pageNum === 1 && !append) {
      const cached = getCache<Article[]>(url);
      if (cached && !cached.isStale) {
        setArticles(cached.data);
        setLoading(false);
        setError(null);
        return;
      }
    }

    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    setIsStaleData(false);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    fetch(url, { signal: controller.signal })
      .then(response => {
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const totalPages = response.headers.get('X-WP-TotalPages');
        setHasMore(pageNum < parseInt(totalPages || '1'));
        return response.json();
      })
      .then(data => {
        const fetched = data as Article[];
        if (pageNum === 1 && !append) {
          setCache(url, fetched);
        }
        if (append) {
          setArticles(prev => {
            const existingIds = new Set(prev.map(a => a.id));
            return [...prev, ...fetched.filter(a => !existingIds.has(a.id))];
          });
        } else {
          setArticles(fetched);
        }
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        setError(null);
      })
      .catch(err => {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          setError('Request timed out. Please check your connection.');
        } else if (pageNum === 1 && !append) {
          const stale = getCache<Article[]>(url);
          if (stale) {
            setArticles(stale.data);
            setIsStaleData(true);
          } else {
            setError('No internet connection. Connect and try again.');
          }
        } else {
          setError('Failed to load more articles. Please try again.');
        }
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      });
  }, []);

  const fetchSearchResults = useCallback((query: string) => {
    const url = `https://loyolaphoenix.com/wp-json/wp/v2/posts?search=${encodeURIComponent(query)}&per_page=20&orderby=relevance&_fields=id,title,date,content,_links&_embed=wp:featuredmedia,author`;

    const cached = getCache<Article[]>(url);
    if (cached && !cached.isStale) {
      setArticles(cached.data);
      setHasMore(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setIsStaleData(false);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    fetch(url, { signal: controller.signal })
      .then(response => {
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        const fetched = data as Article[];
        setCache(url, fetched);
        setArticles(fetched);
        setHasMore(false);
        setLoading(false);
        setRefreshing(false);
        setError(null);
      })
      .catch(err => {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          setError('Request timed out. Please check your connection.');
        } else {
          const stale = getCache<Article[]>(url);
          if (stale) {
            setArticles(stale.data);
            setIsStaleData(true);
          } else {
            setError('Search failed. Check your connection and try again.');
          }
        }
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    if (isSearching) return;
    setPage(1);
    setHasMore(true);
    setArticles([]);
    setIsStaleData(false);
    fetchArticles(selectedCategory, 1, false);
  }, [selectedCategory, isSearching]);

  useEffect(() => {
    if (!isSearching) return;
    if (!searchQuery.trim()) {
      setArticles([]);
      return;
    }
    const timer = setTimeout(() => {
      setPage(1);
      setArticles([]);
      setIsStaleData(false);
      fetchSearchResults(searchQuery.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, isSearching]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !error && !isSearching) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchArticles(selectedCategory, nextPage, true);
    }
  }, [loadingMore, hasMore, error, isSearching, page, selectedCategory, fetchArticles]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    setError(null);
    setIsStaleData(false);
    if (isSearching && searchQuery.trim()) {
      fetchSearchResults(searchQuery.trim());
    } else {
      fetchArticles(selectedCategory, 1, false);
    }
  }, [selectedCategory, isSearching, searchQuery, fetchArticles, fetchSearchResults]);

  const retryFetch = useCallback(() => {
    setError(null);
    setPage(1);
    setHasMore(true);
    setIsStaleData(false);
    if (isSearching && searchQuery.trim()) {
      fetchSearchResults(searchQuery.trim());
    } else {
      fetchArticles(selectedCategory, 1, false);
    }
  }, [selectedCategory, isSearching, searchQuery, fetchArticles, fetchSearchResults]);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#8B0000" />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  }, [loadingMore]);

  const renderItem = useCallback(({ item }: { item: Article }) => {
    const imageUrl = item._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    const title = item.title?.rendered || 'Untitled';
    const author = item._embedded?.author?.[0]?.name || 'The Loyola Phoenix';
    const content = item.content?.rendered || '';
    const date = item.date;

    return (
      <ArticleItem
        title={title}
        author={author}
        date={date}
        imageUrl={imageUrl}
        onPress={() => {
          logArticleOpen(title);
          router.push({
            pathname: '/article' as any,
            params: { title, date, content, author, imageUrl: imageUrl || '' },
          });
        }}
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
      <View style={styles.sectionLabel}>
        <Text style={styles.sectionLabelText}>{selectedName}</Text>
      </View>
      {isStaleData && (
        <View style={styles.staleBanner}>
          <Text style={styles.staleBannerText}>Offline — showing cached content</Text>
        </View>
      )}
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
    fontFamily: 'Merriweather_700Bold',
    marginBottom: 4,
  },
  author: {
    fontSize: 13,
    color: '#8B0000',
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 3,
  },
  date: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
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
    fontFamily: 'Montserrat_400Regular',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
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
    fontFamily: 'Montserrat_600SemiBold',
  },
  sectionLabel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  sectionLabelText: {
    fontSize: 20,
    fontFamily: 'Montserrat_700Bold',
    fontWeight: '700',
    color: '#8B0000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  staleBanner: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 6,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  staleBannerText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
});
