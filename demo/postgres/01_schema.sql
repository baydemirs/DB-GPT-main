-- =============================================================
-- demo_ai_database - SEMA
-- Konu: AI destekli veritabani sorgulama ve analiz sistemi
-- =============================================================
-- Bu dosya, Postgres konteyneri ilk acildiginda otomatik calisir
-- (docker-compose.demo.yml icindeki initdb mount sayesinde).
-- Tablolarda Turkce COMMENT'ler var; DB-GPT bu aciklamalari
-- okuyup daha isabetli SQL uretir.
-- =============================================================

-- -------------------------------------------------------------
-- 1) Kullanicilar (sistemi kullanan analistler / roller)
-- -------------------------------------------------------------
CREATE TABLE kullanicilar (
    kullanici_id   SERIAL PRIMARY KEY,
    ad_soyad       VARCHAR(120) NOT NULL,
    eposta         VARCHAR(160) UNIQUE NOT NULL,
    rol            VARCHAR(40)  NOT NULL,          -- analist / yonetici / misafir
    departman      VARCHAR(80),
    kayit_tarihi   DATE NOT NULL DEFAULT CURRENT_DATE,
    aktif_mi       BOOLEAN NOT NULL DEFAULT TRUE
);
COMMENT ON TABLE  kullanicilar IS 'Sistemi kullanan analist ve yoneticiler';
COMMENT ON COLUMN kullanicilar.rol IS 'Kullanici rolu: analist, yonetici veya misafir';
COMMENT ON COLUMN kullanicilar.departman IS 'Kullanicinin calistigi departman';

-- -------------------------------------------------------------
-- 2) AI Modelleri (sorgu uretiminde kullanilan LLM'ler)
-- -------------------------------------------------------------
CREATE TABLE ai_modelleri (
    model_id        SERIAL PRIMARY KEY,
    model_adi       VARCHAR(100) NOT NULL,         -- gpt-4o, qwen2.5-coder vb.
    saglayici       VARCHAR(60)  NOT NULL,         -- openai, siliconflow, deepseek
    baglam_uzunlugu INTEGER,                        -- token cinsinden
    girdi_1k_fiyat  NUMERIC(10,4),                 -- 1000 token girdi maliyeti (USD)
    cikti_1k_fiyat  NUMERIC(10,4),                 -- 1000 token cikti maliyeti (USD)
    aktif_mi        BOOLEAN NOT NULL DEFAULT TRUE
);
COMMENT ON TABLE  ai_modelleri IS 'Dogal dilden SQL uretiminde kullanilan yapay zeka modelleri';
COMMENT ON COLUMN ai_modelleri.saglayici IS 'Model saglayicisi (openai, siliconflow, deepseek)';
COMMENT ON COLUMN ai_modelleri.girdi_1k_fiyat IS '1000 girdi token basina maliyet (USD)';

-- -------------------------------------------------------------
-- 3) Veri Kaynaklari (DB-GPT'ye baglanan is veritabanlari)
-- -------------------------------------------------------------
CREATE TABLE veri_kaynaklari (
    kaynak_id     SERIAL PRIMARY KEY,
    kaynak_adi    VARCHAR(100) NOT NULL,
    db_turu       VARCHAR(40)  NOT NULL,           -- postgresql, mysql, sqlite
    sunucu        VARCHAR(160),
    tablo_sayisi  INTEGER,
    eklenme_tarihi DATE NOT NULL DEFAULT CURRENT_DATE
);
COMMENT ON TABLE  veri_kaynaklari IS 'Sisteme baglanan ve uzerinde sorgu yapilan veritabanlari';
COMMENT ON COLUMN veri_kaynaklari.db_turu IS 'Veritabani turu: postgresql, mysql veya sqlite';

-- -------------------------------------------------------------
-- 4) Sorgular (kullanicinin dogal dil sorusu + uretilen SQL)
-- -------------------------------------------------------------
CREATE TABLE sorgular (
    sorgu_id        SERIAL PRIMARY KEY,
    kullanici_id    INTEGER NOT NULL REFERENCES kullanicilar(kullanici_id),
    model_id        INTEGER NOT NULL REFERENCES ai_modelleri(model_id),
    kaynak_id       INTEGER NOT NULL REFERENCES veri_kaynaklari(kaynak_id),
    dogal_dil_soru  TEXT NOT NULL,                 -- "Gecen ay en cok satan urunler"
    uretilen_sql    TEXT,                          -- AI'nin urettigi SQL
    olusturma_zamani TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE  sorgular IS 'Kullanicilarin dogal dille sordugu sorular ve AI tarafindan uretilen SQL';
COMMENT ON COLUMN sorgular.dogal_dil_soru IS 'Kullanicinin Turkce dogal dil sorusu';
COMMENT ON COLUMN sorgular.uretilen_sql IS 'Yapay zekanin urettigi SQL ifadesi';

-- -------------------------------------------------------------
-- 5) Sorgu Calistirma Kayitlari (performans + token + durum)
-- -------------------------------------------------------------
CREATE TABLE sorgu_calistirmalari (
    calistirma_id    SERIAL PRIMARY KEY,
    sorgu_id         INTEGER NOT NULL REFERENCES sorgular(sorgu_id),
    durum            VARCHAR(30) NOT NULL,         -- basarili / hatali / zaman_asimi
    sure_ms          INTEGER,                       -- toplam yanit suresi (ms)
    donen_satir      INTEGER,                       -- sonuc satir sayisi
    girdi_token      INTEGER,
    cikti_token      INTEGER,
    maliyet_usd      NUMERIC(10,5),
    hata_mesaji      TEXT,
    calistirma_zamani TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE  sorgu_calistirmalari IS 'Her sorgunun calisma performansi, token kullanimi ve sonucu';
COMMENT ON COLUMN sorgu_calistirmalari.durum IS 'Sonuc durumu: basarili, hatali veya zaman_asimi';
COMMENT ON COLUMN sorgu_calistirmalari.sure_ms IS 'Sorgu toplam yanit suresi (milisaniye)';

-- -------------------------------------------------------------
-- 6) Geri Bildirimler (kullanicinin sonuca verdigi puan)
-- -------------------------------------------------------------
CREATE TABLE geri_bildirimler (
    bildirim_id   SERIAL PRIMARY KEY,
    sorgu_id      INTEGER NOT NULL REFERENCES sorgular(sorgu_id),
    puan          SMALLINT CHECK (puan BETWEEN 1 AND 5),
    yorum         TEXT,
    olusturma_zamani TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE  geri_bildirimler IS 'Kullanicilarin uretilen SQL ve sonuca verdigi 1-5 puan ve yorum';
COMMENT ON COLUMN geri_bildirimler.puan IS 'Memnuniyet puani (1 dusuk - 5 yuksek)';

-- -------------------------------------------------------------
-- Performans icin indeksler
-- -------------------------------------------------------------
CREATE INDEX idx_sorgular_kullanici ON sorgular(kullanici_id);
CREATE INDEX idx_sorgular_model     ON sorgular(model_id);
CREATE INDEX idx_calistirma_sorgu   ON sorgu_calistirmalari(sorgu_id);
CREATE INDEX idx_calistirma_durum   ON sorgu_calistirmalari(durum);
