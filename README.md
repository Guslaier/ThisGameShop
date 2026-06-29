# ThisGameShop

A full-stack e-commerce web application for browsing and buying digital games. Built entirely with Node.js, Express, and PostgreSQL without relying on heavy frontend frameworks. It includes a complete user authentication system and a dedicated admin dashboard.

## Tech Stack
- Node.js
- Express
- PostgreSQL
- EJS (Template Engine)
- Docker & Docker Compose (for deployment)

## Core Features
- **Storefront**: Browse games by platform, filter, and sort by price or stock.
- **Cart & Checkout**: Add items to the cart and place orders.
- **User System**: Secure registration and login, password recovery via OTP (Nodemailer), and a personal game library.
- **Admin Panel**: Manage inventory (add/edit/delete games + image uploads), view revenue/stock reports, and manage user accounts.

## How to run the project

First, clone the repo and set up your environment variables:
```bash
cp .env.sample .env
```
*Don't forget to update your database credentials and email settings (for OTP) in the `.env` file.*

### The Easy Way (Docker)
If you have Docker installed, the fastest way to get everything running is:
```bash
docker-compose up -d --build
```
This spins up both the Node server and the Postgres database. The app will be available at `http://localhost:4000`.

### The Manual Way
If you prefer running it locally without Docker:
1. Install dependencies:
   ```bash
   npm install
   ```
2. Make sure your local Postgres server is running and matches the credentials in `.env`.
3. Create the database, tables, and seed sample data by running:
   ```bash
   node makedatabase.js
   node insart_game.js
   ```
4. Start the server:
   ```bash
   npm run start
   # or use 'npm run dev' for nodemon
   ```