import db from '../db/userDb.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();


// ✅ [1] 회원가입
export async function registerUser(req, res) {
  const { username, password, name, email, birth_date, gender } = req.body;

  if (!username || !password || !name || !email || !birth_date || !gender) {
    return res.status(400).json({ error: '모든 항목을 입력해주세요.' });
  }

  try {
    // 사용자 중복 확인
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
      return res.status(409).json({ error: '이미 존재하는 아이디입니다.' });
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // DB에 사용자 저장
    await db.query(`
      INSERT INTO users (username, password, name, email, birth_date, gender)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [username, hashedPassword, name, email, birth_date, gender]
    );

    res.status(201).json({ message: '회원가입 성공' });
  } catch (err) {
    console.error('회원가입 에러:', err);
    res.status(500).json({ error: '서버 오류' });
  }
}


// ✅ [2] 로그인 + JWT 발급
export async function loginUser(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '아이디와 비밀번호를 입력해주세요.' });
  }

  try {
    // 사용자 조회
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(404).json({ error: '존재하지 않는 아이디입니다.' });
    }

    const user = rows[0];

    // 비밀번호 비교
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
    }

    // JWT 발급
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      message: '로그인 성공',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        birth_date: user.birth_date,
        gender: user.gender
      }
    });
  } catch (err) {
    console.error('로그인 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
}
