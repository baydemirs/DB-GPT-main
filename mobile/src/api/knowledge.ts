/** Bilgi tabanı (knowledge) — alan/belge yönetimi. */
import { ApiContext, apiPost } from './client';

export type KnowledgeSpace = {
  id: number;
  name: string;
  vector_type?: string;
  desc?: string;
  docs?: number;
};

export type KnowledgeDoc = {
  id: number;
  doc_name: string;
  doc_type?: string;
  status?: string; // TODO / RUNNING / FINISHED / FAILED
  chunk_size?: number;
  result?: string;
};

/** Tüm bilgi alanları. */
export async function getSpaces(ctx: ApiContext): Promise<KnowledgeSpace[]> {
  const res = await apiPost<KnowledgeSpace[]>(ctx, '/knowledge/space/list', {});
  return Array.isArray(res) ? res : [];
}

/** Yeni Chroma bilgi alanı oluştur. */
export function createSpace(ctx: ApiContext, name: string, desc = ''): Promise<unknown> {
  return apiPost(ctx, '/knowledge/space/add', {
    name,
    vector_type: 'Chroma',
    owner: ctx.userId,
    desc: desc || name,
    domain_type: 'Normal',
  });
}

/** Bir alanın belgeleri. */
export async function listDocuments(ctx: ApiContext, space: string): Promise<KnowledgeDoc[]> {
  const res = await apiPost<any>(ctx, `/knowledge/${encodeURIComponent(space)}/document/list`, {});
  if (Array.isArray(res)) return res;
  return res?.data ?? [];
}

/** Metin belgesi ekle → doc_id döner. */
export function addTextDocument(
  ctx: ApiContext,
  space: string,
  docName: string,
  content: string,
): Promise<number> {
  return apiPost<number>(ctx, `/knowledge/${encodeURIComponent(space)}/document/add`, {
    doc_name: docName,
    doc_type: 'TEXT',
    content,
  });
}

/** Belgeyi embed et (chunk + vektör). */
export function syncDocument(ctx: ApiContext, space: string, docIds: number[]): Promise<unknown> {
  return apiPost(ctx, `/knowledge/${encodeURIComponent(space)}/document/sync`, { doc_ids: docIds });
}

/** Telefondan seçilen dosyayı yükle (multipart) → doc_id döner. */
export async function uploadDocument(
  ctx: ApiContext,
  space: string,
  file: { uri: string; name: string; mimeType?: string },
): Promise<number> {
  const form = new FormData();
  form.append('doc_name', file.name);
  form.append('doc_type', 'DOCUMENT');
  form.append('doc_file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || 'application/octet-stream',
  } as any);

  const res = await fetch(
    `${ctx.baseUrl.replace(/\/$/, '')}/knowledge/${encodeURIComponent(space)}/document/upload`,
    { method: 'POST', headers: { 'user-id': ctx.userId }, body: form },
  );
  const text = await res.text();
  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    /* yoksay */
  }
  if (!res.ok || json?.success === false) {
    throw new Error(json?.err_msg || `Yükleme başarısız (HTTP ${res.status})`);
  }
  return json?.data;
}
