/**
 * Sunucu bağlantı durumu. Hafif bir "ping" ile sunucuya ulaşılıp ulaşılamadığını
 * izler; ulaşılamazsa global bir uyarı banner'ı gösterilir.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { useApp } from '../theme/ThemeContext';

type Status = 'unknown' | 'online' | 'offline';

type Ctx = {
  status: Status;
  checking: boolean;
  recheck: () => void;
};

const ConnCtx = createContext<Ctx | null>(null);

async function ping(baseUrl: string, userId: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/v1/skills/list`, {
      headers: { 'user-id': userId },
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export function ConnectionProvider({ children }: { children: React.ReactNode }) {
  const { settings, ready } = useApp();
  const [status, setStatus] = useState<Status>('unknown');
  const [checking, setChecking] = useState(false);
  const runIdRef = useRef(0);

  const recheck = useCallback(() => {
    if (!ready) return;
    const id = ++runIdRef.current;
    setChecking(true);
    ping(settings.baseUrl, settings.userId).then(ok => {
      if (id !== runIdRef.current) return; // eski kontrol
      setStatus(ok ? 'online' : 'offline');
      setChecking(false);
    });
  }, [ready, settings.baseUrl, settings.userId]);

  // Açılışta + sunucu adresi değişince kontrol et
  useEffect(() => {
    recheck();
  }, [recheck]);

  // Uygulama öne gelince yeniden kontrol et (ağ değişmiş olabilir)
  useEffect(() => {
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') recheck();
    });
    return () => sub.remove();
  }, [recheck]);

  // Çevrimdışıyken periyodik yeniden dene
  useEffect(() => {
    if (status !== 'offline') return;
    const t = setInterval(recheck, 15000);
    return () => clearInterval(t);
  }, [status, recheck]);

  return <ConnCtx.Provider value={{ status, checking, recheck }}>{children}</ConnCtx.Provider>;
}

export function useConnection(): Ctx {
  const ctx = useContext(ConnCtx);
  if (!ctx) throw new Error('useConnection must be used within ConnectionProvider');
  return ctx;
}
