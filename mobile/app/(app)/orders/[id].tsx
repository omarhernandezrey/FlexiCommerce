import { View, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ordersService } from '../../../lib/services';
import Text from '../../../components/Text';
import Button from '../../../components/Button';
import { colors, spacing, borderRadius } from '../../../styles/theme';

const STATUS_STEPS = [
  { id: 'pending', label: 'Pendiente', icon: 'clock-outline' },
  { id: 'confirmed', label: 'Confirmado', icon: 'checkmark-circle-outline' },
  { id: 'shipped', label: 'Enviado', icon: 'send-outline' },
  { id: 'delivered', label: 'Entregado', icon: 'checkmark-done-outline' },
];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await ordersService.getOrder(id as string);
        setOrder(response.data);
      } catch (err) {
        console.error('Error loading order:', err);
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id]);

  const getStatusIndex = (status: string) => {
    return STATUS_STEPS.findIndex((step) => step.id === status);
  };

  const currentStatusIndex = order ? getStatusIndex(order.status) : -1;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg, backgroundColor: colors.background }}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
        <Text style={{ marginTop: spacing.md, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
          Pedido no encontrado
        </Text>
        <Button onPress={() => router.back()} title="Atrás" size="lg" style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        {/* Order Header */}
        <View style={{ backgroundColor: colors.white, padding: spacing.lg, marginBottom: spacing.md }}>
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: spacing.sm }}>
            Pedido #{order.id}
          </Text>
          <Text style={{ color: colors.gray, marginBottom: spacing.md }}>
            {new Date(order.createdAt).toLocaleDateString()}
          </Text>

          <View
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderRadius: borderRadius.full,
              backgroundColor: colors.primary,
              alignSelf: 'flex-start',
            }}
          >
            <Text style={{ fontSize: 12, color: colors.white, fontWeight: '600' }}>
              {order.status?.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Status Timeline */}
        <View style={{ backgroundColor: colors.white, padding: spacing.lg, marginBottom: spacing.md }}>
          <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: spacing.md }}>
            Estado del Envío
          </Text>

          {STATUS_STEPS.map((step, index) => (
            <View
              key={step.id}
              style={{
                flexDirection: 'row',
                marginBottom: index < STATUS_STEPS.length - 1 ? spacing.lg : 0,
              }}
            >
              {/* Timeline Dot */}
              <View style={{ alignItems: 'center', marginRight: spacing.md }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: index <= currentStatusIndex ? colors.primary : colors.lightGray,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons
                    name={step.icon as any}
                    size={24}
                    color={index <= currentStatusIndex ? colors.white : colors.gray}
                  />
                </View>

                {/* Timeline Line */}
                {index < STATUS_STEPS.length - 1 && (
                  <View
                    style={{
                      width: 2,
                      height: spacing.lg,
                      backgroundColor: index < currentStatusIndex ? colors.primary : colors.border,
                      marginTop: spacing.sm,
                    }}
                  />
                )}
              </View>

              {/* Step Label */}
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text
                  style={{
                    fontWeight: index <= currentStatusIndex ? '700' : '600',
                    color: index <= currentStatusIndex ? colors.text : colors.gray,
                  }}
                >
                  {step.label}
                </Text>
                {index === currentStatusIndex && (
                  <Text style={{ fontSize: 12, color: colors.primary, marginTop: spacing.xs }}>
                    Actual
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Items */}
        <View style={{ backgroundColor: colors.white, padding: spacing.lg, marginBottom: spacing.md }}>
          <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: spacing.md }}>
            Artículos ({order.items?.length || 0})
          </Text>

          {order.items?.map((item: any, index: number) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                gap: spacing.md,
                paddingBottom: spacing.md,
                borderBottomWidth: index < (order.items?.length || 1) - 1 ? 1 : 0,
                borderBottomColor: colors.border,
                marginBottom: spacing.md,
              }}
            >
              <Image
                source={{ uri: item.product?.image }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: borderRadius.sm,
                  backgroundColor: colors.lightGray,
                }}
              />
              <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '600' }} numberOfLines={2}>
                  {item.product?.name}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.gray }}>x{item.quantity}</Text>
                  <Text style={{ fontWeight: '700', color: colors.primary }}>
                    ${(item.product?.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Shipping Address */}
        <View style={{ backgroundColor: colors.white, padding: spacing.lg, marginBottom: spacing.md }}>
          <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: spacing.md }}>
            Dirección de Entrega
          </Text>
          <Text style={{ marginBottom: spacing.xs }}>
            {order.address?.street}
          </Text>
          <Text style={{ marginBottom: spacing.xs }}>
            {order.address?.city}, {order.address?.state} {order.address?.zipCode}
          </Text>
          <Text>{order.address?.country}</Text>
        </View>

        {/* Order Summary */}
        <View style={{ backgroundColor: colors.white, padding: spacing.lg }}>
          <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: spacing.md }}>
            Resumen del Pedido
          </Text>
          <View style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text>Subtotal:</Text>
              <Text>${order.subtotal?.toFixed(2) || '0.00'}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text>Envío:</Text>
              <Text>${order.shipping?.toFixed(2) || '0.00'}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text>Impuestos:</Text>
              <Text>${order.tax?.toFixed(2) || '0.00'}</Text>
            </View>
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: colors.border,
                marginVertical: spacing.sm,
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>Total:</Text>
              <Text style={{ fontWeight: '700', color: colors.primary, fontSize: 16 }}>
                ${order.total?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={{ padding: spacing.lg }}>
        <Button onPress={() => router.back()} title="Atrás" size="lg" variant="secondary" />
      </View>
    </View>
  );
}
