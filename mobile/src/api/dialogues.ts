/**
 * Sohbet (dialogue) uçları — web/client/api/request.ts ile aynı endpoint'ler.
 */
import { ApiContext, apiGet, apiPost } from './client';

export type DialogueRole = 'human' | 'view' | 'system' | 'ai';

export type ChatMessage = {
  role: DialogueRole;
  context: string;
  order: number;
  time_stamp: number | string | null;
  model_name: string;
  thinking?: boolean;
};

export type Dialogue = {
  conv_uid: string;
  user_input: string;
  chat_mode: string;
  select_param: string;
  app_code: string;
  gmt_created?: string;
  gmt_modified?: string;
};

export type ModelInfo = {
  model_name: string;
  worker_type: string;
  healthy: boolean;
};

/** chat_with_db / chat_knowledge gibi modlarda seçilebilir kaynak (ör. veritabanı). */
export type ChatModeParam = { param: string; type: string };

/** Konuşma listesi. */
export function getDialogueList(ctx: ApiContext): Promise<Dialogue[]> {
  return apiGet<Dialogue[]>(ctx, '/api/v1/chat/dialogue/list');
}

/** Bir konuşmanın mesaj geçmişi. */
export function getChatHistory(ctx: ApiContext, convUid: string): Promise<ChatMessage[]> {
  return apiGet<ChatMessage[]>(
    ctx,
    `/api/v1/chat/dialogue/messages/history?con_uid=${encodeURIComponent(convUid)}`,
  );
}

/** Yeni konuşma oluştur. */
export function newDialogue(ctx: ApiContext, chatMode: string, model: string): Promise<Dialogue> {
  return apiPost<Dialogue>(
    ctx,
    `/api/v1/chat/dialogue/new?chat_mode=${encodeURIComponent(chatMode)}&model_name=${encodeURIComponent(model)}`,
  );
}

/** Konuşmayı sil. */
export function deleteDialogue(ctx: ApiContext, convUid: string): Promise<unknown> {
  return apiPost(ctx, `/api/v1/chat/dialogue/delete?con_uid=${encodeURIComponent(convUid)}`);
}

/** Bir sohbet modunun seçilebilir kaynakları (ör. veritabanları). */
export function getChatModeParams(ctx: ApiContext, chatMode: string): Promise<ChatModeParam[]> {
  return apiPost<ChatModeParam[]>(
    ctx,
    `/api/v1/chat/mode/params/list?chat_mode=${encodeURIComponent(chatMode)}`,
  );
}

/** Sağlıklı LLM modellerinin listesi. */
export async function getModels(ctx: ApiContext): Promise<string[]> {
  const list = await apiGet<ModelInfo[]>(ctx, '/api/v2/serve/model/models');
  const names = (list ?? []).filter(m => m.worker_type === 'llm').map(m => m.model_name);
  return Array.from(new Set(names));
}
