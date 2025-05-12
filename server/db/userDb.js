import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const userDb = await mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME_USER
});

export default userDb;
