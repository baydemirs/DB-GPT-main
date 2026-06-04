-- =============================================================
-- demo_ai_database - DEMO VERILERI
-- 01_schema.sql calistiktan sonra otomatik yuklenir.
-- =============================================================

-- -------------------------------------------------------------
-- Kullanicilar
-- -------------------------------------------------------------
INSERT INTO kullanicilar (ad_soyad, eposta, rol, departman, kayit_tarihi, aktif_mi) VALUES
('Elif Yilmaz',   'elif.yilmaz@demo.com',   'analist',  'Veri Analitigi', '2025-01-12', TRUE),
('Mert Kaya',     'mert.kaya@demo.com',     'yonetici', 'Bilgi Teknolojileri', '2024-11-03', TRUE),
('Zeynep Demir',  'zeynep.demir@demo.com',  'analist',  'Pazarlama', '2025-02-20', TRUE),
('Can Aydin',     'can.aydin@demo.com',     'analist',  'Finans', '2025-03-08', TRUE),
('Ayse Sahin',    'ayse.sahin@demo.com',    'misafir',  'Egitim', '2025-04-15', TRUE),
('Burak Ozturk',  'burak.ozturk@demo.com',  'yonetici', 'Operasyon', '2024-09-22', FALSE),
('Selin Arslan',  'selin.arslan@demo.com',  'analist',  'Veri Analitigi', '2025-05-01', TRUE),
('Deniz Celik',   'deniz.celik@demo.com',   'analist',  'Pazarlama', '2025-05-19', TRUE);

-- -------------------------------------------------------------
-- AI Modelleri
-- -------------------------------------------------------------
INSERT INTO ai_modelleri (model_adi, saglayici, baglam_uzunlugu, girdi_1k_fiyat, cikti_1k_fiyat, aktif_mi) VALUES
('gpt-4o',                     'openai',      128000, 0.0050, 0.0150, TRUE),
('gpt-4o-mini',                'openai',      128000, 0.0002, 0.0006, TRUE),
('Qwen2.5-Coder-32B-Instruct', 'siliconflow',  32768, 0.0007, 0.0007, TRUE),
('deepseek-chat',              'deepseek',     64000, 0.0003, 0.0011, TRUE),
('text-embedding-3-small',     'openai',        8191, 0.0000, 0.0000, TRUE);

-- -------------------------------------------------------------
-- Veri Kaynaklari
-- -------------------------------------------------------------
INSERT INTO veri_kaynaklari (kaynak_adi, db_turu, sunucu, tablo_sayisi, eklenme_tarihi) VALUES
('E-Ticaret Uretim DB', 'postgresql', 'prod-pg-01.demo.local', 24, '2025-01-15'),
('CRM Veritabani',      'mysql',      'crm-mysql.demo.local',  18, '2025-02-02'),
('Finans Raporlama',    'postgresql', 'fin-pg.demo.local',     31, '2025-03-10'),
('Yerel Analiz DB',     'sqlite',     'local-file',             9, '2025-04-01');

-- -------------------------------------------------------------
-- Sorgular (dogal dil sorusu + uretilen SQL)
-- -------------------------------------------------------------
INSERT INTO sorgular (kullanici_id, model_id, kaynak_id, dogal_dil_soru, uretilen_sql, olusturma_zamani) VALUES
(1, 1, 1, 'Gecen ay en cok satan 5 urunu listele',
 'SELECT urun_adi, SUM(adet) AS toplam FROM siparis_detay GROUP BY urun_adi ORDER BY toplam DESC LIMIT 5;',
 '2025-05-20 09:14:00'),
(3, 1, 2, 'Istanbul''daki aktif musteri sayisi nedir',
 'SELECT COUNT(*) FROM musteriler WHERE sehir = ''Istanbul'' AND aktif = true;',
 '2025-05-20 10:02:00'),
(4, 4, 3, 'Bu ceyrek toplam gelir ne kadar',
 'SELECT SUM(tutar) FROM gelirler WHERE tarih >= date_trunc(''quarter'', CURRENT_DATE);',
 '2025-05-21 11:30:00'),
(1, 3, 1, 'Stok seviyesi 10''un altinda olan urunler',
 'SELECT urun_adi, stok FROM urunler WHERE stok < 10 ORDER BY stok ASC;',
 '2025-05-21 14:45:00'),
(7, 1, 1, 'Aylara gore siparis sayisi grafigi',
 'SELECT to_char(tarih,''YYYY-MM'') AS ay, COUNT(*) FROM siparisler GROUP BY ay ORDER BY ay;',
 '2025-05-22 08:20:00'),
(3, 2, 2, 'En cok sikayet alan urun kategorisi',
 'SELECT kategori, COUNT(*) AS sikayet FROM destek_talepleri GROUP BY kategori ORDER BY sikayet DESC LIMIT 1;',
 '2025-05-22 13:10:00'),
(4, 4, 3, 'Departman bazinda ortalama harcama',
 'SELECT departman, AVG(tutar) FROM harcamalar GROUP BY departman;',
 '2025-05-23 09:55:00'),
(5, 2, 4, 'Toplam kullanici sayisi kac',
 'SELECT COUNT(*) FROM kullanicilar;',
 '2025-05-23 16:40:00'),
(7, 1, 1, 'Iadelerin toplam tutari nedir',
 'SELECT SUM(tutar) FROM iadeler WHERE durum = ''onaylandi'';',
 '2025-05-24 10:05:00'),
(8, 3, 2, 'Yeni kayit olan musterilerin haftalik dagilimi',
 'SELECT date_trunc(''week'', kayit_tarihi) AS hafta, COUNT(*) FROM musteriler GROUP BY hafta ORDER BY hafta;',
 '2025-05-24 15:25:00'),
(1, 1, 3, 'En yuksek 3 gider kalemi',
 'SELECT kalem, tutar FROM giderler ORDER BY tutar DESC LIMIT 3;',
 '2025-05-25 11:00:00'),
(3, 4, 1, 'Ortalama sepet tutari ne kadar',
 'SELECT AVG(toplam_tutar) FROM siparisler;',
 '2025-05-25 14:30:00');

-- -------------------------------------------------------------
-- Sorgu Calistirmalari (performans verileri)
-- -------------------------------------------------------------
INSERT INTO sorgu_calistirmalari (sorgu_id, durum, sure_ms, donen_satir, girdi_token, cikti_token, maliyet_usd, hata_mesaji, calistirma_zamani) VALUES
(1,  'basarili',   820, 5,   1240, 180, 0.00890, NULL, '2025-05-20 09:14:02'),
(2,  'basarili',   410, 1,    980, 90,  0.00626, NULL, '2025-05-20 10:02:01'),
(3,  'basarili',   650, 1,    870, 110, 0.00038, NULL, '2025-05-21 11:30:03'),
(4,  'basarili',   540, 7,   1100, 140, 0.00084, NULL, '2025-05-21 14:45:01'),
(5,  'basarili',   930, 12,  1320, 200, 0.00960, NULL, '2025-05-22 08:20:04'),
(6,  'basarili',   480, 1,    760, 85,  0.00020, NULL, '2025-05-22 13:10:01'),
(7,  'hatali',    1200, 0,    910, 0,   0.00027, 'iliski bulunamadi: harcamalar tablosu yok', '2025-05-23 09:55:05'),
(8,  'basarili',   220, 1,    420, 40,  0.00010, NULL, '2025-05-23 16:40:00'),
(9,  'basarili',   600, 1,    880, 95,  0.00062, NULL, '2025-05-24 10:05:02'),
(10, 'basarili',   870, 9,   1150, 175, 0.00081, NULL, '2025-05-24 15:25:03'),
(11, 'zaman_asimi',5000,0,   1010, 0,   0.00505, 'sorgu zaman asimina ugradi (5s)', '2025-05-25 11:00:06'),
(12, 'basarili',   390, 1,    690, 70,  0.00028, NULL, '2025-05-25 14:30:01');

-- -------------------------------------------------------------
-- Geri Bildirimler
-- -------------------------------------------------------------
INSERT INTO geri_bildirimler (sorgu_id, puan, yorum, olusturma_zamani) VALUES
(1,  5, 'Tam istedigim sonuc, cok hizliydi', '2025-05-20 09:20:00'),
(2,  4, 'Dogru ama biraz yavas geldi', '2025-05-20 10:05:00'),
(3,  5, 'Ceyrek hesabi dogru yapilmis', '2025-05-21 11:35:00'),
(4,  4, 'Iyi calisti', '2025-05-21 14:50:00'),
(5,  5, 'Grafik icin ideal cikti', '2025-05-22 08:30:00'),
(7,  2, 'Tablo adini yanlis anladi', '2025-05-23 10:00:00'),
(9,  4, 'Sonuc dogru', '2025-05-24 10:10:00'),
(11, 1, 'Sorgu hic calismadi, zaman asimi', '2025-05-25 11:10:00'),
(12, 5, 'Ortalama tam tutuyor', '2025-05-25 14:35:00');
