/**
 * Tema + ayar sağlayıcısı. Açık/koyu/sistem modunu yönetir, kalıcı saklar,
 * tüm uygulamaya tema nesnesini ve ayarları dağıtır.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  Settings,
  ThemeMode,
} from '../store/settings';
import { AppTheme, buildTheme } from './tokens';

type Ctx = {
  theme: AppTheme;
  settings: Settings;
  ready: boolean;
  themeMode: ThemeMode;
  setThemeMode: (m: ThemeMode) => void;
  toggleTheme: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
};

const ThemeCtx = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadSettings().then(s => {
      setSettings(s);
      setReady(true);
    });
  }, []);

  const persist = useCallback((next: Settings) => {
    setSettings(next);
    saveSettings(next);
  }, []);

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => persist({ ...settingsRef.current, ...patch }),
    [persist],
  );

  // En güncel ayarlara closure içinde erişmek için ref
  const settingsRef = React.useRef(settings);
  settingsRef.current = settings;

  const setThemeMode = useCallback(
    (m: ThemeMode) => persist({ ...settingsRef.current, themeMode: m }),
    [persist],
  );

  const resolvedScheme: 'light' | 'dark' =
    settings.themeMode === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : settings.themeMode;

  const toggleTheme = useCallback(() => {
    setThemeMode(resolvedScheme === 'dark' ? 'light' : 'dark');
  }, [resolvedScheme, setThemeMode]);

  const theme = useMemo(() => buildTheme(resolvedScheme), [resolvedScheme]);

  const value = useMemo<Ctx>(
    () => ({
      theme,
      settings,
      ready,
      themeMode: settings.themeMode,
      setThemeMode,
      toggleTheme,
      updateSettings,
    }),
    [theme, settings, ready, setThemeMode, toggleTheme, updateSettings],
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useApp must be used within ThemeProvider');
  return ctx;
}

/** Kısayol: sadece tema nesnesi lazım olduğunda. */
export function useTheme(): AppTheme {
  return useApp().theme;
}
