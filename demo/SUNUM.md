# Sunum — AI Destekli Veritabanı Sorgulama ve Analiz Sistemi (DB-GPT)

Bu doküman, demoyu sunarken anlatacağın **teknik açıklamayı** ve **akış
senaryosunu** içerir. Hedef kitleye göre 10–15 dakikalık bir sunum için yeterli.

---

## 1. Tek Cümlelik Tanım

> "Kullanıcı Türkçe soru soruyor; yapay zeka bunu otomatik olarak SQL'e çeviriyor,
> gerçek bir veritabanında çalıştırıyor ve sonucu tablo/grafik olarak sunuyor —
> tek satır SQL yazmadan."

---

## 2. Neden Önemli? (Problem)

- Veriye erişmek için herkesin SQL bilmesi gerekiyor → darboğaz.
- Analistler basit sorgular için bile teknik ekibe bağımlı.
- DB-GPT bu engeli kaldırır: **doğal dil → SQL → sonuç + görselleştirme.**
- Tüm bunlar **kendi altyapında** çalışabilir → veri gizliliği korunur.

---

## 3. Mimari (Yüksek Seviye)

```
[Kullanıcı/Türkçe soru]
        │
        ▼
[DB-GPT Web UI :5670]  ──►  [Backend (Python, packages/)]
        │                          │
        │                          ├─► [LLM (OpenAI/SiliconFlow/DeepSeek)]
        │                          │      └─ doğal dil → SQL üretimi
        │                          │
        │                          ├─► [RAG / Chroma]  şema bilgisini bağlama ekler
        │                          │
        │                          └─► [Veri Kaynağı: PostgreSQL demo_ai_database]
        │                                 └─ üretilen SQL burada çalışır
        ▼
[Sonuç: tablo + otomatik grafik (AntV)]
```

**Katmanlar:**
- **Frontend:** Next.js + React + Ant Design (`web/`)
- **Backend:** Python monorepo (`packages/dbgpt-core`, `-app`, `-serve`, `-ext`)
- **Veri kaynağı bağlantıları:** `dbgpt-ext` içindeki connector'lar
  (PostgreSQL, MySQL, SQLite, ...). Bizim demo `conn_postgresql.py` kullanır.
- **Metadata DB:** SQLite (DB-GPT'nin kendi ayar/sohbet verisi)

---

## 4. Doğal Dil → SQL Akışı (Adım Adım)

1. Kullanıcı Türkçe bir soru yazar.
2. DB-GPT, seçili veri kaynağının **şemasını** (tablo + sütun + Türkçe
   `COMMENT`'ler) çıkarır.
3. **RAG** ile en alakalı tablolar bağlama (context) olarak eklenir
   (`schema_retrieve_top_k`).
4. Soru + şema, **LLM**'e gönderilir; model bir **SQL** üretir.
5. Üretilen SQL **PostgreSQL**'de çalıştırılır.
6. Sonuç tablo olarak döner; uygun veri için **otomatik grafik** çizilir.
7. Tüm bu olaylar (`sorgular`, `sorgu_calistirmalari`) demo veride
   modellenmiştir — yani sistem kendi çalışma geçmişini de analiz edebilir.

---

## 5. Demo Senaryosu (Canlı Akış)

> Önce `docker compose -f docker-compose.demo.yml up -d` ile veritabanı,
> sonra `uv run dbgpt start webserver --config configs/dbgpt-demo.toml` ile sunucu.

**Sahne 1 — Basit sorgu:**
"Toplam kaç kullanıcı var?" → AI `SELECT COUNT(*) FROM kullanicilar;` üretir.

**Sahne 2 — Gruplama + analiz:**
"Modellere göre toplam maliyeti hesapla" →
`ai_modelleri` + `sorgu_calistirmalari` join'i; sonuç çubuk grafik.

**Sahne 3 — İş zekâsı sorusu:**
"Başarılı sorguların ortalama yanıt süresi nedir?" →
`WHERE durum = 'basarili'` + `AVG(sure_ms)`.

**Sahne 4 — Kalite analizi:**
"En düşük puan alan sorguların doğal dil sorularını ve sebebini göster" →
`geri_bildirimler` + `sorgular` + `sorgu_calistirmalari` üçlü join; hata
mesajlarıyla birlikte. (Mesajın gücü: sistem kendi başarısızlıklarını analiz ediyor.)

**Sahne 5 — Görselleştirme:**
"Sorgu durumlarının dağılımını pasta grafikle göster" → otomatik grafik üretimi.

---

## 6. Konuşma Sırasında Vurgulanacak Noktalar

- **Veri gizliliği:** Model API'ye yalnızca şema + soru gider; istenirse tamamen
  yerel modelle (vLLM/llama.cpp) çalışıp veri hiç dışarı çıkmaz.
- **Çoklu veritabanı:** Aynı arayüzden PostgreSQL, MySQL, SQLite vb. bağlanabilir.
- **Türkçe `COMMENT` etkisi:** Şema açıklamaları AI'nın isabetini artırır.
- **Maliyet/performans takibi:** Demo veritabanı, gerçek bir gözlemlenebilirlik
  (observability) senaryosunu da temsil ediyor — token, süre, maliyet, puan.
- **Genişletilebilirlik:** RAG, grafik bilgi grafikleri (GraphRAG), reranker gibi
  modüller opsiyonel olarak açılabilir.

---

## 7. Olası Sorular ve Kısa Yanıtlar

| Soru | Yanıt |
|------|-------|
| "Yanlış SQL üretirse?" | Üretilen SQL kullanıcıya gösterilir; çalıştırmadan görülebilir/düzenlenebilir. Demo veride `hatali`/`zaman_asimi` örnekleri var. |
| "Hangi modeller?" | OpenAI, SiliconFlow, DeepSeek, yerel modeller — config'ten tek satırla değiştirilir. |
| "Veri dışarı sızar mı?" | Bulut model kullanılırsa sadece şema+soru gider; yerel model ile hiçbir şey çıkmaz. |
| "Üretime hazır mı?" | Çekirdek açık kaynak ve aktif; bu kurulum bir **demo** ortamıdır. |
| "Ölçeklenir mi?" | Cluster/HA compose örnekleri mevcut (`docker/compose_examples/`). |

---

## 8. Teknik Özet (Slayt İçin Madde Madde)

- Doğal dil → SQL → sonuç + otomatik grafik
- Python backend (`uv` monorepo) · Next.js frontend · port 5670
- LLM sağlayıcı değiştirilebilir (varsayılan OpenAI)
- Veri kaynağı: PostgreSQL `demo_ai_database` (6 tablo, Türkçe şema)
- RAG (Chroma) ile şema bağlamı zenginleştirme
- Metadata SQLite — kurulum gerektirmez
- Tek komutla demo veritabanı: `docker compose -f docker-compose.demo.yml up -d`
