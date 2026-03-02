import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../../lib/services';
import { useSearchHistoryStore } from '../../store/search-history';
import { ProductCard } from '../../components/ProductCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;
const PRIMARY = '#2563eb';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  avgRating?: number;
  reviewCount?: number;
}

export default function SearchScreen() {
  const router = useRouter();
  const { history, addSearch, removeSearch, clearHistory, getRecent } = useSearchHistoryStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  const doSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      const response = await productService.searchProducts(searchQuery.trim());
      const data = response.data;
      const products = data?.data?.products || data?.data || data?.products || [];
      setResults(Array.isArray(products) ? products : []);
    } catch (err: any) {
      setError('No se pudo realizar la búsqueda. Verifica tu conexión.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce al escribir
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(() => {
      doSearch(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, doSearch]);

  const handleSubmit = () => {
    if (!query.trim()) return;
    Keyboard.dismiss();
    addSearch(query.trim());
    doSearch(query.trim());
  };

  const handleHistorySelect = (selectedQuery: string) => {
    setQuery(selectedQuery);
    addSearch(selectedQuery);
    doSearch(selectedQuery);
    Keyboard.dismiss();
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setError(null);
    inputRef.current?.focus();
  };

  const goToProduct = (id: string) => {
    if (query.trim()) addSearch(query.trim());
    router.push(`/(app)/products/${id}` as any);
  };

  const recentHistory = getRecent(8);

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={{ width: CARD_WIDTH, marginBottom: 16 }}>
      <ProductCard
        product={item}
        width={CARD_WIDTH}
        onPress={() => goToProduct(item.id)}
      />
    </View>
  );

  const renderHistoryItem = ({ item }: { item: { id: string; query: string } }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleHistorySelect(item.query)}
    >
      <View style={styles.historyLeft}>
        <Ionicons name="time-outline" size={16} color="#9ca3af" />
        <Text style={styles.historyText}>{item.query}</Text>
      </View>
      <TouchableOpacity
        onPress={() => removeSearch(item.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={16} color="#9ca3af" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const showHistory = !query.trim() && recentHistory.length > 0;
  const showEmpty = hasSearched && !loading && results.length === 0 && !error;
  const showResults = hasSearched && !loading && results.length > 0;

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Buscar productos..."
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          autoFocus={false}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {loading && (
          <ActivityIndicator size="small" color={PRIMARY} style={{ marginRight: 8 }} />
        )}
        {query.length > 0 && !loading && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Historial de búsqueda */}
      {showHistory && (
        <View style={styles.historySection}>
          <View style={styles.historySectionHeader}>
            <Text style={styles.historySectionTitle}>Búsquedas recientes</Text>
            <TouchableOpacity onPress={clearHistory}>
              <Text style={styles.clearHistoryText}>Borrar todo</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recentHistory}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}

      {/* Estado vacío sin historial */}
      {!query.trim() && recentHistory.length === 0 && (
        <View style={styles.promptContainer}>
          <Ionicons name="search-outline" size={64} color="#d1d5db" />
          <Text style={styles.promptTitle}>Busca lo que necesitas</Text>
          <Text style={styles.promptSubtitle}>
            Ingresa el nombre de un producto para encontrarlo
          </Text>
        </View>
      )}

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={20} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Sin resultados */}
      {showEmpty && (
        <View style={styles.emptyContainer}>
          <Ionicons name="sad-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Sin resultados</Text>
          <Text style={styles.emptySubtitle}>
            No encontramos productos para "{query}"
          </Text>
          <Text style={styles.emptySuggestion}>
            Intenta con otro término de búsqueda
          </Text>
        </View>
      )}

      {/* Resultados */}
      {showResults && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsCount}>
            {results.length} resultado{results.length !== 1 ? 's' : ''} para "{query}"
          </Text>
          <FlatList
            data={results}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  clearButton: {
    padding: 4,
  },
  historySection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  historySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  historySectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearHistoryText: {
    fontSize: 13,
    color: PRIMARY,
    fontWeight: '500',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  historyText: {
    fontSize: 15,
    color: '#374151',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 42,
  },
  promptContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
    marginTop: 16,
    textAlign: 'center',
  },
  promptSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
    gap: 8,
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#ef4444',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
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
  emptySuggestion: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsCount: {
    fontSize: 13,
    color: '#6b7280',
    paddingHorizontal: 16,
    marginBottom: 12,
    fontWeight: '500',
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
