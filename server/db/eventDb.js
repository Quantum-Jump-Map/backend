import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

let pool = null;

export async function waitForDB(maxRetries = 10, delayMs = 3000) {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME_EVENT
      });

      await conn.ping();
      console.log('DB 연결 성공');
      await conn.end();
      return;
    } catch (err) {
      retries++;
      console.log(`DB 연결 재시도 (${retries}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw new Error('DB 연결 실패: 재시도 횟수 초과');
}

export async function get_db_pool()
{
  
  await waitForDB();

  if(pool==null){
  
    pool = await mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME_EVENT
    });
  }

  return pool;
}


