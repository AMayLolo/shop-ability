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
    progress,
    insights,
  } = useAppContext();

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
          <Text style={styles.heroTitle}>Simple help for any shopping trip.</Text>
          <Text style={styles.heroBody}>
            Scan one item at a time. Check the total. Stay on budget.
          </Text>

          <View style={styles.heroStats}>
            <View style={[styles.heroStat, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
              <Text style={styles.heroStatLabel}>Budget</Text>
              <Text style={styles.heroStatValue}>{formatCurrency(budget)}</Text>
            </View>
            <View style={[styles.heroStat, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
              <Text style={styles.heroStatLabel}>Cart total</Text>
              <Text style={styles.heroStatValue}>{formatCurrency(total)}</Text>
            </View>
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Shopping budget</Text>
            <Text style={[styles.sectionCaption, { color: colors.icon }]}>Keep the trip simple</Text>
          </View>

          <Text style={[styles.inputLabel, { color: colors.icon }]}>Budget</Text>
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

          <View style={styles.progressBlock}>
            <View style={styles.progressLabels}>
              <Text style={[styles.progressTitle, { color: colors.text }]}>Used</Text>
              <Text style={[styles.progressValue, { color: progress > 0.9 ? colors.danger : colors.tintStrong }]}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.surfaceMuted }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.max(progress * 100, 6)}%`,
                    backgroundColor: progress > 0.9 ? colors.danger : colors.accent,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <MoneySummary label="Subtotal" value={formatCurrency(subtotal)} detail="Items before tax" />
            </View>
            <View style={styles.summaryItem}>
              <MoneySummary label="Tax" value={formatCurrency(tax)} detail="Estimated tax" />
            </View>
            <View style={styles.summaryItem}>
              <MoneySummary label="Left" value={formatCurrency(remaining)} detail="Budget left" tone="accent" />
            </View>
          </View>

          <BigButton
            label="Change budget"
            caption="Open budget screen"
            onPress={() => router.push('/enter-money')}
          />
          <BigButton
            label="Scan item"
            caption="Add one item"
            variant="secondary"
            onPress={() => router.push('/scan')}
          />
        </View>
        <View style={styles.summaryGrid}>
          {insights.map((insight, index) => (
            <View key={insight.id} style={styles.summaryItem}>
              <MoneySummary
                label={insight.label}
                value={insight.value}
                detail={insight.detail}
                tone={index === 0 ? 'accent' : 'neutral'}
              />
            </View>
          ))}
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
  heroStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  heroStat: {
    borderRadius: AppTheme.radius.md,
    flex: 1,
    gap: 6,
    padding: 16,
  },
  heroStatLabel: {
    color: '#D8C5B0',
    fontFamily: Fonts.sans,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  heroStatValue: {
    color: '#FFF8F1',
    fontFamily: Fonts.rounded,
    fontSize: 24,
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
  progressBlock: {
    gap: 10,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  progressValue: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  progressTrack: {
    borderRadius: AppTheme.radius.pill,
    height: 12,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: AppTheme.radius.pill,
    height: '100%',
  },
  summaryGrid: {
    gap: 14,
  },
  summaryItem: {
    width: '100%',
  },
});
