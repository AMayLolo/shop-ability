import React, { type ReactNode } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, type ViewStyle } from 'react-native';

import { AppTheme, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type AppScreenProps = {
  children: ReactNode;
  contentStyle?: ViewStyle;
};

export default function AppScreen({ children, contentStyle }: AppScreenProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, contentStyle]}
        showsVerticalScrollIndicator={false}>
        {children}
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
    gap: AppTheme.spacing.md,
    maxWidth: AppTheme.maxWidth,
    padding: AppTheme.spacing.md,
    paddingBottom: AppTheme.spacing.xl,
    width: '100%',
  },
});
