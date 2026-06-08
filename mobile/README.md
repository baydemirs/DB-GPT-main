# DB-GPT Mobil (Expo / React Native)

DB-GPT backend'ine bağlanan iOS + Android mobil uygulaması. Backend'e **hiç dokunmaz**;
web ile aynı API'leri (`/api/v1/...`) kullanır.

## Faz 0 — Streaming chat kanıtı (mevcut durum)

Telefondan DB-GPT sunucusuna bağlanıp `chat_normal` modunda cevabın canlı akmasını gösterir.
En riskli parça olan **POST + SSE streaming** burada `expo/fetch` ile çözülmüştür.

- `src/config.ts` — sunucu adresi, kullanıcı, model, sohbet modu
- `src/api/chat.ts` — SSE streaming istemcisi
- `App.tsx` — minimal sohbet ekranı

## Çalıştırma

### 1. Backend'i başlat
DB-GPT sunucusunun çalıştığından emin ol (varsayılan port **5670**, host `0.0.0.0`).

### 2. Bilgisayarının LAN IP'sini öğren
```powershell
ipconfig   # "IPv4 Address" satırı, örn. 192.168.1.34
```
Telefon ile bilgisayar **aynı Wi-Fi ağında** olmalı. `localhost`/`127.0.0.1` telefondan ÇALIŞMAZ.

### 3. Uygulamayı başlat
```powershell
cd mobile
npm start          # QR kod çıkar
```
Telefona **Expo Go** uygulamasını kur (App Store / Play Store), QR kodu okut.

### 4. Test et
Uygulama açılınca üstteki adres kutusuna `http://<LAN-IP>:5670` yaz (örn. `http://192.168.1.34:5670`),
bir mesaj gönder ve cevabın akmasını izle.

> Android emülatörü kullanıyorsan host IP'si `http://10.0.2.2:5670`'tir.

## Sonraki fazlar
- **Faz 1:** sohbet geçmişi, yeni sohbet, markdown render, model seçimi
- **Faz 2:** veritabanı/uygulama seçimi, geri bildirim (👍/👎)
- **Faz 3:** native cila + EAS Build ile mağaza paketleri (iOS için Mac gerekmez, EAS bulutta derler)
