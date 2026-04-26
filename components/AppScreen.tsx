import React, { type ReactNode } from 'react';
import { ScrollView, StyleSheet, type ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppTheme, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type AppScreenProps = {
  children: ReactNode;
  contentStyle?: ViewStyle;
};

export default function AppScreen({ children, contentStyle }: AppScreenProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(AppTheme.spacing.md, insets.top + AppTheme.spacing.xs),
            paddingBottom: Math.max(AppTheme.spacing.xl, insets.bottom + 96),
          },
          contentStyle,
        ]}
        contentInsetAdjustmentBehavior="always"
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
    width: '100%',
  },
});
