import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const eventDb = await mysql.createPool({
  host: process.env.EVENT_DB_HOST,
  port: process.env.EVENT_DB_PORT,
  user: process.env.EVENT_DB_USER,
  password: process.env.EVENT_DB_PASSWORD,
  database: process.env.EVENT_DB_NAME,
});

export default eventDb;
