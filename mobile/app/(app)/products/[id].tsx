import { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Image,
  ActivityIndicator,
  Pressable,
  FlatList,
  Dimensions,
  Alert,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProductDetail } from '../../../hooks/useProducts';
import { useAuthStore } from '../../../store/auth';
import { useCartStore } from '../../../store/cart';
import Text from '../../../components/Text';
import Button from '../../../components/Button';
import { colors, spacing, borderRadius } from '../../../styles/theme';
import { reviewService } from '../../../lib/services';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const { product, similar, loading, error } = useProductDetail(id as string);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  // Fetch reviews
  useEffect(() => {
    const loadReviews = async () => {
      if (!id) return;
      try {
        setLoadingReviews(true);
        const response = await reviewService.getReviews(id as string);
        setReviews(response.data);
      } catch (err) {
        console.error('Error loading reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    };
    loadReviews();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      quantity,
    });
    Alert.alert('Éxito', `${product.name} agregado al carrito`);
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `${product.name} - $${product.price}`,
        url: `https://flexicommerce.com/products/${product.id}`,
        title: product.name,
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleReview = () => {
    if (!user) {
      Alert.alert('Debes iniciar sesión', 'Inicia sesión para dejar un comentario');
      return;
    }
    router.push(`/(app)/reviews/${id}`);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, paddingHorizontal: spacing.lg }}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
        <Text style={{ marginTop: spacing.md, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
          {error || 'Producto no encontrado'}
        </Text>
        <Button onPress={() => router.back()} title="Atrás" size="lg" style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  // Mock images
  const images = [product.image, product.image, product.image];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl * 2 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            marginTop: spacing.md,
          }}
        >
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </Pressable>
          <Pressable onPress={handleShare}>
            <Ionicons name="share-social" size={24} color={colors.primary} />
          </Pressable>
        </View>

        {/* Image Carousel */}
        <View style={{ height: 350, backgroundColor: colors.white, marginBottom: spacing.lg }}>
          <FlatList
            data={images}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={{ width, height: 350, resizeMode: 'cover' }}
              />
            )}
            keyExtractor={(_, idx) => idx.toString()}
            horizontal
            pagingEnabled
            scrollEventThrottle={16}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setImageIndex(index);
            }}
            scrollEnabled
          />

          {/* Image Dots */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              gap: spacing.xs,
              paddingVertical: spacing.md,
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            {images.map((_, idx) => (
              <View
                key={idx}
                style={{
                  width: imageIndex === idx ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: imageIndex === idx ? colors.primary : colors.lightGray,
                }}
              />
            ))}
          </View>
        </View>

        {/* Product Info */}
        <View style={{ paddingHorizontal: spacing.lg }}>
          <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: spacing.sm }}>{product.name}</Text>

          {/* Rating and Category */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.md,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Ionicons name="star" size={16} color="#FFC107" />
              <Text style={{ fontWeight: '600' }}>
                {product.avgRating?.toFixed(1) || '0'} ({product.reviewCount || 0})
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: colors.gray, backgroundColor: colors.lightGray, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm }}>
              {product.category?.name}
            </Text>
          </View>

          {/* Price */}
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.primary, marginBottom: spacing.md }}>
            ${product.price?.toFixed(2)}
          </Text>

          {/* Description */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={{ fontWeight: '600', marginBottom: spacing.sm }}>Descripción</Text>
            <Text style={{ color: colors.gray, lineHeight: 20 }}>
              {product.description || 'Sin descripción disponible'}
            </Text>
          </View>

          {/* Quantity Selector */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={{ fontWeight: '600', marginBottom: spacing.sm }}>Cantidad</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: borderRadius.md,
                width: 120,
              }}
            >
              <Pressable
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: spacing.sm,
                }}
              >
                <Ionicons name="remove" size={18} color={colors.text} />
              </Pressable>
              <Text style={{ fontWeight: '600', minWidth: 30, textAlign: 'center' }}>{quantity}</Text>
              <Pressable
                onPress={() => setQuantity(quantity + 1)}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: spacing.sm,
                }}
              >
                <Ionicons name="add" size={18} color={colors.text} />
              </Pressable>
            </View>
          </View>

          {/* Reviews Section */}
          <View style={{ marginBottom: spacing.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={{ fontSize: 16, fontWeight: '700' }}>Comentarios ({reviews.length})</Text>
              <Pressable
                onPress={handleReview}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs,
                  borderRadius: borderRadius.sm,
                  borderWidth: 1,
                  borderColor: colors.primary,
                }}
              >
                <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 12 }}>Escribir</Text>
              </Pressable>
            </View>

            {loadingReviews ? (
              <ActivityIndicator color={colors.primary} />
            ) : reviews.length > 0 ? (
              <View>
                {reviews.slice(0, 3).map((review: any) => (
                  <View
                    key={review.id}
                    style={{
                      paddingBottom: spacing.md,
                      marginBottom: spacing.md,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                      <Text style={{ fontWeight: '600', fontSize: 14 }}>{review.user?.name}</Text>
                      <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Ionicons key={i} name="star" size={14} color="#FFC107" />
                        ))}
                      </View>
                    </View>
                    <Text style={{ color: colors.gray, fontSize: 13 }}>{review.comment}</Text>
                  </View>
                ))}
                {reviews.length > 3 && (
                  <Pressable onPress={() => router.push(`/(app)/reviews/${id}`)}>
                    <Text style={{ color: colors.primary, fontWeight: '600', textAlign: 'center', paddingVertical: spacing.md }}>
                      Ver todos los comentarios
                    </Text>
                  </Pressable>
                )}
              </View>
            ) : (
              <Text style={{ color: colors.gray, textAlign: 'center', paddingVertical: spacing.lg }}>
                Sin comentarios aún
              </Text>
            )}
          </View>

          {/* Similar Products */}
          {similar.length > 0 && (
            <View>
              <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: spacing.md }}>Productos Similares</Text>
              <FlatList
                data={similar}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => router.push(`/(app)/products/${item.id}`)}
                    style={{ marginRight: spacing.md }}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={{ width: 120, height: 120, borderRadius: borderRadius.md, marginBottom: spacing.sm }}
                    />
                    <Text style={{ fontWeight: '600', fontSize: 12, width: 120 }} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={{ color: colors.primary, fontWeight: '700' }}>${item.price?.toFixed(2)}</Text>
                  </Pressable>
                )}
                keyExtractor={(item) => item.id}
                horizontal
                scrollEnabled
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add to Cart Float Button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: spacing.lg,
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Button onPress={handleAddToCart} title={`Agregar al carrito - $${(product.price * quantity).toFixed(2)}`} size="lg" />
      </View>
    </View>
  );
}
