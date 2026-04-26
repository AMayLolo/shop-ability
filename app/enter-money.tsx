import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import AppScreen from '@/components/AppScreen';
import BigButton from '@/components/BigButton';
import SectionCard from '@/components/SectionCard';
import { AppTheme, Colors, Fonts } from '@/constants/theme';
import { useAppContext } from '@/context/AppContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency } from '@/utils/tax';

const suggestedBudgets = ['20', '50', '100'];

export default function EnterMoneyScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { budgetInput, setBudgetInput, remaining } = useAppContext();

  return (
    <AppScreen contentStyle={styles.content}>
      <SectionCard
        kicker="Budget"
        title="Set the money in the app"
        body="Choose a quick amount or type the exact number you want to shop with.">

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
      </SectionCard>

      <BigButton
        label="Save budget"
        caption="Go back"
        onPress={() => router.back()}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
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
