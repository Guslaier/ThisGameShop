import 'dotenv/config';
import { Client } from "pg";

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_POSTGRES,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function setupDatabase() {
  await client.connect();

  // ✅ สร้าง database ถ้ายังไม่มี
  try {
    await client.query(`CREATE DATABASE "ThisGameShop"`);
    console.log("✅ Created database: ThisGameShop");
  } catch (e) {
    console.log("ℹ️ Database already exists:", e.message);
  }

  await client.end();

  // ✅ เชื่อมต่อไปยัง DB ที่สร้าง
  const db = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  await db.connect();

  // ✅ สร้าง schema พร้อมใช้ src แทน BYTEA
  await db.query(`
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ✅ USERS
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'user',
  profile_image VARCHAR(255), -- 🔹 เก็บ URL หรือ path เช่น '/images/profile1.jpg'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- ✅ GAMES
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description_md TEXT,
  release_date DATE,
  stock_managed INT DEFAULT 0,
  platform_flags VARCHAR(100),
  image_poster VARCHAR(255), -- 🔹 เก็บ URL เช่น '/images/eldenring.jpg'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- ✅ GAME_IMG
CREATE TABLE IF NOT EXISTS game_img (
  id SERIAL PRIMARY KEY,
  game_id INT REFERENCES games(id) ON DELETE CASCADE,
  title VARCHAR(255),
  scr VARCHAR(255), -- 🔹 เก็บ path ของรูปเพิ่มเติม
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- ✅ PRICES
CREATE TABLE IF NOT EXISTS prices (
  id SERIAL PRIMARY KEY,
  game_id INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  amount_cents INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- ✅ CARTS
CREATE TABLE IF NOT EXISTS carts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- ✅ CART_ITEMS
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  game_id INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  qty INT DEFAULT 1,
  unit_price_cents INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- ✅ ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_no VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(50) DEFAULT 'pending',
  total_cents INT,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- ✅ ORDER_ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  game_id INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  qty INT DEFAULT 1,
  unit_price_cents INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- ✅ LIBRARY_ITEMS
CREATE TABLE IF NOT EXISTS library_items (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  order_item_id INT NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cd_key VARCHAR(255),
  deleted_at TIMESTAMP NULL
);

-- ✅ Trigger สำหรับ updated_at
DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
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


ALTER TABLE cart_items ADD CONSTRAINT cart_items_unique_cart_game UNIQUE (cart_id, game_id);
ALTER TABLE carts ADD CONSTRAINT unique_user_cart UNIQUE (user_id);

-- ✅ สร้าง admin เริ่มต้น
INSERT INTO users (email, password_hash, display_name, role, profile_image)
VALUES ('admin@example.com', crypt('adminCS', gen_salt('bf')), 'GOOL', 'admin', '/images/uploads/image-1759609033348-854689220.jpg')
ON CONFLICT (email) DO NOTHING;


  `);

  console.log("🎮 Database setup complete (uses src for images)!");
  await db.end();
}

setupDatabase();
