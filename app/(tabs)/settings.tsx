import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AppScreen from '@/components/AppScreen';
import MoneySummary from '@/components/MoneySummary';
import SectionCard from '@/components/SectionCard';
import { AppTheme, Colors, Fonts } from '@/constants/theme';
import { useAppContext } from '@/context/AppContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency } from '@/utils/tax';

export default function SettingsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { budget } = useAppContext();

  return (
    <AppScreen contentStyle={styles.content}>
      <SectionCard
        kicker="Settings"
        title="App settings"
        body="Update your budget for this shopping trip."
      />

      <Pressable
        accessibilityRole="button"
        accessibilityHint="Opens the budget editor"
        onPress={() => router.push('/enter-money')}
        style={({ pressed }) => [
          styles.budgetTile,
          { opacity: pressed ? 0.96 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] },
        ]}>
        <MoneySummary
          label="Budget"
          value={formatCurrency(budget)}
          detail="Tap to edit the amount"
          tone="accent"
        />
        <View
          style={[
            styles.editBadge,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <Text style={[styles.editBadgeText, { color: colors.tintStrong }]}>Edit</Text>
        </View>
      </Pressable>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
  },
  budgetTile: {
    position: 'relative',
  },
  editBadge: {
    ...AppTheme.shadow.soft,
    borderRadius: AppTheme.radius.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    position: 'absolute',
    right: 14,
    top: 14,
  },
  editBadgeText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
