/**
 * Kalıcı ayarlar (AsyncStorage): sunucu adresi, tema modu, seçili model.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CONFIG } from '../config';

export type ThemeMode = 'light' | 'dark' | 'system';

export type Settings = {
  baseUrl: string;
  themeMode: ThemeMode;
  model: string;
  userId: string;
};

const KEY = '@dbgpt_mobile_settings_v1';

export const DEFAULT_SETTINGS: Settings = {
  baseUrl: DEFAULT_CONFIG.apiBaseUrl,
  themeMode: 'system',
  model: DEFAULT_CONFIG.model,
  userId: DEFAULT_CONFIG.userId,
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
    // sessizce geç — ayar kaydı kritik değil
  }
}
