import { View, FlatList, Pressable, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWishlist } from '../../hooks/useWishlist';
import Text from '../../components/Text';
import Button from '../../components/Button';
import { colors, spacing, borderRadius } from '../../styles/theme';

export default function WishlistScreen() {
  const router = useRouter();
  const { items, loading, removeItem, toggleItem } = useWishlist();

  const renderWishlistItem = ({ item }: { item: any }) => (
    <Pressable
      onPress={() => router.push(`/(app)/products/${item.productId}`)}
      style={{
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
      }}
    >
      {/* Product Image */}
      <Image
        source={{ uri: item.product.image }}
        style={{
          width: 120,
          height: 120,
          backgroundColor: colors.lightGray,
        }}
      />

      {/* Product Info */}
      <View style={{ flex: 1, padding: spacing.md, justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontWeight: '700', marginBottom: spacing.xs }} numberOfLines={2}>
            {item.product.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm }}>
            <Ionicons name="star" size={14} color="#FFC107" />
            <Text style={{ fontSize: 12, color: colors.gray }}>
              {item.product.avgRating?.toFixed(1) || '0'} ({item.product.reviewCount || 0})
            </Text>
          </View>
          <Text style={{ color: colors.gray, fontSize: 12, marginBottom: spacing.sm }}>
            Agregado: {new Date(item.addedAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>
            ${item.product.price?.toFixed(2)}
          </Text>
          <Pressable
            onPress={() => toggleItem(item.productId)}
            style={{
              padding: spacing.sm,
              backgroundColor: colors.lightGray,
              borderRadius: borderRadius.sm,
            }}
          >
            <Ionicons name="heart" size={20} color={colors.danger} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  if (loading && items.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: spacing.lg, color: colors.gray }}>Cargando favoritos...</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg, backgroundColor: colors.background }}>
        <Ionicons name="heart-outline" size={64} color={colors.gray} />
        <Text style={{ fontSize: 18, fontWeight: '700', marginTop: spacing.lg, textAlign: 'center' }}>
          Sin favoritos aún
        </Text>
        <Text style={{ fontSize: 14, color: colors.gray, marginTop: spacing.md, textAlign: 'center' }}>
          Agrega productos a tu lista de favoritos
        </Text>
        <Button
          onPress={() => router.push('/(app)')}
          title="Explorar Productos"
          size="lg"
          style={{ marginTop: spacing.lg }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={items}
        renderItem={renderWishlistItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={{ fontSize: 20, fontWeight: '700' }}>
              Mis Favoritos ({items.length})
            </Text>
            <Text style={{ fontSize: 13, color: colors.gray, marginTop: spacing.xs }}>
              {items.length} {items.length === 1 ? 'producto' : 'productos'}
            </Text>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
              <Ionicons name="heart-outline" size={48} color={colors.gray} />
              <Text style={{ marginTop: spacing.md, color: colors.gray, textAlign: 'center' }}>
                No hay productos en favoritos
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
