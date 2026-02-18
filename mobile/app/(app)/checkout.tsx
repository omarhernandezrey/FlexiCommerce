import { View, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';
import { useCartStore } from '../../store/cart';
import { ordersService } from '../../lib/services';
import Text from '../../components/Text';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import { colors, spacing, borderRadius } from '../../styles/theme';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { cartItems, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'address' | 'payment' | 'confirmation'>('address');
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [payment, setPayment] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [orderData, setOrderData] = useState<any>(null);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    // Note: In production, fetch actual product price
    return sum + (item.quantity * 10);
  }, 0);
  const shipping = 5;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleAddressSubmit = () => {
    if (!address.street || !address.city || !address.state || !address.zipCode || !address.country) {
      Alert.alert('Error', 'Por favor completa todos los campos de dirección');
      return;
    }
    setStep('payment');
  };

  const handlePaymentSubmit = async () => {
    if (!payment.cardNumber || !payment.expiryDate || !payment.cvv) {
      Alert.alert('Error', 'Por favor completa todos los datos de pago');
      return;
    }

    try {
      setLoading(true);

      // Create order
      const response = await ordersService.createOrder({
        items: cartItems,
        address,
        paymentMethod: 'card',
        total,
      });

      setOrderData(response.data);
      setStep('confirmation');
      clearCart();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'confirmation' && orderData) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
        <Ionicons name="checkmark-circle" size={80} color={colors.primary} />
        <Text style={{ fontSize: 24, fontWeight: '700', marginTop: spacing.lg, textAlign: 'center' }}>
          ¡Compra Exitosa!
        </Text>
        <Text style={{ fontSize: 16, color: colors.gray, marginTop: spacing.md, textAlign: 'center' }}>
          Tu pedido #{orderData.id} ha sido confirmado
        </Text>
        <Text style={{ fontSize: 14, color: colors.gray, marginTop: spacing.md, textAlign: 'center' }}>
          Pronto recibirás un email de confirmación
        </Text>
        <Button
          onPress={() => {
            clearCart();
            router.push('/(app)');
          }}
          title="Volver al Inicio"
          size="lg"
          style={{ marginTop: spacing.lg }}
        />
        <Button
          onPress={() => router.push('/(app)/orders')}
          title="Ver mis Pedidos"
          variant="secondary"
          size="lg"
          style={{ marginTop: spacing.md }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl * 2 }}>
        {/* Progress Steps */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: step === 'address' || step === 'payment' || step === 'confirmation' ? colors.primary : colors.lightGray,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons
                name={step === 'address' || step === 'payment' || step === 'confirmation' ? 'checkmark' : 'home'}
                size={24}
                color={colors.white}
              />
            </View>
            <Text style={{ marginTop: spacing.xs, fontSize: 12, textAlign: 'center' }}>Dirección</Text>
          </View>

          <View
            style={{
              flex: 1,
              height: 2,
              backgroundColor: step === 'payment' || step === 'confirmation' ? colors.primary : colors.border,
            }}
          />

          <View style={{ alignItems: 'center', flex: 1 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: step === 'payment' || step === 'confirmation' ? colors.primary : colors.lightGray,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons
                name={step === 'payment' || step === 'confirmation' ? 'checkmark' : 'card'}
                size={24}
                color={colors.white}
              />
            </View>
            <Text style={{ marginTop: spacing.xs, fontSize: 12, textAlign: 'center' }}>Pago</Text>
          </View>
        </View>

        {/* Address Step */}
        {step === 'address' && (
          <View style={{ gap: spacing.md }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: spacing.md }}>Dirección de Entrega</Text>
            <TextInput
              placeholder="Calle"
              value={address.street}
              onChangeText={(val) => setAddress({ ...address, street: val })}
            />
            <TextInput
              placeholder="Ciudad"
              value={address.city}
              onChangeText={(val) => setAddress({ ...address, city: val })}
            />
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <TextInput
                placeholder="Estado"
                value={address.state}
                onChangeText={(val) => setAddress({ ...address, state: val })}
                style={{ flex: 1 }}
              />
              <TextInput
                placeholder="CP"
                value={address.zipCode}
                onChangeText={(val) => setAddress({ ...address, zipCode: val })}
                style={{ flex: 1 }}
              />
            </View>
            <TextInput
              placeholder="País"
              value={address.country}
              onChangeText={(val) => setAddress({ ...address, country: val })}
            />
          </View>
        )}

        {/* Payment Step */}
        {step === 'payment' && (
          <View style={{ gap: spacing.md }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: spacing.md }}>Información de Pago</Text>
            <TextInput
              placeholder="Número de tarjeta"
              value={payment.cardNumber}
              onChangeText={(val) => setPayment({ ...payment, cardNumber: val })}
              keyboardType="numeric"
              maxLength={16}
            />
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <TextInput
                placeholder="MM/AA"
                value={payment.expiryDate}
                onChangeText={(val) => setPayment({ ...payment, expiryDate: val })}
                style={{ flex: 1 }}
                maxLength={5}
              />
              <TextInput
                placeholder="CVV"
                value={payment.cvv}
                onChangeText={(val) => setPayment({ ...payment, cvv: val })}
                style={{ flex: 1 }}
                secureTextEntry
                maxLength={3}
              />
            </View>
          </View>
        )}

        {/* Order Summary */}
        <View
          style={{
            backgroundColor: colors.white,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            marginTop: spacing.lg,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: spacing.md }}>Resumen del Pedido</Text>
          <View style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text>Subtotal:</Text>
              <Text>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text>Envío:</Text>
              <Text>${shipping.toFixed(2)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text>Impuestos:</Text>
              <Text>${tax.toFixed(2)}</Text>
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
              <Text style={{ color: colors.primary, fontWeight: '700' }}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={{ padding: spacing.lg, gap: spacing.md, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border }}>
        {step === 'address' && (
          <>
            <Button onPress={handleAddressSubmit} title="Continuar al Pago" size="lg" />
            <Button onPress={() => router.back()} title="Volver" variant="secondary" size="lg" />
          </>
        )}
        {step === 'payment' && (
          <>
            <Button
              onPress={handlePaymentSubmit}
              title={loading ? 'Procesando...' : `Pagar $${total.toFixed(2)}`}
              size="lg"
              loading={loading}
              disabled={loading}
            />
            <Button onPress={() => setStep('address')} title="Atrás" variant="secondary" size="lg" />
          </>
        )}
      </View>
    </View>
  );
}
