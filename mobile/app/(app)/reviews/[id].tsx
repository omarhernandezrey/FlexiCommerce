import { View, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { productService, reviewService } from '../../../lib/services';
import { useAuthStore } from '../../../store/auth';
import Text from '../../../components/Text';
import TextInput from '../../../components/TextInput';
import Button from '../../../components/Button';
import { colors, spacing, borderRadius } from '../../../styles/theme';

export default function ReviewScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await productService.getProduct(id as string);
        setProduct(response.data);
      } catch (err) {
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const handleSubmit = async () => {
    if (!title.trim() || !comment.trim()) {
      Alert.alert('Error', 'Por favor completa título y comentario');
      return;
    }

    try {
      setSubmitting(true);
      await reviewService.createReview({
        productId: id as string,
        rating,
        title,
        comment,
      });
      Alert.alert('Éxito', 'Tu reseña ha sido publicada');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al publicar la reseña');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!product || !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, paddingHorizontal: spacing.lg }}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
        <Text style={{ marginTop: spacing.md, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
          Producto no encontrado
        </Text>
        <Button onPress={() => router.back()} title="Atrás" size="lg" style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl * 2 }}>
        {/* Header */}
        <View style={{ backgroundColor: colors.white, padding: spacing.lg, marginBottom: spacing.md }}>
          <Pressable onPress={() => router.back()} style={{ marginBottom: spacing.md }}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: spacing.sm }}>
            Escribir Reseña
          </Text>
          <Text style={{ fontSize: 14, color: colors.gray }}>
            {product.name}
          </Text>
        </View>

        {/* Rating Selector */}
        <View style={{ backgroundColor: colors.white, padding: spacing.lg, marginBottom: spacing.md }}>
          <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: spacing.md }}>
            ¿Qué calificación das?
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => setRating(star)}
                style={{
                  padding: spacing.md,
                  alignItems: 'center',
                }}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={32}
                  color={star <= rating ? '#FFC107' : colors.gray}
                />
                <Text style={{ fontSize: 12, marginTop: spacing.xs, color: colors.gray }}>
                  {star}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={{ textAlign: 'center', marginTop: spacing.md, color: colors.gray }}>
            Puntuación: {rating}/5
          </Text>
        </View>

        {/* Review Form */}
        <View style={{ backgroundColor: colors.white, padding: spacing.lg, marginBottom: spacing.md }}>
          <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: spacing.md }}>
            Detalles de tu Reseña
          </Text>

          <TextInput
            label="Título"
            placeholder="Resumen de tu experiencia"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          <Text style={{ fontSize: 12, color: colors.gray, marginTop: spacing.sm, marginBottom: spacing.md }}>
            {title.length}/100
          </Text>

          <TextInput
            label="Comentario"
            placeholder="Cuéntanos tu experiencia con este producto..."
            value={comment}
            onChangeText={setComment}
            maxLength={500}
            multiline
            style={{ minHeight: 120, paddingTop: spacing.md }}
          />

          <Text style={{ fontSize: 12, color: colors.gray, marginTop: spacing.sm }}>
            {comment.length}/500
          </Text>
        </View>

        {/* Tips */}
        <View style={{ backgroundColor: colors.lightGray, padding: spacing.lg, marginBottom: spacing.lg }}>
          <Text style={{ fontSize: 14, fontWeight: '700', marginBottom: spacing.md }}>
            Consejos para una buena reseña:
          </Text>
          <View style={{ gap: spacing.sm }}>
            <Text style={{ fontSize: 13, color: colors.gray }}>
              • Sé honesto y detallado
            </Text>
            <Text style={{ fontSize: 13, color: colors.gray }}>
              • Menciona aspectos positivos y negativos
            </Text>
            <Text style={{ fontSize: 13, color: colors.gray }}>
              • Evita lenguaje ofensivo
            </Text>
            <Text style={{ fontSize: 13, color: colors.gray }}>
              • Mantén el comentario relevante al producto
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <Button
          onPress={handleSubmit}
          title={submitting ? 'Publicando...' : 'Publicar Reseña'}
          size="lg"
          loading={submitting}
          disabled={submitting}
        />
        <Button onPress={() => router.back()} title="Cancelar" variant="secondary" size="lg" />
      </View>
    </View>
  );
}
      await reviewService.createReview({
        productId: id as string,
        rating,
        comment: newReview,
      });

      Alert.alert('Éxito', 'Tu comentario ha sido publicado');
      setNewReview('');
      setRating(5);

      // Reload reviews
      const response = await reviewService.getReviews(id as string);
      setReviews(response.data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo publicar el comentario');
    } finally {
      setSubmitting(false);
    }
  };

  const renderReview = ({ item }: { item: any }) => (
    <View
      style={{
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs }}>
        <View>
          <Text style={{ fontWeight: '700', marginBottom: spacing.xs }}>{item.user?.name}</Text>
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            {Array.from({ length: item.rating }).map((_, i) => (
              <Ionicons key={i} name="star" size={14} color="#FFC107" />
            ))}
            {Array.from({ length: 5 - item.rating }).map((_, i) => (
              <Ionicons key={i} name="star-outline" size={14} color={colors.gray} />
            ))}
          </View>
        </View>
        <Text style={{ color: colors.gray, fontSize: 12 }}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={{ color: colors.gray }}>
        {item.comment}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg }}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: spacing.md }}>
              Comentarios ({reviews.length})
            </Text>

            {/* Write Review Section */}
            {user && (
              <View
                style={{
                  backgroundColor: colors.white,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                  marginBottom: spacing.lg,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontWeight: '700', marginBottom: spacing.md }}>Tu Comentario</Text>

                {/* Rating Selector */}
                <View style={{ marginBottom: spacing.md }}>
                  <Text style={{ fontSize: 12, color: colors.gray, marginBottom: spacing.sm }}>
                    Calificación
                  </Text>
                  <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                    {[1, 2, 3, 4, 5].map((r) => (
                      <Pressable
                        key={r}
                        onPress={() => setRating(r)}
                        style={{ padding: spacing.sm }}
                      >
                        <Ionicons
                          name={rating >= r ? 'star' : 'star-outline'}
                          size={28}
                          color={rating >= r ? '#FFC107' : colors.gray}
                        />
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Comment Input */}
                <RNTextInput
                  placeholder="Comparte tu experiencia..."
                  placeholderTextColor={colors.gray}
                  value={newReview}
                  onChangeText={setNewReview}
                  multiline
                  numberOfLines={4}
                  style={{
                    backgroundColor: colors.lightGray,
                    borderRadius: borderRadius.md,
                    padding: spacing.md,
                    color: colors.text,
                    marginBottom: spacing.md,
                    textAlignVertical: 'top',
                  }}
                />

                {/* Submit Button */}
                <Button
                  onPress={handleSubmitReview}
                  title="Publicar Comentario"
                  loading={submitting}
                  disabled={submitting}
                  size="md"
                />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
              <Ionicons name="chatbubble-outline" size={48} color={colors.gray} />
              <Text style={{ marginTop: spacing.md, color: colors.gray }}>
                Sin comentarios aún
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
