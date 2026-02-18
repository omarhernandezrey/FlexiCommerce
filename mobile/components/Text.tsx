import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { colors } from '../styles/theme';

interface CustomTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'small';
  color?: string;
  bold?: boolean;
  children?: React.ReactNode;
}

export default function Text({
  variant = 'body',
  color,
  bold,
  style,
  children,
  ...props
}: CustomTextProps) {
  return (
    <RNText
      style={[
        styles.base,
        styles[variant],
        bold && styles.bold,
        color ? { color } : undefined,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.text,
  },
  h1: {
    fontSize: 28,
    fontWeight: '700',
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
  },
  small: {
    fontSize: 12,
    fontWeight: '400',
  },
  bold: {
    fontWeight: '700',
  },
});
