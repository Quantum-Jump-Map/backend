import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

export async function get_db_pool()
{
  let pool;
  
  if(!pool){
  
    const pool = await mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME_EVENT
    });
  }

  return pool;
}


