import { Platform } from 'react-native';

const ink = '#14213D';

export const Colors = {
  light: {
    text: ink,
    background: '#F4EFE8',
    surface: '#FFFDFC',
    surfaceMuted: '#EEE5D7',
    tint: '#B87444',
    tintStrong: '#8F4F26',
    accent: '#2D6A4F',
    accentSoft: '#D9E7D8',
    icon: '#7B6A58',
    border: '#E5D8C7',
    tabIconDefault: '#9B866E',
    tabIconSelected: '#8F4F26',
    hero: '#1F2A44',
    heroSecondary: '#B87444',
    danger: '#B04A3B',
  },
  dark: {
    text: '#F6EFE6',
    background: '#151515',
    surface: '#1D1B19',
    surfaceMuted: '#2A2521',
    tint: '#E2A065',
    tintStrong: '#F4C086',
    accent: '#7AC19B',
    accentSoft: '#24372E',
    icon: '#C6B7A7',
    border: '#3A322C',
    tabIconDefault: '#9E8E7E',
    tabIconSelected: '#F4C086',
    hero: '#201C19',
    heroSecondary: '#6A8D73',
    danger: '#E58E80',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'Avenir Next',
    serif: 'Georgia',
    rounded: 'Avenir Next Rounded',
    mono: 'Menlo',
  },
  android: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif-medium',
    mono: 'monospace',
  },
  default: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
  web: {
    sans: "'Avenir Next', 'Segoe UI', sans-serif",
    serif: "Iowan Old Style, Georgia, serif",
    rounded: "'Avenir Next', 'Segoe UI', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});

export const AppTheme = {
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 12,
    md: 18,
    lg: 28,
    pill: 999,
  },
  shadow: {
    soft: {
      shadowColor: '#2C2118',
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 4,
    },
    hero: {
      shadowColor: '#0F172A',
      shadowOpacity: 0.18,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 16 },
      elevation: 8,
    },
  },
  maxWidth: 1080,
  copy: {
    appName: 'Shop Ability',
    tagline: 'Plan a smarter store run with confidence before you hit the aisle.',
  },
};

export type AppColorTheme = keyof typeof Colors;
