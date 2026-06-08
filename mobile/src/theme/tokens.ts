/**
 * Tasarım sistemi — Modern & Minimal.
 * Tek kaynak: renkler (açık/koyu), boşluk, yarıçap, tipografi, gölge.
 * Tüm bileşenler bu token'ları kullanır → tutarlı, profesyonel görünüm.
 */

export type ColorScheme = {
  // Yüzeyler
  bg: string;
  surface: string;
  surfaceAlt: string;
  elevated: string;
  border: string;
  borderStrong: string;
  // Metin
  text: string;
  textMuted: string;
  textFaint: string;
  // Marka / aksan
  primary: string;
  primaryPressed: string;
  onPrimary: string;
  primarySoft: string;
  // Sohbet
  userBubble: string;
  onUserBubble: string;
  assistantBubble: string;
  // Durum
  danger: string;
  success: string;
  warning: string;
  // Kod blokları
  codeBg: string;
  codeText: string;
  // Overlay
  overlay: string;
};

const light: ColorScheme = {
  bg: '#FFFFFF',
  surface: '#F6F7F9',
  surfaceAlt: '#EFF1F4',
  elevated: '#FFFFFF',
  border: '#E6E8EC',
  borderStrong: '#D5D9E0',
  text: '#0E1117',
  textMuted: '#5B6470',
  textFaint: '#9AA2AD',
  primary: '#6366F1',
  primaryPressed: '#4F46E5',
  onPrimary: '#FFFFFF',
  primarySoft: '#EEF0FE',
  userBubble: '#6366F1',
  onUserBubble: '#FFFFFF',
  assistantBubble: '#F2F3F7',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  codeBg: '#0E1117',
  codeText: '#E6EDF3',
  overlay: 'rgba(13,17,23,0.45)',
};

const dark: ColorScheme = {
  bg: '#0B0E14',
  surface: '#12161F',
  surfaceAlt: '#1A1F2A',
  elevated: '#161B25',
  border: '#242A36',
  borderStrong: '#323A48',
  text: '#E8EDF4',
  textMuted: '#9BA4B2',
  textFaint: '#5E6675',
  primary: '#818CF8',
  primaryPressed: '#6366F1',
  onPrimary: '#0B0E14',
  primarySoft: '#1E2236',
  userBubble: '#6366F1',
  onUserBubble: '#FFFFFF',
  assistantBubble: '#1A1F2A',
  danger: '#F87171',
  success: '#34D399',
  warning: '#FBBF24',
  codeBg: '#05070B',
  codeText: '#E6EDF3',
  overlay: 'rgba(0,0,0,0.6)',
};

export const palettes = { light, dark };

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  full: 999,
} as const;

export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
} as const;

export type AppTheme = {
  scheme: 'light' | 'dark';
  colors: ColorScheme;
  spacing: typeof spacing;
  radius: typeof radius;
  font: typeof font;
  fontSize: typeof fontSize;
};

export function buildTheme(scheme: 'light' | 'dark'): AppTheme {
  return {
    scheme,
    colors: palettes[scheme],
    spacing,
    radius,
    font,
    fontSize,
  };
}
