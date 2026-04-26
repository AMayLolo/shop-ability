import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import AppScreen from '@/components/AppScreen';
import MoneySummary from '@/components/MoneySummary';
import SectionCard from '@/components/SectionCard';
import { AppTheme, Colors, Fonts } from '@/constants/theme';
import { useAppContext } from '@/context/AppContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency } from '@/utils/tax';

export default function InsightsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { cartItems, subtotal, tax, total, remaining, budget, toggleCartItem } = useAppContext();
  const canPay = remaining >= 0;
  const enabledItems = cartItems.filter((item) => item.enabled).length;
  const parkedItems = cartItems.length - enabledItems;

  return (
    <AppScreen>
      <SectionCard
        kicker="Cart"
        title="Your active total"
        body={canPay ? 'Everything turned on still fits your budget.' : 'Turn items off to see what you can afford right now.'}
      />

        <View style={styles.summaryGrid}>
          <MoneySummary label="I have" value={formatCurrency(budget)} detail="Money available" />
          <MoneySummary label="Cart" value={formatCurrency(subtotal)} detail="Items turned on" />
          <MoneySummary label="Tax" value={formatCurrency(tax)} detail="Estimated tax" />
          <MoneySummary label="Total" value={formatCurrency(total)} detail="What I may pay" tone="accent" />
          <MoneySummary label="Left" value={formatCurrency(remaining)} detail="Money left" />
        </View>

        <SectionCard kicker="Items" title="Choose what counts">
          <Text style={[styles.sectionBody, { color: colors.icon }]}>
            Turn off items to see whether the rest of the cart still fits your budget.
          </Text>
          {parkedItems > 0 ? (
            <View style={[styles.parkedBanner, { backgroundColor: colors.accentSoft }]}>
              <Text style={[styles.parkedText, { color: colors.text }]}>
                {parkedItems} item{parkedItems === 1 ? '' : 's'} off. These are not included in the total.
              </Text>
            </View>
          ) : null}
          {cartItems.map((item) => (
            <View
              key={item.id}
              style={[
                styles.lineItem,
                {
                  borderBottomColor: colors.border,
                  opacity: item.enabled ? 1 : 0.5,
                },
              ]}>
              <View style={styles.lineItemCopy}>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.itemMeta, { color: colors.icon }]}>
                  {item.enabled ? 'Counting toward total' : 'Turned off for now'}
                </Text>
              </View>
              <View style={styles.lineItemControls}>
                <Text style={[styles.itemPrice, { color: colors.text }]}>
                  {formatCurrency(item.price * item.quantity)}
                </Text>
                <Switch
                  value={item.enabled}
                  onValueChange={() => toggleCartItem(item.id)}
                  trackColor={{ false: colors.border, true: colors.tintStrong }}
                  thumbColor="#FFF8F1"
                  ios_backgroundColor={colors.border}
                />
              </View>
            </View>
          ))}
        </SectionCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  summaryGrid: {
    gap: 12,
  },
  sectionBody: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 6,
  },
  parkedBanner: {
    borderRadius: AppTheme.radius.md,
    padding: 14,
  },
  parkedText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
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
  lineItemControls: {
    alignItems: 'flex-end',
    gap: 10,
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
});
