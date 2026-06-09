/** Dosya yükleme — ajan analizi için (/api/v1/python/file/upload). */
import * as DocumentPicker from 'expo-document-picker';
import { ApiContext } from './client';

/** Dosyayı sunucuya yükler, mutlak dosya yolunu döner (ext_info.file_path için). */
export async function uploadPythonFile(
  ctx: ApiContext,
  file: { uri: string; name: string; mimeType?: string },
): Promise<string> {
  const form = new FormData();
  form.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || 'application/octet-stream',
  } as any);

  const res = await fetch(`${ctx.baseUrl.replace(/\/$/, '')}/api/v1/python/file/upload`, {
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
  if (!res.ok || json?.success === false || !json?.data) {
    throw new Error(json?.err_msg || `Yükleme başarısız (HTTP ${res.status})`);
  }
  return json.data as string;
}

/** Telefondan dosya seç + yükle. İptal edilirse null döner. */
export async function pickAndUpload(ctx: ApiContext): Promise<{ path: string; name: string } | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
  if (res.canceled || !res.assets?.length) return null;
  const f = res.assets[0];
  const path = await uploadPythonFile(ctx, { uri: f.uri, name: f.name, mimeType: f.mimeType });
  return { path, name: f.name };
}
