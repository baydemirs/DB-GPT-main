# DB-GPT Mobil — Genel Proje Raporu

> Güncelleme: 2026-06-09 · Branch: `feature/mobile-app` · Son commit: `5051dd3`
> Depo: github.com/baydemirs/DB-GPT-main

---

## 1. Özet

DB-GPT yapay zeka platformunun **iOS + Android** mobil uygulaması. Tek kod
tabanından her iki platform; **Expo (React Native)** ile geliştirildi. Uygulama
backend'e **hiç dokunmadan**, web ile **aynı API'leri** kullanarak çalışır
(istisna: knowledge ve composer-dosya akışını çalıştırmak için 2 backend bug'ı
düzeltildi — aşağıda).

**Durum:** Sohbetten veritabanı sorgulamaya, ajanlara, belgelerle sohbete ve
dosya yüklemeye kadar **uçtan uca çalışan, şık tasarımlı** bir uygulama. Gerçek
Android telefonda doğrulandı.

---

## 2. Mimari

```
┌──────────────┐   HTTP / SSE (stream)   ┌────────────────────────┐
│  Mobil App   │ ──────────────────────► │  DB-GPT Backend        │
│ (Expo / RN)  │ ◄────────────────────── │  (FastAPI, :5670)       │
└──────────────┘     /api/v1/...           └────────────────────────┘
       │  aynı API'ler / aynı backend            │
┌──────────────┐                          ┌────────────────────────┐
│  Web (Next)  │ ───────────────────────► │ Veri kaynaklari, bilgi  │
└──────────────┘                          │ tabanlari, modeller     │
                                           └────────────────────────┘
```

- Tek ortak backend → web ve mobil aynı sohbet geçmişini, veri kaynaklarını,
  modelleri, bilgi tabanlarını görür.
- Auth: web ile aynı (gerçek login yok, `user-id: 001` header).
- Streaming: SSE; React Native'de `expo/fetch` ile çözüldü.
- Bağlantı: telefon ile PC aynı ağda (hotspot dahil); `http://<LAN-IP>:5670`.

---

## 3. Teknoloji yığını

| Katman | Teknoloji |
|--------|-----------|
| Çatı | Expo SDK 54, React Native 0.81, React 19, TypeScript |
| Yönlendirme | Expo Router (dosya tabanlı) |
| Tasarım | Özel tasarım sistemi (token, Inter font, açık/koyu tema) |
| İkonlar | lucide-react-native |
| Depolama | AsyncStorage (ayarlar) |
| Streaming | expo/fetch (POST + SSE) |
| Markdown | react-native-markdown-display |
| Dosya | expo-document-picker (multipart yükleme) |

---

## 4. Özellikler (hepsi çalışıyor)

### 💬 Sohbet
- Markdown render (kod, tablo, liste), canlı streaming, durdurma
- Sohbet geçmişi (ara / aç / sil / yeni), model seçimi
- Web tarzı composer: metin + araç çubuğu (dosya, beceri, veritabanı, bilgi,
  model seçici, ses, gönder)

### 🗄️ Veritabanıyla Sohbet
- Veritabanı seç → doğal dil → **SQL üretimi** → **veri tablosu** render
- Sohbette veritabanı bağlam çubuğu + DB'ye özel öneriler

### 🤖 Ajan & Beceriler
- ReAct ajanı: adım adım düşünür (react-agent), "Düşünme adımları" katlanır
- Beceri kataloğu; **beceri ekleme** (GitHub'dan içe aktar + dosya yükle) ve
  **silme** (kişisel beceriler)

### 📚 Bilgi Tabanı (RAG)
- Bilgi alanı listesi/oluşturma (Chroma), alan detayında belge yönetimi
- **Belge yükleme** (PDF/TXT/DOCX + metin) → otomatik embed → durum rozeti
- Belgelere dayalı **Türkçe** cevap + referanslar

### 📎 Dosya Analizi
- Composer `+` → dosya seç → yükle → **ajana analiz ettir** (CSV vb.)

### 🎨 Uygulama yapısı & UX
- Onboarding (tanıtım + isim) → kişisel karşılama
- 4 sekme: Ana Sayfa · Sohbetler · Keşfet · Profil
- Açık / koyu / sistem tema, kart tabanlı tasarım, animasyonlar, haptik
- **Bağlantı-hatası UX**: istek zaman aşımı + sunucu erişilemeyince global uyarı
  banner'ı (+ yeniden dene + Profil'e git)

---

## 5. Bonus: backend & web düzeltmeleri

Mobili çalıştırırken bulunan ve düzeltilen gerçek bug'lar (web'i de etkiliyordu):

- **Embedding 'index' bug'ı** (`dbgpt/rag/embedding/embeddings.py`): Gemini gibi
  'index' döndürmeyen sağlayıcılarda KeyError → **tüm** bilgi tabanı sorguları
  çöküyordu. Düzeltildi.
- **chat_knowledge Çince prompt** (`scene/chat_knowledge/v1/prompt.py`): dil "en"
  değilse Çince şablona düşüyordu (tr dahil) → artık kullanıcının diliyle cevap.
- **Web sohbet geçmişi tarihleri** (`web/.../side-bar.tsx`): kırılgan tarih
  parse'ı "2 yıl önce" gibi saçma sonuçlar veriyordu → sağlam + Türkçe.

---

## 6. Dosya yapısı (`mobile/`)

```
app/                          # Expo Router ekranları
  _layout.tsx                 # kök: sağlayıcılar, onboarding kapısı, bağlantı banner'ı
  (tabs)/                     # alt sekmeler: index/chats/explore/profile
  chat.tsx                    # sohbet (normal / DB / bilgi) + dosya ekle
  select-db.tsx               # veritabanı seçimi
  select-knowledge.tsx        # bilgi tabanı yönetim merkezi (+ alan oluştur)
  knowledge-space.tsx         # alan detayı: belgeler + yükleme
  skills.tsx                  # ajan & beceri kataloğu (ekle/sil)
  agent.tsx                   # ReAct ajan sohbeti + dosya analizi
src/
  theme/                      # tokens, ThemeContext (açık/koyu)
  store/                      # settings, ChatContext, ConnectionContext
  api/                        # client (timeout), chat, agent, dialogues,
                              # skills, knowledge, files
  components/                 # Card, ChatBubble, ChatComposer, AssistantMessage,
                              # DataTable, AgentTurn, ModelPickerSheet,
                              # ConnectionBanner, EmptyState, ...
  utils/                      # dialogue, richContent (chart-view), tr (çeviri)
  screens/Onboarding.tsx
```

---

## 7. Bilinen sınırlar

- **Veri görselleştirme yok**: DB/analiz sonuçları tablo olarak (grafik değil).
- **HTML interaktif rapor (artifact) render yok**: ajanın ürettiği web raporları
  mobilde gösterilmiyor (WebView gerekir).
- **KnowledgeGraph alanları çalışmaz**: TuGraph gerektirir; Chroma alanları kullanılmalı.
- **Gemini kotası**: `gemini-2.5-flash` kotası dolunca `gemini-2.5-flash-lite`
  kullanılır (model bazında ayrı kota).
- **Web yerel build alınamıyor**: Node 25 + sınırlı RAM ortam sorunu; web
  değişiklikleri uygun bir CI/ortamda derlenir. (Tarih düzeltmesi sunulan
  statik dosya yamalanarak gösterildi.)

---

## 8. Yol haritası (sonraki adımlar)

- 📊 **Veri görselleştirme** — sonuçları gerçek grafiklerle (çizgi/sütun/pasta)
- 🌐 **Artifact/HTML rapor** — ajan raporlarını WebView ile gösterme
- 💅 **Tasarım cilası** — sohbet kartlarına tarih/önizleme, küçük rötuşlar
- 🚀 **EAS Build** — `.apk`/`.ipa` üretimi, mağaza yüklemesi (iOS için Mac gerekmez)

---

## 9. Çalıştırma

**Backend (Windows):**
```powershell
# .env.demo yükle + UTF-8 + venv (uv run çöküyor, venv kullan)
$env:PYTHONUTF8="1"; $env:PYTHONIOENCODING="utf-8"
& ".venv\Scripts\dbgpt.exe" start webserver --config configs/dbgpt-demo.toml
```

**Mobil:**
```powershell
cd mobile
npx expo start --lan
```

**Telefon (iki ayrı adres):**
- Expo Go → "Enter URL manually" → `exp://<LAN-IP>:8081`  (Metro)
- Uygulama → Profil → Sunucu adresi → `http://<LAN-IP>:5670`  (backend)

> LAN-IP: `ipconfig` → Wi-Fi IPv4. Telefon ile PC aynı ağda olmalı; Windows
> Güvenlik Duvarı'nda 8081 + 5670 açık olmalı.

---

## 10. Commit geçmişi (özet)

`Faz 0` streaming → `Faz 1` çok ekranlı sohbet + tasarım → `Faz 2` onboarding +
sekmeler → `Faz 3a` veritabanı sohbeti → `Faz 3b` ajan & beceriler → beceri
yönetimi → web tarih düzeltmesi → bilgi tabanı + 2 backend fix → belge yükleme →
bağlantı UX → composer dosya yükleme.
