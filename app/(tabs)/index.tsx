import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AppScreen from '@/components/AppScreen';
import BigButton from '@/components/BigButton';
import MoneySummary from '@/components/MoneySummary';
import SectionCard from '@/components/SectionCard';
import { AppTheme, Colors, Fonts } from '@/constants/theme';
import { useAppContext } from '@/context/AppContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency } from '@/utils/tax';

export default function DashboardScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { budget, cartItems, startNewTrip, subtotal, total } = useAppContext();
  const itemCount = cartItems.filter((item) => item.enabled).reduce((sum, item) => sum + item.quantity, 0);

  const handleStartTrip = () => {
    startNewTrip();
    router.push('/scan');
  };

  return (
    <AppScreen contentStyle={styles.content}>
      <SectionCard
        kicker="Shop Ability"
        title="Shop Ability"
        body="Check your current trip at a glance, then jump right back into shopping."
        tone="hero"
      />

      <SectionCard
        kicker="Current Trip"
        title="This shopping trip"
        body="Your active cart totals update automatically as you add or remove items.">
        <View style={styles.tripSummary}>
          <View
            style={[
              styles.tripRow,
              {
                borderBottomColor: colors.border,
              },
            ]}>
            <Text style={[styles.tripLabel, { color: colors.icon }]}>Items</Text>
            <Text style={[styles.tripValue, { color: colors.text }]}>{itemCount}</Text>
          </View>
          <View
            style={[
              styles.tripRow,
              {
                borderBottomColor: colors.border,
              },
            ]}>
            <Text style={[styles.tripLabel, { color: colors.icon }]}>Subtotal</Text>
            <Text style={[styles.tripValue, { color: colors.text }]}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.tripRow}>
            <Text style={[styles.tripLabel, { color: colors.icon }]}>Total (with tax)</Text>
            <Text style={[styles.tripValue, { color: colors.text }]}>{formatCurrency(total)}</Text>
          </View>
        </View>
      </SectionCard>

      <BigButton
        label="Resume Shopping"
        caption="Return to your current trip"
        onPress={() => router.push('/explore')}
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
          detail="Tap to edit the amount for this trip"
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

      <BigButton
        label="Start new shopping trip"
        caption="Clear the current cart and open the scanner"
        variant="secondary"
        onPress={handleStartTrip}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  budgetTile: {
    position: 'relative',
  },
  tripSummary: {
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    marginTop: 4,
    overflow: 'hidden',
  },
  tripRow: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  tripLabel: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '600',
  },
  tripValue: {
    fontFamily: Fonts.rounded,
    fontSize: 22,
    fontWeight: '700',
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
