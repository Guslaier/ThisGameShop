import 'dotenv/config';
import { Client } from 'pg';

const client = new Client({
user: process.env.DB_USER,
host: process.env.DB_HOST,
database: process.env.DB_NAME,
password: process.env.DB_PASSWORD,
port: process.env.DB_PORT,
});

client.connect()
.then(() => console.log('Connected to PostgreSQL'))
.catch(err => console.error('Connection error', err.stack));

class Query {
  async QQuery(sql, params = []) {
    try {
      const rows = await client.query(sql, params);
      return rows; // คืนเฉพาะ rows
    } catch (err) {
      console.error("Error Query:", err);
    }
  }
  
}

export default  new Query();