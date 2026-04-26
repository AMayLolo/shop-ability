import { Platform } from 'react-native';

const ink = '#2C1B12';

export const Colors = {
  light: {
    text: ink,
    background: '#F6E7C8',
    surface: '#FFF7E7',
    surfaceMuted: '#EBCB9A',
    tint: '#D46A4C',
    tintStrong: '#A9472A',
    accent: '#3F6B5B',
    accentSoft: '#D7E1B5',
    icon: '#7B5B43',
    border: '#D3A56D',
    tabIconDefault: '#9D6F4C',
    tabIconSelected: '#A9472A',
    hero: '#2F3E6B',
    heroSecondary: '#F1B24A',
    danger: '#B84B3E',
  },
  dark: {
    text: '#F8E9CC',
    background: '#24160F',
    surface: '#382117',
    surfaceMuted: '#563325',
    tint: '#F08A5D',
    tintStrong: '#FFC15C',
    accent: '#87A878',
    accentSoft: '#334536',
    icon: '#D7B48E',
    border: '#7A5237',
    tabIconDefault: '#B88963',
    tabIconSelected: '#FFC15C',
    hero: '#23345D',
    heroSecondary: '#D46A4C',
    danger: '#E76F51',
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
