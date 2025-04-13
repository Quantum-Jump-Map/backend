import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());

const db = await mysql.createPool({
  host: process.env.APP_DB_HOST,
  port: process.env.APP_DB_PORT,
  user: process.env.APP_DB_USER,
  password: process.env.APP_DB_PASSWORD,
  database: process.env.APP_DB_NAME,
});

app.post('/comments', async (req, res) => {
  const { user_id, content, posted_at, road_name } = req.body;
  try {
    const query = `INSERT INTO comments (user_id, content, posted_at, road_name)
                   VALUES (?, ?, ?, ?)`;
    await db.execute(query, [user_id, content, posted_at, road_name]);
    res.status(201).json({ message: '댓글이 저장되었습니다.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '댓글 저장 실패' });
  }
});

app.get('/comments', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM comments ORDER BY id DESC');
  res.json(rows);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0,0,0,0',() => {
  console.log(`🚀 처리 서버 실행 중: http://localhost:${PORT}`);
});
