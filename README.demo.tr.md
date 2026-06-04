# DB-GPT Demo — AI Destekli Veritabanı Sorgulama ve Analiz Sistemi

Bu doküman, **DB-GPT** projesini bir **demo/sunum** ortamında çalıştırmak için
hazırlanmıştır. Amaç: doğal dille (Türkçe) soru sorup, yapay zekânın bunu
otomatik **SQL**'e çevirip bir **PostgreSQL** veritabanı (`demo_ai_database`)
üzerinde çalıştırmasını ve sonuçları tablo/grafik olarak göstermesini sergilemek.

> Mevcut proje dosyaları değiştirilmedi. Demo için **yeni** dosyalar eklendi:
> - `configs/dbgpt-demo.toml` — demo yapılandırması
> - `.env.demo.example` — örnek ortam değişkenleri
> - `docker-compose.demo.yml` — PostgreSQL demo veritabanı
> - `demo/postgres/01_schema.sql` + `02_seed_data.sql` — şema ve demo veri
> - `demo/SUNUM.md` — sunum için teknik anlatım

---

## 1. Proje Nedir?

**DB-GPT**, yerel/bulut LLM modellerini kullanarak verinizle doğal dilde
konuşmanızı sağlayan açık kaynak bir platformdur (Text-to-SQL + veri analizi).

| Katman | Teknoloji |
|--------|-----------|
| Backend | Python ≥3.10, `uv` monorepo (`packages/`), web sunucusu **5670** portu |
| Frontend | Next.js + React + TypeScript + Ant Design (`web/`) |
| LLM | OpenAI / SiliconFlow / DeepSeek / yerel modeller |
| Vektör DB | Chroma (RAG için) |
| Metadata DB | SQLite (varsayılan, demo için yeterli) |
| Demo veri kaynağı | **PostgreSQL → `demo_ai_database`** |

---

## 2. Ön Koşullar

- **Docker Desktop** (PostgreSQL demo veritabanını çalıştırmak için)
- **Python 3.10+** ve **uv** (`pip install uv` veya resmi kurulum)
- **Bir LLM API anahtarı** — bu olmadan AI sorgu üretemez.
  Varsayılan: **OpenAI** (`OPENAI_API_KEY`). İstersen SiliconFlow/DeepSeek'e
  geçebilirsin (`configs/dbgpt-demo.toml` içindeki `[models]` bölümü).

---

## 3. Adım Adım Kurulum

### Adım 1 — Demo PostgreSQL veritabanını başlat

```bash
docker compose -f docker-compose.demo.yml up -d
```

Bu komut:
- `postgres:16` konteynerini ayağa kaldırır (port **5432**),
- `demo_ai_database` veritabanını oluşturur,
- `demo/postgres/01_schema.sql` ve `02_seed_data.sql` dosyalarını **otomatik**
  çalıştırarak tabloları ve demo verileri yükler.

Kontrol:
```bash
docker compose -f docker-compose.demo.yml ps
```
`healthy` görünmeli.

### Adım 2 — Ortam değişkenlerini hazırla

`.env.demo.example` dosyasını `.env.demo` olarak kopyala ve **OpenAI anahtarını**
doldur:

```
OPENAI_API_KEY=sk-...        # KENDİ anahtarın
DBGPT_LANG=tr
```

> Anahtarları kabuğa yüklemenin Windows'taki en kolay yolu için
> aşağıdaki "Ortam değişkeni yükleme" notuna bak.

### Adım 3 — DB-GPT web sunucusunu başlat

```bash
uv run dbgpt start webserver --config configs/dbgpt-demo.toml
```

Açılınca tarayıcıdan: **http://localhost:5670**

### Adım 4 — `demo_ai_database`'i DB-GPT'ye veri kaynağı olarak ekle

Web arayüzünde:

1. Sol menüden **Veri Kaynakları / Data Sources** bölümüne gir.
2. **Yeni Ekle → PostgreSQL** seç.
3. Aşağıdaki bilgileri gir (docker-compose ile birebir aynı):

   | Alan | Değer |
   |------|-------|
   | Tür | PostgreSQL |
   | Host | `127.0.0.1` |
   | Port | `5432` |
   | Veritabanı | `demo_ai_database` |
   | Kullanıcı | `demo_user` |
   | Parola | `demo_pass_123` |

4. **Test Et / Kaydet**.

### Adım 5 — Doğal dille sorgula

**Chat with DB / Veritabanı ile Sohbet** uygulamasını aç, veri kaynağı olarak
`demo_ai_database`'i seç ve Türkçe sor:

- "En çok sorgu yapan 3 kullanıcıyı göster"
- "Modellere göre toplam maliyeti hesapla"
- "Başarısız (hatalı + zaman aşımı) sorgu oranı nedir?"
- "Ortalama yanıt süresini duruma göre grupla ve grafikle"
- "5 puan alan sorguların doğal dil sorularını listele"

---

## 4. Demo Veritabanı İçeriği (`demo_ai_database`)

| Tablo | Açıklama |
|-------|----------|
| `kullanicilar` | Sistemi kullanan analist/yöneticiler |
| `ai_modelleri` | SQL üretiminde kullanılan LLM'ler + fiyatları |
| `veri_kaynaklari` | Sisteme bağlı iş veritabanları |
| `sorgular` | Doğal dil sorusu + AI'nın ürettiği SQL |
| `sorgu_calistirmalari` | Süre, token, maliyet, durum (başarılı/hatalı) |
| `geri_bildirimler` | Kullanıcı puanı (1–5) ve yorum |

Tablolarda Türkçe `COMMENT`'ler var; DB-GPT bunları okuyup daha isabetli SQL üretir.

---

## 5. Zorunlu vs. Opsiyonel Servisler

**Zorunlu:** DB-GPT web sunucusu (5670) · bir LLM API anahtarı · embedding modeli ·
SQLite metadata (otomatik) · PostgreSQL demo veritabanı.

**Opsiyonel:** MySQL metadata · Docker ile DB-GPT (yerel `uv` yeterli) · reranker ·
GraphRAG · yerel LLM modelleri · frontend'i ayrı derlemek.

---

## 6. Sık Karşılaşılan Sorunlar

| Sorun | Çözüm |
|-------|-------|
| Web 5670'te açılmıyor | `uv run ...` çıktısındaki hatayı kontrol et; LLM anahtarı eksik olabilir |
| Veri kaynağı bağlanmıyor | Postgres konteyneri `healthy` mi? Port 5432 başka bir şey tarafından kullanılıyor olabilir |
| AI boş/yanlış SQL üretiyor | Doğru veri kaynağı seçili mi? `OPENAI_API_KEY` geçerli mi? |
| Verileri sıfırlamak | `docker compose -f docker-compose.demo.yml down -v` sonra tekrar `up -d` |
| Arayüz İngilizce | `.env.demo` içinde `DBGPT_LANG=tr` ayarla, sunucuyu yeniden başlat |

### Ortam değişkeni yükleme notu (Windows)
`uv run` komutunu çalıştırmadan önce `.env.demo` içindeki değişkenlerin kabuk
ortamında tanımlı olması gerekir. Bunun Claude Desktop / PowerShell tarafındaki
en pratik yolunu birlikte ayarlayabiliriz — istersen bu adımı senin için
otomatikleştirecek küçük bir başlatma scripti de hazırlayabilirim.

---

## 7. Sunum İçin

Teknik anlatım, mimari akış ve demo senaryosu için: **`demo/SUNUM.md`**.
