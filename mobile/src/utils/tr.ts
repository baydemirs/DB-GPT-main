/** Backend'den gelen İngilizce/Çince metinleri Türkçeye çeviren küçük sözlük. */

/** Ajan adım başlıkları (react-agent step.title). */
export function trStepTitle(title: string): string {
  const t = (title ?? '').trim();
  const map: Record<string, string> = {
    '思考中': 'Düşünüyor',
    Thinking: 'Düşünüyor',
    'Thought/Action/Observation': 'Düşünce / Eylem / Gözlem',
  };
  if (map[t]) return map[t];
  if (t.startsWith('Load Skill:')) return 'Beceri yüklendi:' + t.slice('Load Skill:'.length);
  if (t.startsWith('Tool:')) return 'Araç:' + t.slice('Tool:'.length);
  return t || 'Adım';
}

/** Bilinen becerilerin Türkçe açıklaması (SKILL.md İngilizce/Çince geliyor). */
const SKILL_TR: Record<string, string> = {
  'agent-browser':
    'AI ajanları için başsız (headless) tarayıcı otomasyonu — erişilebilirlik ağacı ve ref tabanlı öğe seçimi.',
  'csv-data-analysis':
    'CSV/Excel dosyalarını analiz et: istatistik özeti, dağılımlar, korelasyonlar ve interaktif görsel rapor üret.',
  'financial-report-analyzer':
    'Şirket finansal raporlarını (yıllık/çeyrek) derinlemesine analiz et; gelir-kâr trendi, bilanço, nakit akışı ve oranlar.',
  'skill-creator':
    'Yeni beceriler oluşturmak için rehber — etkili, yeniden kullanılabilir beceriler yaratmana yardım eder.',
  'walmart-sales-analyzer':
    'Walmart satış verilerini analiz et; mağaza satış trendleri, tatil etkisi, sıcaklık ve işsizlik ilişkileri.',
};

export function trSkillDescription(id: string, fallback: string): string {
  return SKILL_TR[id] ?? fallback;
}
