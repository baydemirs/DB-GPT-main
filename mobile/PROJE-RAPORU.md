# DB-GPT Mobil — Proje Raporu

> Son güncelleme: 2026-06-09 · Branch: `feature/mobile-app` · Son commit: `77c06e1`

## 1. Özet

DB-GPT'nin web sürümünün yanına, **iOS + Android** için tek kod tabanlı bir
**mobil uygulama** geliştiriliyor. Uygulama backend'e **hiç dokunmadan**, web ile
**aynı API'leri** (`/api/v1/...`) kullanarak çalışıyor. Geliştirme React Native
(Expo SDK 54) ile yapılıyor; ekip React/TypeScript bildiği için doğal seçim.

**Mevcut durum:** Faz 0 → 3b tamamlandı, gerçek Android telefonda doğrulandı.
Onboarding'den veritabanı sorgulamaya ve ajan sohbetine kadar çalışan, şık
tasarımlı bir uygulama hazır.

## 2. Mimari

```
┌─────────────┐     HTTP / SSE      ┌──────────────────────┐
│  Mobil App  │ ──────────────────► │  DB-GPT Backend      │
│ (Expo/RN)   │ ◄────────────────── │  (FastAPI, :5670)    │
└─────────────┘   /api/v1/...        └──────────────────────┘
       │                                      │
   aynı API'ler                         aynı veri kaynakları
       │                                      │
┌─────────────┐                        ┌──────────────────────┐
│  Web (Next) │ ──────────────────────►│  Walmart_Sales,      │
└─────────────┘                        │  Supabase, modeller  │
                                        └──────────────────────┘
```

- Backend tek ve ortak: web ve mobil aynı sunucuya bağlanır, aynı sohbet
  geçmişini / veri kaynaklarını / modelleri görür.
- Auth: web ile aynı (gerçek login yok, `user-id: 001` header).
- Streaming: chat akışı SSE; React Native'de `expo/fetch` ile çözüldü.

## 3. Teknoloji yığını

| Katman | Teknoloji |
|--------|-----------|
| Çatı | Expo SDK 54, React Native 0.81, React 19 |
| Yönlendirme | Expo Router (dosya tabanlı, web'deki `pages/` gibi) |
| Dil | TypeScript |
| Stil | Özel tasarım sistemi (token'lar, Inter font, açık/koyu tema) |
| İkonlar | lucide-react-native |
| Depolama | AsyncStorage (ayarlar) |
| Streaming | expo/fetch (POST + SSE) |
| Markdown | react-native-markdown-display |

## 4. Tamamlanan fazlar

### Faz 0 — Streaming chat kanıtı
En riskli parça (RN'de POST + SSE streaming) çözüldü. Telefondan backend'e
bağlanıp Gemini'den canlı cevap akışı doğrulandı.

### Faz 1 — Çok ekranlı sohbet + tasarım sistemi
- Açık / koyu / sistem tema, Inter font, renk token'ları
- Markdown render (kod, tablo, liste), mesaj baloncukları, animasyonlar
- Sohbet geçmişi, model seçimi, ayarlar

### Faz 2 — Gerçek uygulama yapısı
- **Onboarding**: 3 tanıtım slaytı + isim girişi → kişisel karşılama
- **Alt sekme navigasyonu**: Ana Sayfa · Sohbetler · Keşfet · Profil
- Kart tabanlı UI, yumuşak gölge, "yüzen kart" tasarım dili
- Ana Sayfa dashboard (hero kart, hızlı öneriler, son sohbetler)

### Faz 3a — Veritabanıyla Sohbet (chat-with-db)
- Veritabanı seçim ekranı (backend kaynaklarını listeler)
- Doğal dil → **SQL üretimi** → **veri tablosu** render
- Sohbette veritabanı bağlam çubuğu + DB'ye özel öneriler
- Walmart_Sales üzerinde doğrulandı (6435 satır)

### Faz 3b — Ajan & Beceriler (react-agent)
- ReAct ajanı: adım adım düşünüp iş yapar (`/api/v1/chat/react-agent`)
- **"Düşünme adımları"** katlanabilir kutu + nihai cevap; cevap gelince
  otomatik kapanır
- **Beceri kataloğu**: backend'deki skill'leri kart olarak listeler
- Web tarzı **composer**: metin + araç çubuğu (dosya, beceri, veritabanı,
  bilgi, model seçici, ses, gönder)
- Türkçeleştirme: adım başlıkları ve beceri açıklamaları

## 5. Mevcut özellikler (çalışan)

- ✅ Onboarding + isim ile kişiselleştirme
- ✅ 4 sekmeli navigasyon, açık/koyu tema
- ✅ Normal sohbet (markdown, streaming, durdurma)
- ✅ Sohbet geçmişi (aç/sil/yeni/arama)
- ✅ Model seçimi (composer'dan)
- ✅ Veritabanıyla sohbet → SQL + veri tablosu
- ✅ Ajan & beceriler → düşünme adımları + cevap
- ✅ Sunucu adresi ayarı + bağlantı testi

## 6. Dosya yapısı (`mobile/`)

```
app/                       # Expo Router ekranları
  _layout.tsx              # kök: sağlayıcılar, onboarding kapısı, Stack
  (tabs)/                  # alt sekmeler
    index.tsx              #   Ana Sayfa
    chats.tsx              #   Sohbetler
    explore.tsx            #   Keşfet
    profile.tsx            #   Profil
  chat.tsx                 # sohbet ekranı (normal + DB)
  select-db.tsx            # veritabanı seçimi
  skills.tsx               # beceri kataloğu
  agent.tsx                # ajan sohbeti
src/
  theme/                   # tokens, ThemeContext (açık/koyu)
  store/                   # settings (AsyncStorage), ChatContext
  api/                     # client, chat, dialogues, agent, skills
  components/              # Card, ChatBubble, ChatComposer, AssistantMessage,
                           # DataTable, AgentTurn, ModelPickerSheet, ...
  utils/                   # dialogue, richContent, tr (Türkçeleştirme)
  screens/Onboarding.tsx
```

## 7. Bilinen sınırlar

- **Dosya yükleme yok**: CSV/Excel/PDF yükleyip becerilerle (csv-data-analysis
  vb.) **tam analiz/rapor üretme** henüz yok. Ajanın bu beceriler için dosya
  istemesi normal.
- **HTML rapor (artifact) render yok**: web'in interaktif ECharts raporları
  mobilde gösterilmiyor (WebView gerektirir).
- **Bilgi tabanı (knowledge) yok**: "Yakında" olarak işaretli.
- **Grafik render yok**: DB sonuçları tablo olarak gösteriliyor (çizgi/sütun
  grafik değil).
- **Model muhakemesi İngilizce**: ajanın iç düşüncesi modelden İngilizce gelir
  (varsayılan gizli); nihai cevap Türkçe.
- **Gemini kotası**: `gemini-2.5-flash` kotası dolunca `gemini-2.5-flash-lite`
  kullanılıyor (ayrı kota). Model bazında ayrı kotalar var.

## 8. Sonraki adımlar (yapılacaklar)

### Faz 4a — Dosya yükleme + tam beceri çalıştırma (yüksek değer)
- CSV/Excel/PDF yükleme (expo-document-picker → `/api/v1/python/file/upload`)
- Becerileri dosyayla tam çalıştırma (Python betiği → analiz)
- Üretilen **raporu WebView ile gösterme** veya tarayıcıda açma

### Faz 4b — Bilgi Tabanı (knowledge)
- Bilgi alanlarını listele, belgelerle sohbet (chat_knowledge)
- Keşfet'teki "Bilgi Tabanı" kartını aktif et

### Faz 4c — Veri görselleştirme
- DB/analiz sonuçlarını **grafik** olarak render (çizgi/sütun/pasta)
- `<chart-view>` tiplerini gerçek grafiklere bağla

### Faz 5 — Cila & dağıtım
- Sohbet kartlarına tarih/önizleme, geri bildirim (👍/👎)
- Sesli giriş (gerçek)
- Performans, erişilebilirlik, hata durumları
- **EAS Build** ile `.apk` / `.ipa` üretimi (iOS için Mac gerekmez, bulutta
  derlenir), mağaza yüklemesi

### İyileştirmeler (her zaman)
- Modeli Türkçe düşünmeye yönlendiren sistem promptu (opsiyonel)
- Gemini için yeni anahtar / alternatif sağlayıcı
- Tasarım ince ayarları (hoca değerlendirmesi önceliği)

## 9. Çalıştırma

**Backend (Windows):**
```powershell
# .env.demo yükle + UTF-8 + venv
$env:PYTHONUTF8="1"; $env:PYTHONIOENCODING="utf-8"
& ".venv\Scripts\dbgpt.exe" start webserver --config configs/dbgpt-demo.toml
```

**Mobil:**
```powershell
cd mobile
npx expo start --lan
# Telefonda Expo Go → exp://<LAN-IP>:8081
```
Telefon ile PC aynı ağda olmalı (hotspot da olur). Windows Güvenlik Duvarı'nda
8081 + 5670 portları açık olmalı. Uygulama içi sunucu adresi `http://<LAN-IP>:5670`.
