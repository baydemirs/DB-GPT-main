/**
 * Mobil uygulama yapılandırması.
 *
 * ÖNEMLİ: Telefon `localhost`'u GÖREMEZ. apiBaseUrl olarak DB-GPT sunucusunun
 * çalıştığı bilgisayarın LAN IP'sini yazın. IP'yi öğrenmek için (Windows):
 *   PowerShell> ipconfig   ->  "IPv4 Address" satırı (örn. 192.168.1.34)
 * Telefon ile bilgisayar AYNI Wi-Fi ağında olmalı.
 *
 * Bu değerler uygulama içindeki ayar ekranından da değiştirilebilir (App.tsx).
 */
export const DEFAULT_CONFIG = {
  // Bu bilgisayarın LAN IP'si (ipconfig -> Wi-Fi IPv4):
  apiBaseUrl: 'http://10.69.31.91:5670',
  // Web'deki sahte (mock) kullanıcı ile aynı — backend bunu `user-id` header'ı olarak bekliyor:
  userId: '001',
  // Demo'da aktif model (configs/dbgpt-demo.toml):
  model: 'gemini-2.5-flash',
  // DB/app gerektirmeyen en basit sohbet modu:
  chatMode: 'chat_normal',
  temperature: 0.5,
};

export type AppConfig = typeof DEFAULT_CONFIG;
