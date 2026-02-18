import { useState } from 'react';
import { View, FlatList, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/ProductCard';
import Text from '../../components/Text';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import { colors, spacing, borderRadius } from '../../styles/theme';

export default function SearchScreen() {
  const { query: initialQuery } = useLocalSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState((initialQuery as string) || '');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { products, loading, searchProducts, filterByCategory } = useProducts();

  const handleSearch = () => {
    if (query.trim()) {
      searchProducts(query);
    }
  };

  const handleFilterRating = (rating: number | null) => {
    setRatingFilter(rating);
    // In production: apply rating filter to products
  };

  const filteredProducts = products.filter((p) => {
    if (ratingFilter && p.avgRating < ratingFilter) return false;
    if (p.price < priceRange.min || p.price > priceRange.max) return false;
    return true;
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={filteredProducts}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => router.push(`/(app)/products/${item.id}`)}
            style={{
              flex:
                index % 2 === 0
                  ? 0
                  : undefined,
              marginRight: index % 2 === 0 ? spacing.sm : 0,
            }}
          >
            <ProductCard product={item} width={150} />
          </Pressable>
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.md }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.lg }}>
            {/* Search Bar */}
            <TextInput
              placeholder="Buscar productos..."
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              RightIcon={() => (
                <Pressable onPress={handleSearch}>
                  <Ionicons name="search" size={20} color={colors.primary} />
                </Pressable>
              )}
            />

            {/* Filter Toggle */}
            <Pressable
              onPress={() => setShowFilters(!showFilters)}
              style={{
                marginTop: spacing.md,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: borderRadius.md,
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontWeight: '600' }}>Filtros</Text>
              <Ionicons name={showFilters ? 'chevron-up' : 'chevron-down'} size={20} color={colors.text} />
            </Pressable>

            {/* Filters Panel */}
            {showFilters && (
              <View style={{ marginTop: spacing.md, paddingVertical: spacing.md }}>
                {/* Rating Filter */}
                <View style={{ marginBottom: spacing.lg }}>
                  <Text style={{ fontWeight: '600', marginBottom: spacing.sm }}>Calificación Mínima</Text>
                  <View style={{ flexDirection: 'row', gap: spacing.md }}>
                    {[null, 3, 4, 5].map((rating) => (
                      <Pressable
                        key={rating}
                        onPress={() => handleFilterRating(rating)}
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
                            fontSize: 12,
                          }}
                        >
                          {rating ? `${rating}+` : 'Todos'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Price Range */}
                <View style={{ marginBottom: spacing.lg }}>
                  <Text style={{ fontWeight: '600', marginBottom: spacing.sm }}>Rango de Precio</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: spacing.md,
                      alignItems: 'center',
                    }}
                  >
                    <TextInput
                      placeholder="Mín"
                      value={priceRange.min.toString()}
                      onChangeText={(val) =>
                        setPriceRange({ ...priceRange, min: parseInt(val) || 0 })
                      }
                      keyboardType="numeric"
                    />
                    <Text style={{ fontSize: 14 }}>-</Text>
                    <TextInput
                      placeholder="Máx"
                      value={priceRange.max.toString()}
                      onChangeText={(val) =>
                        setPriceRange({ ...priceRange, max: parseInt(val) || 10000 })
                      }
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Results Count */}
            {!loading && (
              <Text style={{ fontSize: 12, color: colors.gray, marginTop: spacing.md }}>
                {filteredProducts.length} productos encontrados
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
              <Ionicons name="search-outline" size={48} color={colors.gray} />
              <Text style={{ marginTop: spacing.md, color: colors.gray }}>
                {query ? 'Sin resultados' : 'Busca un producto'}
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
