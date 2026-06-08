/**
 * Temel REST istemcisi. DB-GPT yanıtları { success, err_code, err_msg, data }
 * sarmalayıcısıyla gelir; burada açıp data döndürüyoruz.
 */
export type ApiContext = { baseUrl: string; userId: string };

type Wrapped<T> = {
  success?: boolean;
  err_code?: string | null;
  err_msg?: string | null;
  data?: T;
};

function url(ctx: ApiContext, path: string): string {
  return `${ctx.baseUrl.replace(/\/$/, '')}${path}`;
}

async function request<T>(
  ctx: ApiContext,
  path: string,
  init: RequestInit & { method: 'GET' | 'POST' },
): Promise<T> {
  const res = await fetch(url(ctx, path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'user-id': ctx.userId,
      ...(init.headers ?? {}),
    },
  });

  const text = await res.text();
  let json: Wrapped<T> | T;
  try {
    json = text ? JSON.parse(text) : ({} as T);
  } catch {
    throw new Error(`Geçersiz yanıt (HTTP ${res.status})`);
  }

  if (!res.ok) {
    const msg = (json as Wrapped<T>)?.err_msg || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  // Sarmalı ({success,data}) ise aç, değilse ham döndür.
  if (json && typeof json === 'object' && 'success' in (json as object)) {
    const w = json as Wrapped<T>;
    if (w.success === false) throw new Error(w.err_msg || 'İstek başarısız');
    return (w.data as T) ?? (undefined as unknown as T);
  }
  return json as T;
}

export function apiGet<T>(ctx: ApiContext, path: string): Promise<T> {
  return request<T>(ctx, path, { method: 'GET' });
}

export function apiPost<T>(ctx: ApiContext, path: string, body?: unknown): Promise<T> {
  return request<T>(ctx, path, {
    method: 'POST',
    body: body != null ? JSON.stringify(body) : undefined,
  });
}
