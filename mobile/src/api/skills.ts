/** Beceriler (skills) — list / delete / github import / upload. */
import { ApiContext, apiGet, apiPost } from './client';

export type Skill = {
  id: string;
  name: string;
  description: string;
  version?: string;
  skill_type?: string;
  type?: 'official' | 'personal' | string;
};

export async function getSkills(ctx: ApiContext): Promise<Skill[]> {
  const list = await apiGet<Skill[]>(ctx, '/api/v1/skills/list');
  return Array.isArray(list) ? list : [];
}

/** Kişisel beceriyi sil (resmi olanlar backend'de korunur). */
export function deleteSkill(ctx: ApiContext, skillId: string): Promise<unknown> {
  return apiPost(ctx, `/api/v1/skills/delete?skill_id=${encodeURIComponent(skillId)}`);
}

/** GitHub deposundan / skills.sh linkinden beceri içe aktar. */
export function importGithubSkill(ctx: ApiContext, url: string): Promise<unknown> {
  return apiPost(ctx, '/api/v1/skills/import_github', { url });
}

/** Telefondan seçilen .zip/.skill dosyasını yükle (multipart). */
export async function uploadSkill(
  ctx: ApiContext,
  file: { uri: string; name: string; mimeType?: string },
): Promise<void> {
  const form = new FormData();
  // React Native FormData dosya formatı
  form.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || 'application/octet-stream',
  } as any);

  // multipart için global fetch (Content-Type'ı fetch boundary ile kendisi koyar)
  const res = await fetch(`${ctx.baseUrl.replace(/\/$/, '')}/api/v1/skills/upload`, {
    method: 'POST',
    headers: { 'user-id': ctx.userId },
    body: form,
  });
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
}
