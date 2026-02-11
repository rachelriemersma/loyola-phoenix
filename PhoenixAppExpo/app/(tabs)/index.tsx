import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  FlatList,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const HOME_CATEGORIES = [103, 111, 112, 108, 107, 110, 113, 740, 102, 746, 741, 738, 739, 99, 2068, 744, 136, 675, 676, 135, 745, 2470, 761, 3548, 104, 220, 3920, 142, 751, 750, 797, 749, 119, 2439, 3478, 3760, 3762, 3763, 3764, 3765];

const CATEGORIES = [
  { id: HOME_CATEGORIES, name: 'Home' },
  { id: [103, 111, 112, 108, 107, 110, 113, 740], name: 'News' },
  { id: [102, 746, 741, 738, 739], name: 'Sports' },
  { id: [99, 2068, 744, 136, 675, 676, 135, 745, 2470, 761, 3548], name: 'Arts' },
  { id: [104, 220, 3920, 142, 751, 750, 797, 749, 119, 2439, 3478], name: 'Opinion' },
  { id: [3760, 3762, 3763, 3764, 3765], name: 'Español' },
];

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

export default function TabOneScreen() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(HOME_CATEGORIES);
  const [selectedName, setSelectedName] = useState('Home');
  const router = useRouter();

  const fetchArticles = (categoryId: number[], pageNum: number, append: boolean = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    fetch(`https://loyolaphoenix.com/wp-json/wp/v2/posts?categories=${categoryId.join(',')}&per_page=20&page=${pageNum}&orderby=date&order=desc&_embed`)
      .then(response => {
        const totalPages = response.headers.get('X-WP-TotalPages');
        setHasMore(pageNum < parseInt(totalPages || '1'));
        return response.json();
      })
      .then(data => {
        if (append) {
          setArticles(prev => [...prev, ...data]);
        } else {
          setArticles(data);
        }
        setLoading(false);
        setLoadingMore(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
        setLoadingMore(false);
      });
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setArticles([]);
    fetchArticles(selectedCategory, 1, false);
  }, [selectedCategory]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchArticles(selectedCategory, nextPage, true);
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>The Loyola Phoenix</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
      >
        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.name}
            style={[
              styles.tab,
              selectedName === category.name && styles.activeTab
            ]}
            onPress={() => {
              setSelectedCategory(category.id);
              setSelectedName(category.name);
            }}
          >
            <Text style={[
              styles.tabText,
              selectedName === category.name && styles.activeTabText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.article}
              onPress={() => router.push({
                pathname: '/article' as any,
                params: {
                  title: item.title.rendered,
                  date: item.date,
                  content: item.content.rendered,
                  author: item._embedded?.author?.[0]?.name || 'The Loyola Phoenix',
                }
              })}
            >
              <Text style={styles.title}>{decodeHTML(item.title.rendered)}</Text>
              <Text style={styles.author}>
                {item._embedded?.author?.[0]?.name || 'The Loyola Phoenix'}
              </Text>
              <Text style={styles.date}>
                {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}
    </SafeAreaView>
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#8B0000',
    color: '#8B0000',
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeTab: {
    backgroundColor: '#8B0000',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
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
});