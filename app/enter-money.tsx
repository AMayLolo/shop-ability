import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

import BigButton from '@/components/BigButton';
import { AppTheme, Colors, Fonts } from '@/constants/theme';
import { useAppContext } from '@/context/AppContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency } from '@/utils/tax';

const suggestedBudgets = ['20', '50', '100'];

export default function EnterMoneyScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { budgetInput, setBudgetInput, total, remaining } = useAppContext();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            AppTheme.shadow.soft,
          ]}>
          <Text style={[styles.kicker, { color: colors.tintStrong }]}>Money</Text>
          <Text style={[styles.title, { color: colors.text }]}>How much money is in the app?</Text>
          <Text style={[styles.body, { color: colors.icon }]}>
            Put in the amount from you or your guardian.
          </Text>

          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}>
            <Text style={[styles.currencyMark, { color: colors.tintStrong }]}>$</Text>
            <TextInput
              keyboardType="decimal-pad"
              value={budgetInput}
              onChangeText={setBudgetInput}
              placeholder="120"
              placeholderTextColor={colors.icon}
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          <View style={styles.presetRow}>
            {suggestedBudgets.map((value) => (
              <Text
                key={value}
                onPress={() => setBudgetInput(value)}
                style={[
                  styles.preset,
                  {
                    backgroundColor: budgetInput === value ? colors.tintStrong : colors.surfaceMuted,
                    borderColor: budgetInput === value ? colors.tintStrong : colors.border,
                    color: budgetInput === value ? '#FFF8F1' : colors.text,
                  },
                ]}>
                {formatCurrency(Number(value))}
              </Text>
            ))}
          </View>

          <View style={[styles.note, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.noteTitle, { color: colors.text }]}>Right now</Text>
            <Text style={[styles.noteBody, { color: colors.icon }]}>
              {remaining > 0
                ? `${formatCurrency(remaining)} would be left after the cart.`
                : `You need ${formatCurrency(Math.abs(remaining))} more for the cart.`}
            </Text>
          </View>
        </View>

        <BigButton
          label="Save money amount"
          caption="Go back"
          onPress={() => router.back()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: 20,
    padding: 20,
  },
  card: {
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    gap: 18,
    padding: 22,
  },
  kicker: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 30,
    lineHeight: 36,
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  inputWrap: {
    alignItems: 'center',
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  currencyMark: {
    fontSize: 26,
    fontWeight: '700',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.rounded,
    fontSize: 30,
    fontWeight: '700',
    padding: 0,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 10,
  },
  preset: {
    borderRadius: AppTheme.radius.pill,
    borderWidth: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  note: {
    borderRadius: AppTheme.radius.md,
    gap: 6,
    padding: 16,
  },
  noteTitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  noteBody: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
});
