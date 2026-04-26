import React, { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppTheme, Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type SectionCardProps = {
  children?: ReactNode;
  kicker?: string;
  title?: string;
  body?: string;
  tone?: 'default' | 'accent' | 'hero';
};

export default function SectionCard({
  children,
  kicker,
  title,
  body,
  tone = 'default',
}: SectionCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isHero = tone === 'hero';
  const isAccent = tone === 'accent';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isHero ? colors.hero : isAccent ? colors.accentSoft : colors.surface,
          borderColor: isHero ? colors.heroSecondary : isAccent ? colors.accent : colors.border,
        },
        isHero ? AppTheme.shadow.hero : AppTheme.shadow.soft,
      ]}>
      {kicker ? (
        <Text style={[styles.kicker, { color: isHero ? '#E6D5C3' : colors.tintStrong }]}>{kicker}</Text>
      ) : null}
      {title ? (
        <Text style={[styles.title, { color: isHero ? '#FFF8F1' : colors.text }]}>{title}</Text>
      ) : null}
      {body ? (
        <Text style={[styles.body, { color: isHero ? '#E5D8CA' : colors.icon }]}>{body}</Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    gap: 12,
    padding: 20,
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
    fontSize: 14,
    lineHeight: 21,
  },
});
