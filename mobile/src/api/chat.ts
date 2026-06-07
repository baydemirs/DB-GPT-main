/**
 * DB-GPT chat streaming istemcisi (React Native / Expo).
 *
 * Web tarafı bunu `@microsoft/fetch-event-source` ile yapıyordu
 * (web/pages/mobile/chat/index.tsx -> handleChat). React Native'in standart
 * `fetch`'i POST gövdeli streaming'i desteklemediği için Expo SDK 52+ ile gelen
 * `expo/fetch`'i kullanıyoruz — native streaming gövde okuma sağlar.
 *
 * Not: DB-GPT `chat_normal` modunda her SSE olayında o ana kadarki METNİN
 * TAMAMINI gönderir (delta değil). Bu yüzden onMessage'a gelen metin, gösterilen
 * cevabın yerine geçmelidir (append değil, replace).
 */
import { fetch } from 'expo/fetch';

export type ChatBody = {
  chat_mode: string;
  model_name: string;
  user_input: string;
  conv_uid: string;
  temperature: number;
  app_code?: string;
  select_param?: unknown;
};

export type ChatCallbacks = {
  /** Asistan cevabının o ana kadarki TAM hali. UI'da içeriği bununla değiştir. */
  onMessage: (fullText: string) => void;
  onDone?: () => void;
  onError?: (message: string) => void;
};

export type StreamChatOptions = {
  baseUrl: string;
  userId: string;
  body: ChatBody;
  signal?: AbortSignal;
  callbacks: ChatCallbacks;
};

export async function streamChat({ baseUrl, userId, body, signal, callbacks }: StreamChatOptions) {
  const url = `${baseUrl.replace(/\/$/, '')}/api/v1/chat/completions`;
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // web/utils/constants/header.ts -> HEADER_USER_ID_KEY = 'user-id'
        'user-id': userId,
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!resp.ok) {
      callbacks.onError?.(`Sunucu hatası: HTTP ${resp.status}`);
      return;
    }

    if (!resp.body) {
      callbacks.onError?.('Yanıt gövdesi (stream) boş geldi.');
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    // SSE olayları "\n\n" ile ayrılır.
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let sepIndex: number;
      while ((sepIndex = buffer.indexOf('\n\n')) !== -1) {
        const rawEvent = buffer.slice(0, sepIndex);
        buffer = buffer.slice(sepIndex + 2);
        if (handleEvent(rawEvent, callbacks)) return; // [DONE] geldiyse bitir
      }
    }
    // Akış kapandı; arta kalan tamponu işle.
    if (buffer.trim()) handleEvent(buffer, callbacks);
    callbacks.onDone?.();
  } catch (err: any) {
    if (err?.name === 'AbortError') return; // kullanıcı durdurdu
    callbacks.onError?.(err?.message ?? 'Ağ hatası. Sunucu adresini ve aynı Wi-Fi ağında olmayı kontrol edin.');
  }
}

/** Bir SSE olayını işler. [DONE] görülürse true döner. */
function handleEvent(rawEvent: string, cb: ChatCallbacks): boolean {
  const dataPayload = rawEvent
    .split('\n')
    .filter(line => line.startsWith('data:'))
    .map(line => line.slice('data:'.length).replace(/^\s/, ''))
    .join('\n');

  if (!dataPayload) return false;
  if (dataPayload === '[DONE]') {
    cb.onDone?.();
    return true;
  }

  let text: string = dataPayload;
  try {
    const parsed = JSON.parse(dataPayload);
    text =
      parsed?.choices?.[0]?.message?.content ??
      parsed?.choices?.[0]?.delta?.content ??
      dataPayload;
  } catch {
    // Düz metin geldi — web tarafındaki gibi kaçışlı newline'ları düzelt.
    text = dataPayload.replace(/\\n/g, '\n');
  }

  if (typeof text !== 'string') return false;
  if (text.startsWith('[ERROR]')) {
    cb.onError?.(text.replace('[ERROR]', '').trim());
    return false;
  }
  cb.onMessage(text);
  return false;
}
