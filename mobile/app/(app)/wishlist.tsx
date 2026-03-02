import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWishlistStore } from '../../store/wishlist';
import { useCartStore } from '../../store/cart';
import { productService } from '../../lib/services';

const PRIMARY = '#2563eb';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  avgRating?: number;
  reviewCount?: number;
  stock?: number;
}

interface WishlistProductItem {
  wishlistId: string;
  productId: string;
  product: Product | null;
  loading: boolean;
}

export default function WishlistScreen() {
  const router = useRouter();
  const { items: wishlistItems, removeItem } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();

  const [productDetails, setProductDetails] = useState<WishlistProductItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadProductDetails = useCallback(async (forceRefresh = false) => {
    if (wishlistItems.length === 0) {
      setProductDetails([]);
      setInitialLoading(false);
      setRefreshing(false);
      return;
    }

    // Inicializar con loading
    const initial: WishlistProductItem[] = wishlistItems.map((wItem) => ({
      wishlistId: wItem.id,
      productId: wItem.productId,
      product: null,
      loading: true,
    }));
    setProductDetails(initial);
    setInitialLoading(false);

    // Cargar cada producto en paralelo
    const promises = wishlistItems.map(async (wItem) => {
      try {
        const response = await productService.getProduct(wItem.productId);
        const data = response.data;
        const product = data?.data || data;
        return {
          wishlistId: wItem.id,
          productId: wItem.productId,
          product: product as Product,
          loading: false,
        };
      } catch {
        return {
          wishlistId: wItem.id,
          productId: wItem.productId,
          product: null,
          loading: false,
        };
      }
    });

    const results = await Promise.all(promises);
    setProductDetails(results);
    setRefreshing(false);
  }, [wishlistItems]);

  useEffect(() => {
    loadProductDetails();
  }, [loadProductDetails]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadProductDetails(true);
  }, [loadProductDetails]);

  const handleRemove = (productId: string, name: string) => {
    Alert.alert(
      'Quitar de favoritos',
      `¿Deseas quitar "${name}" de tus favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar',
          style: 'destructive',
          onPress: () => removeItem(productId),
        },
      ]
    );
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: `cart-${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image || '',
    });
    Alert.alert(
      'Agregado al carrito',
      `"${product.name}" fue agregado al carrito`,
      [
        { text: 'Ver carrito', onPress: () => router.push('/(app)/cart') },
        { text: 'Continuar', style: 'cancel' },
      ]
    );
  };

  const renderItem = ({ item }: { item: WishlistProductItem }) => {
    if (item.loading) {
      return (
        <View style={styles.card}>
          <View style={[styles.productImage, styles.skeletonImage]} />
          <View style={styles.cardContent}>
            <View style={styles.skeletonLine} />
            <View style={[styles.skeletonLine, { width: '50%' }]} />
            <View style={styles.buttonRow}>
              <View style={[styles.skeletonButton, { flex: 1 }]} />
              <View style={[styles.skeletonButton, { width: 44 }]} />
            </View>
          </View>
        </View>
      );
    }

    if (!item.product) {
      return (
        <View style={styles.card}>
          <View style={[styles.productImage, styles.imagePlaceholder]}>
            <Ionicons name="alert-circle-outline" size={32} color="#9ca3af" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.productName}>Producto no disponible</Text>
            <Text style={styles.productId}>ID: {item.productId.slice(0, 8)}...</Text>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeItem(item.productId)}
            >
              <Ionicons name="trash-outline" size={14} color="#ef4444" />
              <Text style={styles.removeBtnText}>Quitar</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    const { product } = item;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(app)/products/${product.id}` as any)}
        activeOpacity={0.95}
      >
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.productImage} />
        ) : (
          <View style={[styles.productImage, styles.imagePlaceholder]}>
            <Ionicons name="image-outline" size={32} color="#9ca3af" />
          </View>
        )}

        <View style={styles.cardContent}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>

          {/* Rating */}
          {product.avgRating !== undefined && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#f59e0b" />
              <Text style={styles.ratingText}>
                {product.avgRating.toFixed(1)} ({product.reviewCount ?? 0})
              </Text>
            </View>
          )}

          <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>

          {/* Botones */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.addToCartBtn}
              onPress={() => handleAddToCart(product)}
            >
              <Ionicons name="bag-add-outline" size={16} color="#ffffff" />
              <Text style={styles.addToCartText}>Agregar al carrito</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.heartBtn}
              onPress={() => handleRemove(product.id, product.name)}
            >
              <Ionicons name="heart" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Loading inicial
  if (initialLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  // Estado vacío
  if (wishlistItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrapper}>
          <Ionicons name="heart-outline" size={72} color="#d1d5db" />
        </View>
        <Text style={styles.emptyTitle}>Sin favoritos</Text>
        <Text style={styles.emptySubtitle}>
          Guarda los productos que te gustan para comprarlos después
        </Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push('/(app)/search')}
        >
          <Ionicons name="search" size={18} color="#ffffff" />
          <Text style={styles.shopButtonText}>Explorar productos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={productDetails}
        renderItem={renderItem}
        keyExtractor={(item) => item.wishlistId}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[PRIMARY]}
            tintColor={PRIMARY}
          />
        }
        ListHeaderComponent={
          <Text style={styles.countText}>
            {wishlistItems.length} producto{wishlistItems.length !== 1 ? 's' : ''} en favoritos
          </Text>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f7f8',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  countText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 14,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  productImage: {
    width: 110,
    height: 130,
    backgroundColor: '#f3f4f6',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    lineHeight: 20,
  },
  productId: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#6b7280',
  },
  productPrice: {
    fontSize: 17,
    fontWeight: 'bold',
    color: PRIMARY,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    borderRadius: 8,
    paddingVertical: 8,
    gap: 6,
  },
  addToCartText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  heartBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  removeBtnText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '500',
  },
  separator: {
    height: 12,
  },
  // Estado vacío
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6f7f8',
    paddingHorizontal: 40,
  },
  emptyIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    gap: 8,
  },
  shopButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  // Skeletons
  skeletonImage: {
    backgroundColor: '#e5e7eb',
  },
  skeletonLine: {
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '85%',
    marginBottom: 8,
  },
  skeletonButton: {
    height: 34,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
});
