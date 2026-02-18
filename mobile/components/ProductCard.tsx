import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  avgRating?: number;
  reviewCount?: number;
}

interface ProductCardProps {
  product: Product;
  width?: number;
  onPress?: () => void;
}

export function ProductCard({ product, width, onPress }: ProductCardProps) {
  const cardWidth = width || 160;

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={onPress}
      disabled={!onPress}
    >
      {product.image ? (
        <Image
          source={{ uri: product.image }}
          style={[styles.image, { width: cardWidth }]}
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder, { width: cardWidth }]}>
          <Text style={styles.noImageText}>No Image</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.ratingContainer}>
          <Text style={styles.stars}>
            ★ {(product.avgRating ?? 0).toFixed(1)}
          </Text>
          <Text style={styles.reviewCount}>({product.reviewCount ?? 0})</Text>
        </View>

        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default ProductCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    height: 160,
    backgroundColor: '#f3f4f6',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  content: {
    padding: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  stars: {
    fontSize: 12,
    color: '#fbbf24',
    marginRight: 4,
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 12,
    color: '#9ca3af',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
});
