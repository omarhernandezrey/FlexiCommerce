import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore, CartItem } from '../../store/cart';

const PRIMARY = '#2563eb';

export default function CartScreen() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();

  const total = getTotal();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleRemoveItem = (item: CartItem) => {
    Alert.alert(
      'Eliminar producto',
      `¿Deseas eliminar "${item.name}" del carrito?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => removeItem(item.productId),
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Vaciar carrito',
      '¿Deseas eliminar todos los productos del carrito?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Vaciar',
          style: 'destructive',
          onPress: () => clearCart(),
        },
      ]
    );
  };

  const handleCheckout = () => {
    router.push('/(app)/checkout' as any);
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      {/* Imagen del producto */}
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.itemImage} />
      ) : (
        <View style={[styles.itemImage, styles.imagePlaceholder]}>
          <Ionicons name="image-outline" size={28} color="#9ca3af" />
        </View>
      )}

      {/* Info del producto */}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        <Text style={styles.itemSubtotal}>
          Subtotal: ${(item.price * item.quantity).toFixed(2)}
        </Text>

        {/* Controles de cantidad */}
        <View style={styles.quantityRow}>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                item.quantity <= 1 && styles.quantityButtonDisabled,
              ]}
              onPress={() => {
                if (item.quantity <= 1) {
                  handleRemoveItem(item);
                } else {
                  updateQuantity(item.productId, item.quantity - 1);
                }
              }}
            >
              <Ionicons
                name={item.quantity <= 1 ? 'trash-outline' : 'remove'}
                size={16}
                color={item.quantity <= 1 ? '#ef4444' : '#374151'}
              />
            </TouchableOpacity>

            <Text style={styles.quantityText}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.productId, item.quantity + 1)}
            >
              <Ionicons name="add" size={16} color="#374151" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item)}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Estado vacío
  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrapper}>
          <Ionicons name="bag-outline" size={72} color="#d1d5db" />
        </View>
        <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
        <Text style={styles.emptySubtitle}>
          Agrega productos para comenzar tu compra
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
      {/* Encabezado con contador y botón vaciar */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {itemCount} artículo{itemCount !== 1 ? 's' : ''} en el carrito
        </Text>
        <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
          <Ionicons name="trash-outline" size={16} color="#ef4444" />
          <Text style={styles.clearText}>Vaciar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de productos */}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Resumen y botón de checkout */}
      <View style={styles.footer}>
        {/* Resumen */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Productos ({itemCount})</Text>
            <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Envío</Text>
            <Text style={[styles.summaryValue, { color: '#10b981' }]}>
              Calculado al pagar
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total estimado</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Botón Checkout */}
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutText}>Proceder al Pago</Text>
          <Ionicons name="arrow-forward" size={20} color="#ffffff" />
        </TouchableOpacity>

        {/* Link para seguir comprando */}
        <TouchableOpacity
          style={styles.continueLink}
          onPress={() => router.push('/(app)/search')}
        >
          <Text style={styles.continueLinkText}>Seguir comprando</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 8,
  },
  cartItem: {
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
  itemImage: {
    width: 100,
    height: 110,
    backgroundColor: '#f3f4f6',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    lineHeight: 20,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: PRIMARY,
    marginBottom: 2,
  },
  itemSubtotal: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  quantityButtonDisabled: {
    backgroundColor: '#fef2f2',
  },
  quantityText: {
    width: 32,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  removeButton: {
    padding: 6,
  },
  itemSeparator: {
    height: 12,
  },
  footer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 6,
  },
  summaryCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PRIMARY,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  checkoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  continueLink: {
    alignItems: 'center',
    paddingTop: 12,
  },
  continueLinkText: {
    fontSize: 14,
    color: PRIMARY,
    fontWeight: '500',
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
});
