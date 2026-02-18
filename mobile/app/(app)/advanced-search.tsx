import { useState, useMemo } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput as RNTextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../../hooks/useProducts';
import { useSearchHistoryStore } from '../../store/search-history';
import { useCompareStore } from '../../store/compare';
import { ProductCard } from '../../components/ProductCard';
import Text from '../../components/Text';
import Button from '../../components/Button';
import { colors, spacing, borderRadius } from '../../styles/theme';

export default function AdvancedSearchScreen() {
  const router = useRouter();
  const { products, loading, searchProducts } = useProducts();
  const { getRecent, addSearch, clearHistory } = useSearchHistoryStore();
  const { isComparing, toggleProduct, maxProducts } = useCompareStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc' | 'rating'>('relevance');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const recentSearches = useMemo(() => getRecent(8), [getRecent]);

  const filteredAndSorted = useMemo(() => {
    let filtered = products.filter((p) => {
      if (ratingFilter && p.avgRating < ratingFilter) return false;
      if (p.price < priceRange.min || p.price > priceRange.max) return false;
      return true;
    });

    switch (sortBy) {
      case 'price-asc':
        return filtered.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return filtered.sort((a, b) => b.price - a.price);
      case 'rating':
        return filtered.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
      default:
        return filtered;
    }
  }, [products, sortBy, priceRange, ratingFilter]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      addSearch(searchQuery);
      searchProducts(searchQuery);
    }
  };

  const handleRecentSearch = (query: string) => {
    setSearchQuery(query);
    addSearch(query);
    searchProducts(query);
  };

  const renderProduct = ({ item }: { item: any }) => (
    <Pressable
      onPress={() => router.push(`/(app)/products/${item.id}`)}
      style={{
        marginBottom: spacing.md,
        position: 'relative',
      }}
    >
      <ProductCard product={item} width={150} />
      {isComparing(item.id) && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            backgroundColor: colors.primary,
            borderRadius: borderRadius.full,
            padding: spacing.sm,
          }}
        >
          <Ionicons name="checkmark" size={16} color={colors.white} />
        </View>
      )}
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={filteredAndSorted}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.md, paddingHorizontal: spacing.lg }}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.lg }}>
            {/* Search Bar */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.white,
                borderRadius: borderRadius.md,
                paddingHorizontal: spacing.md,
                marginBottom: spacing.md,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Ionicons name="search" size={20} color={colors.primary} />
              <RNTextInput
                placeholder="Buscar productos..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                style={{
                  flex: 1,
                  marginLeft: spacing.sm,
                  paddingVertical: spacing.md,
                  color: colors.text,
                }}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.gray} />
                </Pressable>
              )}
            </View>

            {/* Quick Filters */}
            <View style={{ marginBottom: spacing.md }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: spacing.sm,
                }}
              >
                <Text style={{ fontWeight: '700' }}>Filtros</Text>
                <Pressable onPress={() => setShowAdvanced(!showAdvanced)}>
                  <Ionicons
                    name={showAdvanced ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.primary}
                  />
                </Pressable>
              </View>

              {/* Sort Options */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
                {(['relevance', 'price-asc', 'price-desc', 'rating'] as const).map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => setSortBy(option)}
                    style={{
                      marginRight: spacing.md,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderRadius: borderRadius.full,
                      backgroundColor: sortBy === option ? colors.primary : colors.lightGray,
                    }}
                  >
                    <Text
                      style={{
                        color: sortBy === option ? colors.white : colors.text,
                        fontWeight: '600',
                        fontSize: 12,
                      }}
                    >
                      {option === 'relevance' && 'Relevancia'}
                      {option === 'price-asc' && 'Menor Precio'}
                      {option === 'price-desc' && 'Mayor Precio'}
                      {option === 'rating' && 'Mejor Puntuado'}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Rating Filter */}
              {showAdvanced && (
                <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
                  <View>
                    <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: spacing.sm }}>
                      Calificación Mínima
                    </Text>
                    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                      {[null, 3, 4, 5].map((rating) => (
                        <Pressable
                          key={rating}
                          onPress={() => setRatingFilter(rating)}
                          style={{
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.sm,
                            borderRadius: borderRadius.md,
                            backgroundColor:
                              ratingFilter === rating ? colors.primary : colors.lightGray,
                          }}
                        >
                          <Text
                            style={{
                              color: ratingFilter === rating ? colors.white : colors.text,
                              fontWeight: '600',
                              fontSize: 11,
                            }}
                          >
                            {rating ? `${rating}+` : 'Todos'}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Price Range */}
                  <View>
                    <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: spacing.sm }}>
                      Rango: ${priceRange.min} - ${priceRange.max}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Recent Searches */}
            {recentSearches.length > 0 && !searchQuery && (
              <View style={{ marginBottom: spacing.md }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: spacing.sm,
                  }}
                >
                  <Text style={{ fontWeight: '700', fontSize: 14 }}>Búsquedas Recientes</Text>
                  <Pressable onPress={clearHistory}>
                    <Text style={{ fontSize: 12, color: colors.primary }}>Limpiar</Text>
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {recentSearches.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => handleRecentSearch(item.query)}
                      style={{
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                        borderRadius: borderRadius.full,
                        borderWidth: 1,
                        borderColor: colors.border,
                        backgroundColor: colors.white,
                      }}
                    >
                      <Text style={{ fontSize: 12 }}>{item.query}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Results Count & Compare */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.md,
              }}
            >
              <Text style={{ fontSize: 12, color: colors.gray }}>
                {filteredAndSorted.length} productos encontrados
              </Text>
              {useCompareStore.getState().products.length > 0 && (
                <Button
                  onPress={() => router.push('/(app)/compare')}
                  title={`Comparar (${useCompareStore.getState().products.length}/${maxProducts})`}
                  size="sm"
                />
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
              <Ionicons name="search-outline" size={48} color={colors.gray} />
              <Text style={{ marginTop: spacing.md, color: colors.gray, textAlign: 'center' }}>
                {searchQuery ? 'Sin resultados' : 'Busca un producto'}
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading ? (
            <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null
        }
      />
    </View>
  );
}
