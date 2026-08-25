/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    textSecondary: '#60646C',
    textTertiary: '#8A8E96',
    background: '#fff9ed',
    backgroundElement: '#ffffff',
    backgroundSelected: '#E0E1E6',
    border: '#E2E3E7',
    accent: '#3D5AFE',

    // verdict colors — background is a tint for badges/cards, text is the readable-on-tint version
    goodDeal: '#1C8A4B',
    goodDealBg: '#a5f0c2',
    fair: '#8A7A00',
    fairBg: '#f8e48d',
    overpriced: '#C24A1F',
    overpricedBg: '#ffbd8e',
    suspicious: '#B0202E',
    suspiciousBg: '#fe8a8a',
  },
  dark: {
    text: '#ffffff',
    textSecondary: '#B0B4BA',
    textTertiary: '#7E838B',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    border: '#2C2E33',
    accent: '#5C7CFF',

    goodDeal: '#4ADE80',
    goodDealBg: '#16281F',
    fair: '#E8D255',
    fairBg: '#2B2712',
    overpriced: '#FF8A5C',
    overpricedBg: '#2E1D14',
    suspicious: '#FF6B7A',
    suspiciousBg: '#2E1418',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
