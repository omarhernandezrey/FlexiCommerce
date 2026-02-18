import { View, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ordersService } from '../../lib/services';
import Text from '../../components/Text';
import Button from '../../components/Button';
import { colors, spacing, borderRadius } from '../../styles/theme';

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const response = await ordersService.getOrders();
        setOrders(response.data);
      } catch (err) {
        console.error('Error loading orders:', err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.warning || '#FFA500';
      case 'confirmed':
        return colors.info || '#0084FF';
      case 'shipped':
        return colors.success || '#28A745';
      case 'delivered':
        return colors.primary;
      case 'cancelled':
        return colors.danger;
      default:
        return colors.gray;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const renderOrder = ({ item }: { item: any }) => (
    <Pressable
      onPress={() => router.push(`/(app)/orders/${item.id}`)}
      style={{
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
        <View>
          <Text style={{ fontWeight: '700', fontSize: 14 }}>Pedido #{item.id}</Text>
          <Text style={{ fontSize: 12, color: colors.gray, marginTop: spacing.xs }}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View
          style={{
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: borderRadius.full,
            backgroundColor: getStatusColor(item.status),
          }}
        >
          <Text style={{ fontSize: 11, color: colors.white, fontWeight: '600' }}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: 12, color: colors.gray }}>
            {item.items?.length || 0} artículo{item.items?.length !== 1 ? 's' : ''}
          </Text>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: spacing.xs }}>
            ${item.total?.toFixed(2) || '0.00'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.gray} />
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: spacing.xl,
        }}
        ListHeaderComponent={
          <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: spacing.lg }}>
            Mis Pedidos ({orders.length})
          </Text>
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
            <Ionicons name="receipt-outline" size={64} color={colors.gray} />
            <Text style={{ fontSize: 18, fontWeight: '700', marginTop: spacing.lg, textAlign: 'center' }}>
              Sin pedidos aún
            </Text>
            <Text style={{ fontSize: 14, color: colors.gray, marginTop: spacing.md, textAlign: 'center' }}>
              Realiza tu primera compra
            </Text>
            <Button
              onPress={() => router.push('/(app)')}
              title="Explorar Productos"
              size="lg"
              style={{ marginTop: spacing.lg }}
            />
          </View>
        }
      />
    </View>
  );
}
