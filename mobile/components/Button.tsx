import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const buttonStyles = getStyles(variant, size);

  return (
    <TouchableOpacity
      style={[buttonStyles.button, disabled && buttonStyles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <Text style={buttonStyles.text}>{loading ? 'Loading...' : title}</Text>
    </TouchableOpacity>
  );
}

export default Button;

function getStyles(variant: string, size: string) {
  const baseButton: ViewStyle = {
    paddingVertical: size === 'sm' ? 8 : size === 'lg' ? 16 : 12,
    paddingHorizontal: size === 'sm' ? 12 : size === 'lg' ? 24 : 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const buttonStyles: Record<string, ViewStyle> = {
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

  const textColor: Record<string, string> = {
    primary: '#ffffff',
    secondary: '#1f2937',
    ghost: '#1f2937',
  };

  return StyleSheet.create({
    button: buttonStyles[variant] || baseButton,
    text: {
      color: textColor[variant],
      fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
      fontWeight: '600',
    },
    disabled: {
      opacity: 0.5,
    },
  });
}
