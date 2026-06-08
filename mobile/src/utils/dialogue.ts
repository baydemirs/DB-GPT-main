import { Dialogue } from '../api/dialogues';

/** Konuşma için görüntülenecek başlık (ilk kullanıcı mesajı). */
export function dialogueTitle(d: Dialogue): string {
  const input = d.user_input as unknown;
  if (typeof input === 'string' && input.trim()) return input.trim();
  if (input && typeof input === 'object') {
    const c = (input as Record<string, unknown>).content;
    if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return 'Yeni sohbet';
}

/** chat_mode için kısa, okunur etiket. */
export function chatModeLabel(mode: string): string {
  const map: Record<string, string> = {
    chat_normal: 'Sohbet',
    chat_with_db_execute: 'Veritabanı',
    chat_with_db_qa: 'Veri S&C',
    chat_knowledge: 'Bilgi',
    chat_dashboard: 'Panel',
    chat_excel: 'Excel',
    chat_agent: 'Ajan',
    chat_flow: 'Akış',
  };
  return map[mode] ?? 'Sohbet';
}
