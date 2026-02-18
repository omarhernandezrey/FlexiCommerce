import { View, ScrollView, Pressable, Image, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCompare } from '../../hooks/useCompare';
import Text from '../../components/Text';
import Button from '../../components/Button';
import { colors, spacing, borderRadius } from '../../styles/theme';

export default function CompareScreen() {
  const router = useRouter();
  const { products, loading, removeProduct, clearCompare } = useCompare();

  const specs = [
    { key: 'price', label: 'Precio' },
    { key: 'avgRating', label: 'Calificación' },
    { key: 'reviewCount', label: 'Reseñas' },
    { key: 'category', label: 'Categoría' },
  ];

  const renderSpec = (specKey: string, product: any) => {
    if (specKey === 'price') {
      return `$${product.price?.toFixed(2)}`;
    }
    if (specKey === 'avgRating') {
      return `${product.avgRating?.toFixed(1) || '0'}/5`;
    }
    if (specKey === 'reviewCount') {
      return `${product.reviewCount || 0} reseñas`;
    }
    if (specKey === 'category') {
      return product.category?.name || 'N/A';
    }
    return 'N/A';
  };

  if (products.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg, backgroundColor: colors.background }}>
        <Ionicons name="git-compare-outline" size={64} color={colors.gray} />
        <Text style={{ fontSize: 18, fontWeight: '700', marginTop: spacing.lg, textAlign: 'center' }}>
          Sin Productos para Comparar
        </Text>
        <Text style={{ fontSize: 14, color: colors.gray, marginTop: spacing.md, textAlign: 'center' }}>
          Agrega productos desde el detalle para compararlos
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
      <ScrollView
        horizontal
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.lg }}
      >
        {/* Spec Labels */}
        <View style={{ marginRight: spacing.lg }}>
          <View style={{ height: 60, justifyContent: 'flex-end', marginBottom: spacing.md }}>
            <Text style={{ fontSize: 14, fontWeight: '700' }}>Especificaciones</Text>
          </View>
          {specs.map((spec) => (
            <View
              key={spec.key}
              style={{
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                minHeight: 50,
                justifyContent: 'center',
                backgroundColor: colors.lightGray,
                borderRadius: borderRadius.sm,
                marginBottom: spacing.xs,
              }}
            >
              <Text style={{ fontWeight: '600', fontSize: 12 }}>{spec.label}</Text>
            </View>
          ))}
        </View>

        {/* Products */}
        {products.map((item, index) => (
          <View key={item.id} style={{ marginRight: index < products.length - 1 ? spacing.md : 0 }}>
            {/* Product Card Header */}
            <Pressable
              onPress={() => router.push(`/(app)/products/${item.productId}`)}
              style={{
                width: 160,
                marginBottom: spacing.md,
                position: 'relative',
              }}
            >
              <Image
                source={{ uri: item.product.image }}
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.lightGray,
                  marginBottom: spacing.sm,
                }}
              />
              <Text style={{ fontWeight: '700', fontSize: 13 }} numberOfLines={2}>
                {item.product.name}
              </Text>

              {/* Remove Button */}
              <Pressable
                onPress={() => removeProduct(item.productId)}
                style={{
                  position: 'absolute',
                  top: spacing.sm,
                  right: spacing.sm,
                  backgroundColor: colors.white,
                  borderRadius: 20,
                  padding: spacing.xs,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Ionicons name="close" size={16} color={colors.text} />
              </Pressable>
            </Pressable>

            {/* Specs */}
            {specs.map((spec) => (
              <View
                key={spec.key}
                style={{
                  width: 160,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.sm,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  minHeight: 50,
                  justifyContent: 'center',
                  backgroundColor: index % 2 === 0 ? colors.white : colors.lightGray,
                  borderRadius: borderRadius.sm,
                  marginBottom: spacing.xs,
                }}
              >
                <Text style={{ fontSize: 12, textAlign: 'center' }}>
                  {renderSpec(spec.key, item.product)}
                </Text>
              </View>
            ))}

            {/* Action Button */}
            <Button
              onPress={() => router.push(`/(app)/products/${item.productId}`)}
              title="Ver Detalles"
              size="sm"
              style={{ marginTop: spacing.md }}
            />
          </View>
        ))}
      </ScrollView>

      {/* Action Bar */}
      <View style={{ padding: spacing.lg, gap: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}>
        <Button onPress={clearCompare} title="Limpiar Comparación" variant="secondary" size="lg" />
        <Button onPress={() => router.push('/(app)')} title="Volver al Inicio" size="lg" />
      </View>
    </View>
  );
}
