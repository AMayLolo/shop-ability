import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppTheme, Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type MoneySummaryProps = {
  label: string;
  value: string;
  detail: string;
  tone?: 'neutral' | 'accent';
};

export default function MoneySummary({
  label,
  value,
  detail,
  tone = 'neutral',
}: MoneySummaryProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const accent = tone === 'accent';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: accent ? colors.accentSoft : colors.surface,
          borderColor: accent ? colors.accent : colors.border,
        },
        AppTheme.shadow.soft,
      ]}>
      <Text style={[styles.label, { color: colors.icon }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.detail, { color: colors.icon }]}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    gap: 8,
    padding: 18,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  value: {
    fontFamily: Fonts.rounded,
    fontSize: 28,
    fontWeight: '700',
  },
  detail: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
  },
});
