import db from '../db/userDb.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { makeToken } from '../JWT/token.js';

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
    const token = makeToken(user);

    res.status(200).json({
      token: res.locals.newToken,
      message: '로그인 성공'
    });
  } catch (err) {
    console.error('로그인 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
}

export async function editUser(req, res){   //사용자 정보 수정
  const {password, new_password, email,
    birth_date, gender} = req.body;
  
  const username = req.user.username;

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username=?', [username]);

    if(rows.length==0) {
      return res.status(400).json( {error: '존재하지 않는 아이디'});
    } 

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch || req.user.id != user.id) {
      return res.status(400).json({ error: '잘못된 비밀번호'});
    }

    const new_hashed_password = bcrypt.hash(new_password=='' ? password: new_password);

    await db.query('UPDATE users SET password=?, email=?, birth_date=?, gender=? WHERE id=?',
      [new_hashed_password, email, birth_date, gender, user.id]);

    res.status(200).json({
      token: res.locals.newToken,
      message: '회원 정보 수정 완료'
    });
  
    } catch (err){
        console.error("오류: ", err);
        res.status(500).json({error: '오류 발생'});
    }
}


export async function deleteUser(req, res) {    //사용자 정보 삭제 (는 수정 예정)
  const {username, password} = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username=?', [username]);

    if(rows.length==0) {
      return res.status(400).json( {error: '존재하지 않는 아이디'});
    } 

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) {
      return res.status(400).json({ error: '잘못된 비밀번호'});
    }


    await db.query('DELTE FROM users where id=?', [user.id]);

    res.status(200).json({message: '회원 정보 삭제제 완료'});
  
    } catch (err){
        console.error("오류: ", err);
        res.status(500).json({error: '오류 발생'});
    }
}


export async function getUser(req, res) {

  const {req_password} = req.user;
  username = req.user.username;

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username=?', [username]);

    if(rows.length==0) {
      return res.status(400).json( {error: '존재하지 않는 아이디'});
    } 

    const user = rows[0];

    const isMatch = await bcrypt.compare(req_password, user.password);

    if(!isMatch || req.user.id != user.id) {
      return res.status(400).json({ error: '잘못된 비밀번호'});
    }

    res.status(200).json({
      token: res.locals.newToken,
      user: {
        id: user.username,
        password: req_password,
        name: user.name,
        email: user.email,
        birth_date: user.birth_date,
        gender: user.gender
      }
     });
  
    } catch (err){
        console.error("오류: ", err);
        res.status(500).json({error: '오류 발생'});
    }
}
