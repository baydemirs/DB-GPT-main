/**
 * ReAct Ajan akışı — /api/v1/chat/react-agent.
 * SSE event tipleri:
 *   step.start   { id, title, detail }      → yeni adım
 *   step.thought { id, content }            → düşünce parçası (eklenir)
 *   step.action / step.observation { id, content }  → araç çağrısı/gözlem (eklenir)
 *   final        { content }                → nihai cevap
 *   done                                    → bitti
 *   error        { content }                → hata
 */
import { fetch } from 'expo/fetch';

export type AgentExtInfo = {
  file_path?: string;
  skill_id?: string;
  skill_name?: string;
  database_name?: string;
  database_type?: string;
  knowledge_space_name?: string;
  knowledge_space_id?: string;
};

export type AgentBody = {
  conv_uid: string;
  model_name: string;
  user_input: string;
  select_param?: string;
  ext_info?: AgentExtInfo;
};

export type AgentCallbacks = {
  onStepStart: (step: { id: string; title: string; detail?: string }) => void;
  onStepContent: (id: string, delta: string, kind: 'thought' | 'action' | 'observation') => void;
  onFinal: (content: string) => void;
  onDone?: () => void;
  onError?: (message: string) => void;
};

export async function streamAgent(opts: {
  baseUrl: string;
  userId: string;
  body: AgentBody;
  signal?: AbortSignal;
  callbacks: AgentCallbacks;
}) {
  const { baseUrl, userId, body, signal, callbacks } = opts;
  const url = `${baseUrl.replace(/\/$/, '')}/api/v1/chat/react-agent`;
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'user-id': userId },
      body: JSON.stringify({
        chat_mode: 'chat_react_agent',
        temperature: 0.6,
        max_new_tokens: 4000,
        select_param: '',
        ext_info: {},
        ...body,
      }),
      signal,
    });
    if (!resp.ok) {
      callbacks.onError?.(`Sunucu hatası: HTTP ${resp.status}`);
      return;
    }
    if (!resp.body) {
      callbacks.onError?.('Yanıt gövdesi boş.');
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let sep: number;
      while ((sep = buffer.indexOf('\n\n')) !== -1) {
        const raw = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        if (handle(raw, callbacks)) return;
      }
    }
    if (buffer.trim()) handle(buffer, callbacks);
    callbacks.onDone?.();
  } catch (err: any) {
    if (err?.name === 'AbortError') return;
    callbacks.onError?.(err?.message ?? 'Ağ hatası.');
  }
}

/** Bir SSE olayını işler. done görülürse true döner. */
function handle(raw: string, cb: AgentCallbacks): boolean {
  const payload = raw
    .split('\n')
    .filter(l => l.startsWith('data:'))
    .map(l => l.slice('data:'.length).replace(/^\s/, ''))
    .join('\n');
  if (!payload) return false;

  let evt: any;
  try {
    evt = JSON.parse(payload);
  } catch {
    return false;
  }

  switch (evt?.type) {
    case 'step.start':
      cb.onStepStart({ id: String(evt.id ?? evt.step ?? ''), title: String(evt.title ?? 'Adım'), detail: evt.detail });
      return false;
    case 'step.thought':
      cb.onStepContent(String(evt.id ?? ''), String(evt.content ?? ''), 'thought');
      return false;
    case 'step.action':
      cb.onStepContent(String(evt.id ?? ''), String(evt.content ?? ''), 'action');
      return false;
    case 'step.observation':
      cb.onStepContent(String(evt.id ?? ''), String(evt.content ?? ''), 'observation');
      return false;
    case 'final':
      cb.onFinal(String(evt.content ?? ''));
      return false;
    case 'done':
      cb.onDone?.();
      return true;
    case 'error':
      cb.onError?.(String(evt.content ?? 'Hata'));
      return false;
    default:
      return false;
  }
}
