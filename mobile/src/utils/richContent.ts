/**
 * Asistan cevabını ayrıştırır. chat_with_db modunda cevap şu şekildedir:
 *   <açıklama metni>
 *   <chart-view content="{...escaped JSON...}" />
 * JSON: { type, sql, data: [{...}] }
 */

export type ParsedAssistant =
  | { kind: 'markdown'; text: string }
  | { kind: 'preparing'; thoughts: string }
  | { kind: 'db'; text: string; sql: string; data: Record<string, any>[]; chartType: string };

function decodeEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

export function parseAssistant(content: string): ParsedAssistant {
  const text = content ?? '';

  // 1) Nihai biçim: <chart-view content="..." />
  const m = text.match(/<chart-view\s+content="([\s\S]*?)"\s*\/?>/i);
  if (m) {
    const before = text.slice(0, m.index).trim();
    try {
      const json = JSON.parse(decodeEntities(m[1]));
      const data = Array.isArray(json?.data) ? json.data : [];
      return {
        kind: 'db',
        text: before,
        sql: typeof json?.sql === 'string' ? json.sql : '',
        data,
        chartType: typeof json?.type === 'string' ? json.type : 'response_table',
      };
    } catch {
      // JSON çözülemediyse düz metne düş
      return { kind: 'markdown', text: before || text };
    }
  }

  // 2) Ara biçim: model SQL üretiyor ama henüz çalıştırılmadı (```json {thoughts, sql}```)
  const trimmed = text.trim();
  if (trimmed.startsWith('```json') && /"sql"\s*:/.test(trimmed)) {
    let thoughts = '';
    try {
      const inner = trimmed.replace(/^```json\s*/, '').replace(/```$/, '');
      const obj = JSON.parse(inner);
      thoughts = typeof obj?.thoughts === 'string' ? obj.thoughts : '';
    } catch {
      /* yoksay */
    }
    return { kind: 'preparing', thoughts };
  }

  // 3) Düz markdown
  return { kind: 'markdown', text };
}
