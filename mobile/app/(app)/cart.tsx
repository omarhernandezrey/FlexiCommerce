import { View, FlatList, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cart';
import { useAuthStore } from '../../store/auth';
import { productService } from '../../lib/services';
import { useEffect, useState } from 'react';
import Text from '../../components/Text';
import Button from '../../components/Button';
import { colors, spacing, borderRadius } from '../../styles/theme';

interface CartItemWithProduct {
  id: string;
  productId: string;
  quantity: number;
  product: any;
}

export default function CartScreen() {
  const router = useRouter();
  const { items: cartItems, removeItem, updateQuantity, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const itemsWithProducts = await Promise.all(
          cartItems.map(async (item) => {
            try {
              const response = await productService.getProduct(item.productId);
              return {
                id: item.id || item.productId,
                productId: item.productId,
                quantity: item.quantity,
                product: response.data,
              };
            } catch (err) {
              console.error('Error loading product:', err);
              return null;
            }
          })
        );
        setItems(itemsWithProducts.filter((item) => item !== null) as CartItemWithProduct[]);
      } catch (err) {
        console.error('Error loading cart items:', err);
      } finally {
        setLoading(false);
      }
    };

    if (cartItems.length > 0) {
      loadProducts();
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [cartItems]);

  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = () => {
    if (!user) {
      Alert.alert('Debes iniciar sesión', 'Inicia sesión para completar tu compra');
      return;
    }
    router.push('/(app)/checkout');
  };

  const handleRemove = (itemId: string) => {
    Alert.alert('Eliminar del carrito', '¿Estás seguro?', [
      { text: 'Cancelar', onPress: () => {} },
      {
        text: 'Eliminar',
        onPress: () => removeItem(itemId),
        style: 'destructive',
      },
    ]);
  };

  if (loading && cartItems.length > 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg, backgroundColor: colors.background }}>
        <Ionicons name="bag-outline" size={64} color={colors.gray} />
        <Text style={{ fontSize: 18, fontWeight: '700', marginTop: spacing.lg, textAlign: 'center' }}>
          Tu carrito está vacío
        </Text>
        <Text style={{ fontSize: 14, color: colors.gray, marginTop: spacing.md, textAlign: 'center' }}>
          Explora nuestros productos y agrega algo a tu carrito
        </Text>
        <Button onPress={() => router.push('/(app)')} title="Explorar Productos" size="lg" style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              gap: spacing.md,
              paddingVertical: spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            {/* Product Image */}
            <Image
              source={{ uri: item.product.image }}
              style={{
                width: 80,
                height: 80,
                borderRadius: borderRadius.md,
                backgroundColor: colors.lightGray,
              }}
            />

            {/* Product Info */}
            <View style={{ flex: 1, justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontWeight: '600', marginBottom: spacing.xs }} numberOfLines={2}>
                  {item.product.name}
                </Text>
                <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '700' }}>
                  ${item.product.price?.toFixed(2)}
                </Text>
              </View>

              {/* Quantity Control */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                  width: 100,
                }}
              >
                <Pressable
                  onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: borderRadius.sm,
                    backgroundColor: colors.lightGray,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="remove" size={16} color={colors.text} />
                </Pressable>
                <Text style={{ textAlign: 'center', fontWeight: '600', fontSize: 14 }}>
                  {item.quantity}
                </Text>
                <Pressable
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: borderRadius.sm,
                    backgroundColor: colors.lightGray,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="add" size={16} color={colors.text} />
                </Pressable>
              </View>
            </View>

            {/* Delete Button */}
            <Pressable
              onPress={() => handleRemove(item.id)}
              style={{
                justifyContent: 'center',
                paddingLeft: spacing.md,
              }}
            >
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </Pressable>
          </View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: spacing.xl * 2,
        }}
        ListHeaderComponent={
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: spacing.lg }}>
            Tu Carrito ({items.length})
          </Text>
        }
      />

      {/* Summary Footer */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          padding: spacing.lg,
          gap: spacing.md,
        }}
      >
        {/* Calculations */}
        <View style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.gray }}>Subtotal:</Text>
            <Text style={{ fontWeight: '600' }}>${totalPrice.toFixed(2)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.gray }}>Envío:</Text>
            <Text style={{ fontWeight: '600' }}>Calculado al confirmar</Text>
          </View>
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: colors.border,
              paddingTopVertical: spacing.sm,
              marginTopVertical: spacing.sm,
            }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '700' }}>Total:</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>
              ${totalPrice.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={{ gap: spacing.md }}>
          <Button onPress={handleCheckout} title="Ir a Checkout" size="lg" />
          <Button
            onPress={() => router.push('/(app)')}
            title="Seguir Comprando"
            variant="secondary"
            size="lg"
          />
        </View>
      </View>
    </View>
  );
}
