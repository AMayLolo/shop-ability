import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import MoneySummary from '@/components/MoneySummary';
import { AppTheme, Colors, Fonts } from '@/constants/theme';
import { useAppContext } from '@/context/AppContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency } from '@/utils/tax';

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
          <Text style={[styles.headerKicker, { color: colors.tintStrong }]}>Cart</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{shoppingMode}</Text>
          <Text style={[styles.headerBody, { color: colors.icon }]}>
            See your items and your total.
          </Text>
        </View>

        <View style={styles.summaryGrid}>
          <MoneySummary label="Subtotal" value={formatCurrency(subtotal)} detail="Items before tax" />
          <MoneySummary label="Tax" value={formatCurrency(tax)} detail="Estimated tax" />
          <MoneySummary label="Total" value={formatCurrency(total)} detail="What you may pay" tone="accent" />
          <MoneySummary label="Left" value={formatCurrency(remaining)} detail="Budget left" />
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Scanned items</Text>
            {scannedItems.slice(-3).reverse().map((item) => (
              <View key={item.id} style={[styles.lineItem, { borderBottomColor: colors.border }]}>
                <View style={styles.lineItemCopy}>
                  <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.itemMeta, { color: colors.icon }]}>
                    From scanner · {item.category}
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>All items</Text>
          {cartItems.map((item) => (
            <View key={item.id} style={[styles.lineItem, { borderBottomColor: colors.border }]}>
              <View style={styles.lineItemCopy}>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.itemMeta, { color: colors.icon }]}>
                  {item.quantity} x {item.category}
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
              <Text style={[styles.totalStrong, { color: colors.text }]}>Total</Text>
              <Text style={[styles.totalStrong, { color: colors.tintStrong }]}>{formatCurrency(total)}</Text>
            </View>
            <View style={styles.totalLine}>
              <Text style={[styles.totalLabel, { color: colors.icon }]}>Left to spend</Text>
              <Text style={[styles.totalValue, { color: colors.accent }]}>{formatCurrency(remaining)}</Text>
            </View>
          </View>
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
});
