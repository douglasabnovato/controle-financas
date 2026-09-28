-- Schema do controle-financas (idempotente: pode rodar a cada deploy)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    nickname VARCHAR(100) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    profile_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS receipts (
    id SERIAL PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(50),
    purchase_date TIMESTAMP NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    raw_transcription JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id INTEGER REFERENCES receipts(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_receipts_profile_date ON receipts (profile_id, purchase_date DESC);
CREATE INDEX IF NOT EXISTS idx_products_receipt ON products (receipt_id);
-- Deduplicação: se já existirem cupons repetidos no banco, o índice não é criado (e o log avisa)
DO $$
BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS uq_receipts_dedupe
        ON receipts (profile_id, coalesce(cnpj, ''), purchase_date, total_amount);
EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'uq_receipts_dedupe não criado: há cupons duplicados; remova-os e reinicie';
END $$;
