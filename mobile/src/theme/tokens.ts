/**
 * Tasarım sistemi — Modern & Minimal, kart tabanlı (gerçek uygulama hissi).
 * Tek kaynak: renkler (açık/koyu), boşluk, yarıçap, tipografi, gölge.
 */
import { ViewStyle } from 'react-native';

export type ColorScheme = {
  // Yüzeyler
  bg: string; // sayfa zemini (hafif tonlu — kartlar üstünde "yüzsün")
  surface: string; // kart / panel (genelde beyaz)
  surfaceAlt: string; // ikincil yüzey (input, chip)
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
  accent: string;
  // Sohbet
  userBubble: string;
  onUserBubble: string;
  assistantBubble: string;
  // Durum
  danger: string;
  success: string;
  warning: string;
  // Kod
  codeBg: string;
  codeText: string;
  // Overlay / sekme
  overlay: string;
  tabBar: string;
};

const light: ColorScheme = {
  bg: '#F2F4F8',
  surface: '#FFFFFF',
  surfaceAlt: '#EDEFF4',
  elevated: '#FFFFFF',
  border: '#E7EAF0',
  borderStrong: '#D7DBE3',
  text: '#0E1117',
  textMuted: '#626B7A',
  textFaint: '#9AA2AD',
  primary: '#5B62F4',
  primaryPressed: '#474FE0',
  onPrimary: '#FFFFFF',
  primarySoft: '#ECEDFE',
  accent: '#7C5CFC',
  userBubble: '#5B62F4',
  onUserBubble: '#FFFFFF',
  assistantBubble: '#FFFFFF',
  danger: '#EF4444',
  success: '#12B886',
  warning: '#F59E0B',
  codeBg: '#0E1117',
  codeText: '#E6EDF3',
  overlay: 'rgba(13,17,23,0.45)',
  tabBar: '#FFFFFF',
};

const dark: ColorScheme = {
  bg: '#0A0D13',
  surface: '#131820',
  surfaceAlt: '#1C222C',
  elevated: '#161C25',
  border: '#232A35',
  borderStrong: '#323A48',
  text: '#E8EDF4',
  textMuted: '#98A2B2',
  textFaint: '#5E6675',
  primary: '#7B82FF',
  primaryPressed: '#5B62F4',
  onPrimary: '#0A0D13',
  primarySoft: '#1E2236',
  accent: '#9A7CFF',
  userBubble: '#5B62F4',
  onUserBubble: '#FFFFFF',
  assistantBubble: '#1A1F2A',
  danger: '#F87171',
  success: '#34D399',
  warning: '#FBBF24',
  codeBg: '#05070B',
  codeText: '#E6EDF3',
  overlay: 'rgba(0,0,0,0.6)',
  tabBar: '#0F141B',
};

export const palettes = { light, dark };

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
} as const;

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 22, xxl: 28, full: 999,
} as const;

export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const fontSize = {
  xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 26, display: 32,
} as const;

export type Shadows = { card: ViewStyle; soft: ViewStyle };

function buildShadows(scheme: 'light' | 'dark'): Shadows {
  if (scheme === 'dark') {
    // Koyu temada gölge görünmez; çok hafif tutuyoruz (kenarlık taşıyor).
    return {
      card: { shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
      soft: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
    };
  }
  return {
    card: { shadowColor: '#1B2330', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
    soft: { shadowColor: '#1B2330', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  };
}

export type AppTheme = {
  scheme: 'light' | 'dark';
  colors: ColorScheme;
  spacing: typeof spacing;
  radius: typeof radius;
  font: typeof font;
  fontSize: typeof fontSize;
  shadows: Shadows;
};

export function buildTheme(scheme: 'light' | 'dark'): AppTheme {
  return { scheme, colors: palettes[scheme], spacing, radius, font, fontSize, shadows: buildShadows(scheme) };
}
