/**
 * Kalıcı ayarlar (AsyncStorage): sunucu adresi, tema, model, kullanıcı adı,
 * onboarding tamamlandı mı.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CONFIG } from '../config';

export type ThemeMode = 'light' | 'dark' | 'system';

export type Settings = {
  baseUrl: string;
  themeMode: ThemeMode;
  model: string;
  userId: string;
  userName: string;
  onboarded: boolean;
};

const KEY = '@dbgpt_mobile_settings_v2';

export const DEFAULT_SETTINGS: Settings = {
  baseUrl: DEFAULT_CONFIG.apiBaseUrl,
  themeMode: 'system',
  model: DEFAULT_CONFIG.model,
  userId: DEFAULT_CONFIG.userId,
  userName: '',
  onboarded: false,
};

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(s: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* sessizce geç */
  }
}
