import { useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  ActivityIndicator,
  TextInput,
  Pressable,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/ProductCard';
import Text from '../../components/Text';
import Button from '../../components/Button';
import { colors, spacing, borderRadius } from '../../styles/theme';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const GAP = spacing.md;
const PRODUCT_WIDTH = (width - GAP * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

export default function HomeScreen() {
  const router = useRouter();
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { products, loading, error, category, filterByCategory, searchProducts, page, totalPages, goToPage } =
    useProducts();

  // Mock categories - in production: fetch from API
  const categories = useMemo(
    () => [
      { id: '', name: 'Todos', icon: 'grid' },
      { id: 'electronics', name: 'Electrónica', icon: 'phone-portrait' },
      { id: 'clothing', name: 'Ropa', icon: 'shirt' },
      { id: 'books', name: 'Libros', icon: 'book' },
      { id: 'home', name: 'Hogar', icon: 'home' },
    ],
    []
  );

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchProducts(searchQuery);
    }
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      goToPage(page + 1);
    }
  };

  const renderHeader = () => (
    <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
      {/* Search Bar */}
      <View style={{ marginBottom: spacing.md }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.lightGray,
            borderRadius: borderRadius.full,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
          }}
        >
          <Ionicons name="search" size={20} color={colors.gray} />
          <TextInput
            placeholder="Buscar productos..."
            placeholderTextColor={colors.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchActive(true)}
            onBlur={() => setSearchActive(false)}
            onSubmitEditing={handleSearch}
            style={{
              flex: 1,
              marginLeft: spacing.sm,
              paddingVertical: spacing.sm,
              color: colors.text,
              fontSize: 14,
            }}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.gray} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
        {categories.map((cat) => (
          <Pressable
            key={cat.id || 'all'}
            onPress={() => filterByCategory(cat.id)}
            style={{
              marginRight: spacing.md,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderRadius: borderRadius.full,
              backgroundColor: category === cat.id ? colors.primary : colors.lightGray,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Ionicons name={cat.icon as any} size={16} color={category === cat.id ? colors.white : colors.text} />
              <Text
                style={{
                  fontSize: 14,
                  color: category === cat.id ? colors.white : colors.text,
                  fontWeight: '600',
                }}
              >
                {cat.name}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Results Count */}
      {!loading && (
        <Text style={{ fontSize: 12, color: colors.gray, marginBottom: spacing.md }}>
          {products.length} productos
        </Text>
      )}
    </View>
  );

  const renderProduct = ({ item }: { item: any }) => (
    <Pressable
      onPress={() => router.push(`/(app)/products/${item.id}`)}
      style={{ marginBottom: GAP }}
    >
      <ProductCard
        product={item}
        width={PRODUCT_WIDTH}
      />
    </Pressable>
  );

  const renderFooter = () => {
    if (!loading && page >= totalPages) return null;

    return (
      <View style={{ paddingVertical: spacing.lg, alignItems: 'center' }}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <Button
            onPress={handleLoadMore}
            title="Cargar más"
            size="lg"
            style={{ alignSelf: 'center' }}
          />
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Loading Initial */}
      {loading && products.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: spacing.lg, color: colors.gray }}>Cargando productos...</Text>
        </View>
      ) : error && products.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg }}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
          <Text style={{ marginTop: spacing.md, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
            {error}
          </Text>
          <Button
            onPress={() => {
              filterByCategory(category || '');
            }}
            title="Reintentar"
            size="lg"
            style={{ marginTop: spacing.lg }}
          />
        </View>
      ) : products.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg }}>
          <Ionicons name="search-outline" size={48} color={colors.gray} />
          <Text style={{ marginTop: spacing.md, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
            No se encontraron productos
          </Text>
          <Text style={{ marginTop: spacing.sm, color: colors.gray, textAlign: 'center' }}>
            Intenta con otra búsqueda o categoría
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={COLUMN_COUNT}
          columnWrapperStyle={{ gap: GAP }}
          contentContainerStyle={{
            paddingHorizontal: GAP,
            paddingTop: 0,
            gap: GAP,
          }}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          onEndReachedThreshold={0.3}
          onEndReached={handleLoadMore}
          scrollEnabled={true}
          nestedScrollEnabled={false}
        />
      )}
    </View>
  );
}
