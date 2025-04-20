import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const userDb = await mysql.createPool({
  host: process.env.USER_DB_HOST,
  port: process.env.USER_DB_PORT,
  user: process.env.USER_DB_USER,
  password: process.env.USER_DB_PASSWORD,
  database: process.env.USER_DB_NAME,
});

export default userDb;
