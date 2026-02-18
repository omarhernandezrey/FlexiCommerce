import { View, FlatList, Pressable, TextInput as RNTextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/auth';
import { reviewService } from '../../../lib/services';
import { useEffect, useState } from 'react';
import Text from '../../../components/Text';
import Button from '../../../components/Button';
import TextInput from '../../../components/TextInput';
import { colors, spacing, borderRadius } from '../../../styles/theme';

export default function ReviewsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadReviews = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await reviewService.getReviews(id as string);
        setReviews(response.data);
      } catch (err) {
        console.error('Error loading reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, [id]);

  const handleSubmitReview = async () => {
    if (!newReview.trim()) {
      Alert.alert('Error', 'Por favor escribe un comentario');
      return;
    }

    if (!user) {
      Alert.alert('Debes iniciar sesión', 'Inicia sesión para dejar un comentario');
      return;
    }

    try {
      setSubmitting(true);
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
