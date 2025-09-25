import { Client } from 'pg';

const client = new Client({
user: 'postgres', // เปลี่ยนตามชื่อ user ของคุณ
host: 'localhost',

database: 'ThisGameShop', // เปลี่ยนตามชื่อฐานข้อมูลของคุณ
password: '2547', // ใส่รหัสผ่านของ user postgres ที่คุณตั้งไว้
port: 5432,
});

client.connect()
.then(() => console.log('Connected to PostgreSQL'))
.catch(err => console.error('Connection error', err.stack));

class Query{
    async QQuery (statment) {
    try {
        const res = await client.query(statment
        );
        console.log('User Query:', res);
        return res
    } catch (err) {
        console.error('Error Query:', err);
    }
};

}

export default  new Query();