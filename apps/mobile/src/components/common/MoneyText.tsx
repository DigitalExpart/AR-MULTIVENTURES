import React from 'react';
import { Text, TextStyle } from 'react-native';
import { formatNaira } from '@ar-multiventures/business-logic';
import { Colors, Typography } from '../../theme';

export interface MoneyTextProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg' | 'display';
  color?: string;
  weight?: keyof typeof Typography.weights;
  style?: TextStyle;
}

export function MoneyText({
  amount,
  size = 'md',
  color = Colors.textPrimary,
  weight = 'bold',
  style,
}: MoneyTextProps) {
  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return Typography.sizes.bodySm;
      case 'md':
        return Typography.sizes.bodyLg;
      case 'lg':
        return Typography.sizes.headingSm;
      case 'display':
        return Typography.sizes.display;
    }
  };

  return (
    <Text
      style={[
        {
          fontSize: getFontSize(),
          fontWeight: Typography.weights[weight],
          color,
          fontFamily: 'System',
        },
        style,
      ]}
    >
      {formatNaira(amount || 0)}
    </Text>
  );
}

export interface QuantityTextProps {
  tonnes: number;
  tripsCount?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  style?: TextStyle;
}

export function QuantityText({
  tonnes,
  tripsCount,
  size = 'md',
  color = Colors.primaryDark,
  style,
}: QuantityTextProps) {
  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return Typography.sizes.caption;
      case 'md':
        return Typography.sizes.body;
      case 'lg':
        return Typography.sizes.subheading;
    }
  };

  return (
    <Text
      style={[
        {
          fontSize: getFontSize(),
          fontWeight: Typography.weights.bold,
          color,
        },
        style,
      ]}
    >
      {tonnes.toLocaleString()} Tonnes
      {tripsCount !== undefined && ` (${tripsCount} ${tripsCount === 1 ? 'Trip' : 'Trips'})`}
    </Text>
  );
}
