import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { productService, recommendationService } from '../../lib/services';
import { ProductCard } from '../../components/ProductCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const PRIMARY = '#2563eb';
const BG = '#f6f7f8';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  avgRating?: number;
  reviewCount?: number;
}

function SkeletonCard() {
  return (
    <View style={[styles.skeletonCard, { width: CARD_WIDTH }]}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: '60%' }]} />
        <View style={[styles.skeletonLine, { width: '40%' }]} />
      </View>
    </View>
  );
}

function SkeletonSection() {
  return (
    <View style={styles.skeletonSection}>
      <View style={styles.skeletonTitle} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </ScrollView>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  const [featured, setFeatured] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);

      const [featuredRes, trendingRes] = await Promise.allSettled([
        productService.getProducts(1, 10),
        recommendationService.getTrending(),
      ]);

      if (featuredRes.status === 'fulfilled') {
        const data = featuredRes.value.data;
        const products = data?.data?.products || data?.data || data?.products || [];
        setFeatured(Array.isArray(products) ? products : []);
      } else {
        setFeatured([]);
      }

      if (trendingRes.status === 'fulfilled') {
        const data = trendingRes.value.data;
        const products = data?.data?.products || data?.data || data?.products || [];
        setTrending(Array.isArray(products) ? products.slice(0, 8) : []);
      } else {
        // Si trending falla, reutilizamos una muestra de featured
        if (featuredRes.status === 'fulfilled') {
          const data = featuredRes.value.data;
          const products = data?.data?.products || data?.data || data?.products || [];
          setTrending(Array.isArray(products) ? products.slice(0, 5) : []);
        } else {
          setTrending([]);
        }
      }
    } catch (err: any) {
      setError('No se pudo cargar los productos. Verifica tu conexión.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const goToProduct = (id: string) => {
    router.push(`/(app)/products/${id}` as any);
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={{ marginRight: 12 }}>
      <ProductCard
        product={item}
        width={CARD_WIDTH}
        onPress={() => goToProduct(item.id)}
      />
    </View>
  );

  const renderGridItem = ({ item }: { item: Product }) => (
    <View style={{ width: CARD_WIDTH, marginBottom: 16 }}>
      <ProductCard
        product={item}
        width={CARD_WIDTH}
        onPress={() => goToProduct(item.id)}
      />
    </View>
  );

  if (loading) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroBanner}>
          <View style={styles.skeletonBannerText} />
          <View style={[styles.skeletonBannerText, { width: '60%', marginTop: 8 }]} />
        </View>
        <SkeletonSection />
        <SkeletonSection />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[PRIMARY]}
          tintColor={PRIMARY}
        />
      }
    >
      {/* Banner Hero */}
      <View style={styles.heroBanner}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroGreeting}>Bienvenido a</Text>
          <Text style={styles.heroTitle}>FlexiCommerce</Text>
          <Text style={styles.heroSubtitle}>Los mejores productos al mejor precio</Text>
          <TouchableOpacity style={styles.heroButton} onPress={() => router.push('/(app)/search')}>
            <Text style={styles.heroButtonText}>Explorar ahora</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <Ionicons name="storefront" size={64} color="rgba(255,255,255,0.3)" style={styles.heroIcon} />
      </View>

      {/* Accesos rápidos */}
      <View style={styles.quickAccess}>
        <TouchableOpacity style={styles.quickItem} onPress={() => router.push('/(app)/search')}>
          <View style={[styles.quickIcon, { backgroundColor: '#eff6ff' }]}>
            <Ionicons name="search" size={22} color={PRIMARY} />
          </View>
          <Text style={styles.quickLabel}>Buscar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickItem} onPress={() => router.push('/(app)/cart')}>
          <View style={[styles.quickIcon, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="bag" size={22} color="#d97706" />
          </View>
          <Text style={styles.quickLabel}>Carrito</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickItem} onPress={() => router.push('/(app)/wishlist')}>
          <View style={[styles.quickIcon, { backgroundColor: '#fce7f3' }]}>
            <Ionicons name="heart" size={22} color="#db2777" />
          </View>
          <Text style={styles.quickLabel}>Favoritos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickItem} onPress={() => router.push('/(app)/profile')}>
          <View style={[styles.quickIcon, { backgroundColor: '#f0fdf4' }]}>
            <Ionicons name="person" size={22} color="#16a34a" />
          </View>
          <Text style={styles.quickLabel}>Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="wifi-outline" size={20} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadData}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="trending-up" size={18} color="#ef4444" />
              <Text style={styles.sectionTitle}>Tendencias</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(app)/search')}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={trending}
            renderItem={renderProductItem}
            keyExtractor={(item) => `trending-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            scrollEnabled
          />
        </View>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="star" size={18} color="#f59e0b" />
              <Text style={styles.sectionTitle}>Productos Destacados</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(app)/search')}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={featured}
            renderItem={renderGridItem}
            keyExtractor={(item) => `featured-${item.id}`}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            scrollEnabled={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />
        </View>
      )}

      {/* Estado vacío cuando no hay productos */}
      {!error && featured.length === 0 && trending.length === 0 && !loading && (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Sin productos disponibles</Text>
          <Text style={styles.emptySubtitle}>Por favor verifica la conexión con el servidor</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Recargar</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  heroBanner: {
    backgroundColor: PRIMARY,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroLeft: {
    flex: 1,
  },
  heroGreeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '400',
  },
  heroTitle: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 2,
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    marginBottom: 12,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  heroButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  heroIcon: {
    marginLeft: 8,
  },
  quickAccess: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  quickItem: {
    alignItems: 'center',
    gap: 6,
  },
  quickIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLabel: {
    fontSize: 11,
    color: '#4b5563',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  seeAll: {
    fontSize: 13,
    color: PRIMARY,
    fontWeight: '600',
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#ef4444',
  },
  retryText: {
    fontSize: 13,
    color: PRIMARY,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  // Skeleton styles
  skeletonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  skeletonImage: {
    height: 160,
    backgroundColor: '#e5e7eb',
  },
  skeletonContent: {
    padding: 10,
    gap: 8,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '80%',
  },
  skeletonSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  skeletonTitle: {
    height: 18,
    width: 140,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonBannerText: {
    height: 20,
    width: '70%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
  },
});
