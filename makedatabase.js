import { Client } from "pg";  // ถ้าใช้ PostgreSQL
// import mysql from "mysql2/promise"; // ถ้าใช้ MySQL

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "postgres", // เริ่มจาก default db
  password: "2547",
  port: 5432,
});

async function setupDatabase() {
  await client.connect();

  // สร้าง database
  await client.query(`CREATE DATABASE "ThisGameShop"`).catch(() =>
    console.log("Database already exists")
  );

  await client.end();

  // connect เข้า DB ที่เพิ่งสร้าง
  const db = new Client({
    user: "postgres",
    host: "localhost",
    database: "ThisGameShop",
    password: "2547",
    port: 5432,
  });

  await db.connect();

  // สร้าง table (ใส่โค้ด schema ที่ผมให้ไป)
  await db.query(`
-- 🧩 เปิดใช้ extension สำหรับเข้ารหัส password
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 🧠 ฟังก์ชันอัปเดตเวลา updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 🗑 ฟังก์ชัน Soft Delete (แทนการลบจริง)
CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
  NEW.deleted_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 🧍 USERS
CREATE TABLE IF NOT EXISTS USERS (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    profile_image BYTEA,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- 🕹️ GAMES
CREATE TABLE IF NOT EXISTS GAMES (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description_md TEXT,
    release_date DATE,
    stock_managed INT DEFAULT 0,
    platform_flags VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    image_poster BYTEA
);

-- 📸 GAME_IMG
CREATE TABLE IF NOT EXISTS GAME_IMG (
    id SERIAL PRIMARY KEY,
    game_id INT REFERENCES GAMES(id) ON DELETE CASCADE,
    title VARCHAR(255),
    scr BYTEA,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- 💰 PRICES
CREATE TABLE IF NOT EXISTS PRICES (
    id SERIAL PRIMARY KEY,
    game_id INT NOT NULL REFERENCES GAMES(id) ON DELETE CASCADE,
    amount_cents INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- 🛒 CARTS
CREATE TABLE IF NOT EXISTS CARTS (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES USERS(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- 🧾 CART_ITEMS
CREATE TABLE IF NOT EXISTS CART_ITEMS (
    id SERIAL PRIMARY KEY,
    cart_id INT NOT NULL REFERENCES CARTS(id) ON DELETE CASCADE,
    game_id INT NOT NULL REFERENCES GAMES(id) ON DELETE CASCADE,
    qty INT DEFAULT 1,
    unit_price_cents INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- 📦 ORDERS
CREATE TABLE IF NOT EXISTS ORDERS (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES USERS(id) ON DELETE CASCADE,
    order_no VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    total_cents INT,
    deleted_at TIMESTAMP NULL
);

-- 🎮 ORDER_ITEMS
CREATE TABLE IF NOT EXISTS ORDER_ITEMS (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES ORDERS(id) ON DELETE CASCADE,
    game_id INT NOT NULL REFERENCES GAMES(id) ON DELETE CASCADE,
    qty INT DEFAULT 1,
    unit_price_cents INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- 🧩 LIBRARY_ITEMS
CREATE TABLE IF NOT EXISTS LIBRARY_ITEMS (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES USERS(id) ON DELETE CASCADE,
    game_id INT NOT NULL REFERENCES GAMES(id) ON DELETE CASCADE,
    order_item_id INT NOT NULL REFERENCES ORDER_ITEMS(id) ON DELETE CASCADE,
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cd_key VARCHAR(255),
    deleted_at TIMESTAMP NULL
);

-- ⚙️ TRIGGER: updated_at อัตโนมัติ
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name NOT LIKE 'pg_%'
      AND table_name NOT LIKE 'sql_%'
  LOOP
    EXECUTE format(
      'CREATE TRIGGER %I_update_timestamp
       BEFORE UPDATE ON %I
       FOR EACH ROW
       WHEN (OLD.* IS DISTINCT FROM NEW.*)
       EXECUTE FUNCTION update_timestamp();', tbl, tbl
    );
  END LOOP;
END$$;

-- ⚙️ TRIGGER: Soft Delete (แทนการลบจริง)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name NOT LIKE 'pg_%'
      AND table_name NOT LIKE 'sql_%'
  LOOP
    EXECUTE format(
      'CREATE TRIGGER %I_soft_delete
       BEFORE DELETE ON %I
       FOR EACH ROW
       EXECUTE FUNCTION soft_delete();', tbl, tbl
    );
  END LOOP;
END$$;

INSERT INTO users (email, password_hash, display_name, role) 
VALUES (
  'admin@example.com', 
  crypt('adminCS', gen_salt('bf')), 
  'GOOL', 
  'admin'
);

  `);

  // TODO: ใส่ CREATE TABLE อื่น ๆ ตาม diagram

  console.log("✅ Database setup complete!");
  await db.end();
}

setupDatabase();