import { Client } from "pg";  // ถ้าใช้ PostgreSQL
// import mysql from "mysql2/promise"; // ถ้าใช้ MySQL

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "postgres", // เริ่มจาก default db
  password: "1234",
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
    password: "1234",
    port: 5432,
  });

  await db.connect();

  // สร้าง table (ใส่โค้ด schema ที่ผมให้ไป)
  await db.query(`
CREATE TABLE IF NOT EXISTS USERS (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    role VARCHAR(50),
    profile_image BYTEA, -- เก็บรูปภาพเป็น binary
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS GAMES (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description_md TEXT,
    release_date DATE,
    stock_managed BOOLEAN DEFAULT TRUE,
    platform_flags VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_poster BYTEA  -- เก็บรูปภาพเป็น binary
);

CREATE TABLE IF NOT EXISTS Game_img (
    id SERIAL PRIMARY KEY,
    game_id INT REFERENCES GAMES(id) ON DELETE CASCADE,
    title VARCHAR(255),
    scr BYTEA  -- เก็บรูปภาพเป็น binary
);

CREATE TABLE IF NOT EXISTS PRICES (
    id SERIAL PRIMARY KEY,
    game_id INT NOT NULL REFERENCES GAMES(id) ON DELETE CASCADE,
    amount_cents INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS CARTS (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES USERS(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS CART_ITEMS (
    id SERIAL PRIMARY KEY,
    cart_id INT NOT NULL REFERENCES CARTS(id) ON DELETE CASCADE,
    game_id INT NOT NULL REFERENCES GAMES(id) ON DELETE CASCADE,
    qty INT DEFAULT 1,
    unit_price_cents INT NOT NULL
);

CREATE TABLE IF NOT EXISTS ORDERS (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES USERS(id) ON DELETE CASCADE,
    order_no VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    total_cents INT
);

CREATE TABLE IF NOT EXISTS ORDER_ITEMS (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES ORDERS(id) ON DELETE CASCADE,
    game_id INT NOT NULL REFERENCES GAMES(id) ON DELETE CASCADE,
    qty INT DEFAULT 1,
    unit_price_cents INT NOT NULL
);

CREATE TABLE IF NOT EXISTS LIBRARY_ITEMS (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES USERS(id) ON DELETE CASCADE,
    game_id INT NOT NULL REFERENCES GAMES(id) ON DELETE CASCADE,
    order_item_id INT NOT NULL REFERENCES ORDER_ITEMS(id) ON DELETE CASCADE,
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cd_key VARCHAR(255)
);

CREATE EXTENSION IF NOT EXISTS pgcrypto;

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