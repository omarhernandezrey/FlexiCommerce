import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getPasswordStrength } from '../lib/validation';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const strength = getPasswordStrength(password);
  const colors = {
    weak: '#ef4444',
    medium: '#f59e0b',
    strong: '#10b981',
  };

  const labels = {
    weak: 'Débil',
    medium: 'Media',
    strong: 'Fuerte',
  };

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                backgroundColor:
                  (strength === 'weak' && i === 1) ||
                  (strength === 'medium' && i <= 2) ||
                  (strength === 'strong' && i <= 3)
                    ? colors[strength]
                    : '#e5e7eb',
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: colors[strength] }]}>
        Contraseña {labels[strength]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  barContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
