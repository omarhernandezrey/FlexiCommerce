import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}

export function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
}: ButtonProps) {
  const styles = getStyles(variant, size);

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <Text style={styles.text}>{loading ? 'Loading...' : title}</Text>
    </TouchableOpacity>
  );
}

function getStyles(variant: string, size: string) {
  const baseButton = {
    paddingVertical: size === 'sm' ? 8 : size === 'lg' ? 16 : 12,
    paddingHorizontal: size === 'sm' ? 12 : size === 'lg' ? 24 : 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const buttonStyles = {
    primary: {
      ...baseButton,
      backgroundColor: '#2563eb',
    },
    secondary: {
      ...baseButton,
      backgroundColor: '#e5e7eb',
    },
    ghost: {
      ...baseButton,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#e5e7eb',
    },
  };

  const textColor = {
    primary: '#ffffff',
    secondary: '#1f2937',
    ghost: '#1f2937',
  };

  return StyleSheet.create({
    button: buttonStyles[variant as keyof typeof buttonStyles] || baseButton,
    text: {
      color: textColor[variant as keyof typeof textColor],
      fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
      fontWeight: '600',
    },
    disabled: {
      opacity: 0.5,
    },
  });
}
