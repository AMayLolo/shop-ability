import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppTheme, Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type BigButtonProps = {
  label: string;
  caption?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
};

export default function BigButton({
  label,
  caption,
  onPress,
  variant = 'primary',
}: BigButtonProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const secondary = variant === 'secondary';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: secondary ? colors.surface : colors.tintStrong,
          borderColor: secondary ? colors.border : colors.tintStrong,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
        secondary ? AppTheme.shadow.soft : AppTheme.shadow.hero,
      ]}>
      <View style={styles.copy}>
        <Text
          style={[
            styles.label,
            { color: secondary ? colors.text : '#FFF8F1' },
          ]}>
          {label}
        </Text>
        {caption ? (
          <Text
            style={[
              styles.caption,
              { color: secondary ? colors.icon : '#F5D6BF' },
            ]}>
            {caption}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.arrow, { color: secondary ? colors.tintStrong : '#FFF8F1' }]}>→</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    fontWeight: '700',
  },
  caption: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  arrow: {
    fontSize: 24,
    marginLeft: 12,
  },
});
