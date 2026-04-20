import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import MoneySummary from '@/components/MoneySummary';
import { AppTheme, Colors, Fonts } from '@/constants/theme';
import { useAppContext } from '@/context/AppContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency } from '@/utils/tax';

const categoryNotes = [
  {
    title: 'Protein anchors the basket',
    body: 'Higher-value staples are still controlled, which keeps the trip useful without feeling stripped down.',
  },
  {
    title: 'Nice-to-haves stay visible',
    body: 'Premium extras are separated mentally from essentials, making cuts easier when prices move.',
  },
  {
    title: 'Tax is already accounted for',
    body: 'Seeing the full checkout estimate reduces last-minute surprises at the register.',
  },
];

export default function InsightsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { cartItems, subtotal, tax, total, remaining, insights, shoppingMode } = useAppContext();
  const scannedItems = cartItems.filter((item) => item.source === 'scanner');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.headerCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            AppTheme.shadow.soft,
          ]}>
          <Text style={[styles.headerKicker, { color: colors.tintStrong }]}>Trip profile</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{shoppingMode}</Text>
          <Text style={[styles.headerBody, { color: colors.icon }]}>
            A polished summary of where the trip stands right now, so you can see what is driving
            the spend at a glance.
          </Text>
        </View>

        <View style={styles.summaryGrid}>
          {insights.map((insight, index) => (
            <MoneySummary
              key={insight.id}
              label={insight.label}
              value={insight.value}
              detail={insight.detail}
              tone={index === 2 ? 'accent' : 'neutral'}
            />
          ))}
        </View>

        {scannedItems.length ? (
          <View
            style={[
              styles.breakdown,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              AppTheme.shadow.soft,
            ]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recently scanned</Text>
            {scannedItems.slice(-3).reverse().map((item) => (
              <View key={item.id} style={[styles.lineItem, { borderBottomColor: colors.border }]}>
                <View style={styles.lineItemCopy}>
                  <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.itemMeta, { color: colors.icon }]}>
                    Added from scanner · {item.category}
                  </Text>
                </View>
                <Text style={[styles.itemPrice, { color: colors.text }]}>{formatCurrency(item.price)}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View
          style={[
            styles.breakdown,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            AppTheme.shadow.soft,
          ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Cart composition</Text>
          {cartItems.map((item) => (
            <View key={item.id} style={[styles.lineItem, { borderBottomColor: colors.border }]}>
              <View style={styles.lineItemCopy}>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.itemMeta, { color: colors.icon }]}>
                  {item.category} · {item.priority === 'core' ? 'Essential' : 'Flexible'}
                </Text>
              </View>
              <Text style={[styles.itemPrice, { color: colors.text }]}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          ))}

          <View style={styles.totals}>
            <View style={styles.totalLine}>
              <Text style={[styles.totalLabel, { color: colors.icon }]}>Subtotal</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.totalLine}>
              <Text style={[styles.totalLabel, { color: colors.icon }]}>Estimated tax</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>{formatCurrency(tax)}</Text>
            </View>
            <View style={styles.totalLine}>
              <Text style={[styles.totalStrong, { color: colors.text }]}>Projected total</Text>
              <Text style={[styles.totalStrong, { color: colors.tintStrong }]}>{formatCurrency(total)}</Text>
            </View>
            <View style={styles.totalLine}>
              <Text style={[styles.totalLabel, { color: colors.icon }]}>Remaining room</Text>
              <Text style={[styles.totalValue, { color: colors.accent }]}>{formatCurrency(remaining)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.noteStack}>
          {categoryNotes.map((note) => (
            <View
              key={note.title}
              style={[
                styles.noteCard,
                {
                  backgroundColor: colors.surfaceMuted,
                  borderColor: colors.border,
                },
              ]}>
              <Text style={[styles.noteTitle, { color: colors.text }]}>{note.title}</Text>
              <Text style={[styles.noteBody, { color: colors.icon }]}>{note.body}</Text>
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
    gap: 18,
    padding: 20,
    paddingBottom: 40,
  },
  headerCard: {
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    gap: 10,
    padding: 22,
  },
  headerKicker: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontFamily: Fonts.serif,
    fontSize: 32,
    lineHeight: 38,
  },
  headerBody: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  summaryGrid: {
    gap: 12,
  },
  breakdown: {
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    gap: 12,
    padding: 20,
  },
  sectionTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  lineItem: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  lineItemCopy: {
    flex: 1,
    gap: 4,
    paddingRight: 12,
  },
  itemName: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '700',
  },
  itemMeta: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    textTransform: 'capitalize',
  },
  itemPrice: {
    fontFamily: Fonts.rounded,
    fontSize: 18,
    fontWeight: '700',
  },
  totals: {
    gap: 10,
    paddingTop: 10,
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontFamily: Fonts.sans,
    fontSize: 14,
  },
  totalValue: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  totalStrong: {
    fontFamily: Fonts.rounded,
    fontSize: 18,
    fontWeight: '700',
  },
  noteStack: {
    gap: 12,
  },
  noteCard: {
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    gap: 6,
    padding: 18,
  },
  noteTitle: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '700',
  },
  noteBody: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
});
