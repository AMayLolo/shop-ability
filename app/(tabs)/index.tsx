import { router } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import BigButton from '@/components/BigButton';
import MoneySummary from '@/components/MoneySummary';
import { AppTheme, Colors, Fonts } from '@/constants/theme';
import { useAppContext } from '@/context/AppContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency } from '@/utils/tax';

export default function DashboardScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const {
    budgetInput,
    setBudgetInput,
    budget,
    subtotal,
    tax,
    total,
    remaining,
  } = useAppContext();
  const canPay = remaining >= 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.hero,
            {
              backgroundColor: colors.hero,
              borderColor: colors.heroSecondary,
            },
            AppTheme.shadow.hero,
          ]}>
          <Text style={styles.eyebrow}>Shop Ability</Text>
          <Text style={styles.heroTitle}>Do I have enough money?</Text>
          <Text style={styles.heroBody}>
            Add items. See the total. Know what is left.
          </Text>
          <View
            style={[
              styles.answerCard,
              {
                backgroundColor: canPay ? 'rgba(122, 193, 155, 0.18)' : 'rgba(176, 74, 59, 0.2)',
                borderColor: canPay ? '#7AC19B' : '#E58E80',
              },
            ]}>
            <Text style={styles.answerLabel}>{canPay ? 'YES' : 'NO'}</Text>
            <Text style={styles.answerText}>
              {canPay ? 'You have enough right now.' : 'You do not have enough right now.'}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.panel,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            AppTheme.shadow.soft,
          ]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Money in the app</Text>
            <Text style={[styles.sectionCaption, { color: colors.icon }]}>From you or your guardian</Text>
          </View>

          <Text style={[styles.inputLabel, { color: colors.icon }]}>Money available</Text>
          <View style={[styles.inputShell, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}>
            <Text style={[styles.dollar, { color: colors.tintStrong }]}>$</Text>
            <TextInput
              keyboardType="decimal-pad"
              value={budgetInput}
              onChangeText={setBudgetInput}
              placeholder="120"
              placeholderTextColor={colors.icon}
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <MoneySummary label="I have" value={formatCurrency(budget)} detail="Money available" tone="accent" />
            </View>
            <View style={styles.summaryItem}>
              <MoneySummary label="Cart" value={formatCurrency(subtotal)} detail="Items before tax" />
            </View>
            <View style={styles.summaryItem}>
              <MoneySummary label="Tax" value={formatCurrency(tax)} detail="Estimated tax" />
            </View>
            <View style={styles.summaryItem}>
              <MoneySummary label="Left" value={formatCurrency(remaining)} detail="Money left" tone="accent" />
            </View>
          </View>

          <BigButton
            label="Change money"
            caption="Set the amount in the app"
            onPress={() => router.push('/enter-money')}
          />
          <BigButton
            label="Scan item"
            caption="Add one thing"
            variant="secondary"
            onPress={() => router.push('/scan')}
          />
          <BigButton
            label="Open cart"
            caption="See all items and total"
            variant="secondary"
            onPress={() => router.push('/explore')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    gap: 20,
    padding: 20,
    paddingBottom: 40,
    width: '100%',
    maxWidth: AppTheme.maxWidth,
  },
  hero: {
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    gap: 14,
    padding: 24,
  },
  eyebrow: {
    color: '#E6D5C3',
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#FFF8F1',
    fontFamily: Fonts.serif,
    fontSize: 34,
    lineHeight: 40,
  },
  heroBody: {
    color: '#E5D8CA',
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 520,
  },
  answerCard: {
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    gap: 6,
    marginTop: 8,
    padding: 18,
  },
  answerLabel: {
    color: '#FFF8F1',
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  answerText: {
    color: '#FFF8F1',
    fontFamily: Fonts.rounded,
    fontSize: 28,
    fontWeight: '700',
  },
  panel: {
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    gap: 18,
    padding: 20,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 24,
    fontWeight: '700',
  },
  sectionCaption: {
    fontFamily: Fonts.sans,
    fontSize: 14,
  },
  inputLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
  },
  inputShell: {
    alignItems: 'center',
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dollar: {
    fontSize: 24,
    fontWeight: '700',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.rounded,
    fontSize: 28,
    fontWeight: '700',
    padding: 0,
  },
  summaryGrid: {
    gap: 14,
  },
  summaryItem: {
    width: '100%',
  },
});
