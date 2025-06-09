import db from '../db/userDb.js';
import commentdb from '../db/appDb.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { makeToken } from '../JWT/token.js';

dotenv.config();


// 회원가입
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


// 로그인 JWT 발급
export async function loginUser(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '아이디와 비밀번호를 입력해주세요.' });
  }

  try {
    // 사용자 조회
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      console.log("no id Exists");
      return res.status(404).json({ error: '존재하지 않는 아이디입니다.' });
    }

    const user = rows[0];

    // 비밀번호 비교
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Wrong password");
      return res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
    }

    // JWT 발급
    const token = await makeToken(user);
    console.log("로그인 성공!");

    res.status(200).json({
      token: token,
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
      console.log("No user exists");
      return res.status(400).json( {error: '존재하지 않는 아이디'});
    } 

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch || req.user.id != user.id) {
      console.log("wrong password");
      return res.status(400).json({ error: '잘못된 비밀번호'});
    }

    const new_hashed_password = await bcrypt.hash(!new_password ? password: new_password, 10);

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


export async function getUser(req, res) {   //사용자 정보 가져오기(본인)

  const {password} = req.body;
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

    res.status(200).json({
      token: res.locals.newToken,
      user: {
        id: user.username,
        password: password,
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

export async function followUser(req, res) {  //사용자 팔로우 / 취소 
  
  try{

    const {followee_username} = req.body;

    if(!followee_username)
    {
      console.log("error: no user defined");
      res.status(401).json({
        error: "no user defined"
      });

      return;
    }

    const [followee_id_temp] = await db.query('SELECT id FROM users WHERE username=?',[followee_username]);

    if(followee_id_temp.length==0)
    {
      console.log("error: no user found");
      res.status(401).json({
      error: "no user found"
      });

      return;
    }

    const followee_id = followee_id_temp[0]?.id;

    if(followee_id === req.user.id)
    {
      console.log("error: Following oneself is prohibited");
      res.status(401).json({
      error: "following oneself is prohibited"
    });
      return;
    }


    const [rows] = await db.query('SELECT * from follows WHERE follower_id=? AND followee_id=?', [req.user.id, followee_id]);
  
    if(rows.length==0) //팔로우 하기
    {
      await db.query('INSERT INTO follows (follower_id, followee_id) VALUES(?,?)', [req.user.id, followee_id]);
      await db.query('UPDATE users SET follower_count=follower_count+1 WHERE id=?', [followee_id]);
      await db.query('UPDATE users SET followee_count=followee_count+1 WHERE id=?', [req.user.id]);
      console.log(`follow done: ${req.user.id} => ${followee_id}`);
      res.status(201).json({
        message: "followed",
        token: res.locals.newToken
      });
    }

    else   //팔로우 취소
    {
      await db.query('DELETE FROM follows WHERE follower_id=? AND followee_id=?', [req.user.id, followee_id]);
      await db.query('UPDATE users SET follower_count=follower_count-1 WHERE id=?', [followee_id]);
      await db.query('UPDATE users SET followee_count=followee_count-1 WHERE id=?', [req.user.id]);
      console.log(`unfollowed: ${req.user.id} => ${followee_id}`);
      res.status(201).json({
        message: "unfollowed",
        token: res.locals.newToken
      });
    }
  }catch(err){

    console.error("error: ", err);
    return;
  }

}

export async function getProfile(req, res){   //사용자 프로필 가져오기 

  try{
    const {username} = req.query;

    if(!username) //사용자 입력이 없을 때
    {
      console.log("no user defined");
      res.status(401).json({
        "message": "no user defined"
      });
      return;
    }

    console.log(username); //디버깅용 

    const [user_rows] = await db.query('SELECT * FROM users WHERE username=?', [username]);  //사용자 정보 DB 조회

    if(user_rows.length==0)   //조회된 사용자가 없을때 
    {
      console.log("no user searched");
      res.status(401).json({
        "message": "no user searched"
      });

      return;
    }

    const user_info = user_rows[0];   //사용자 정보 

    const [comments_rows] = await commentdb.query(
      `SELECT c.content AS comment, c.like_count, c.created_at AS posted_at, a.lat AS mapx, a.lng AS mapy
        FROM comments c
        JOIN app_db.addresses a ON c.address_id=a.id
        WHERE c.user_id=?
        ORDER BY c.created_at DESC
        LIMIT 10`, [user_info.id]);

    res.status(201).json({
      token: res.locals.newToken,
      follower_count: user_info.follower_count,
      followee_count: user_info.followee_count,
      total_like_count: user_info.total_like_count,
      total_comment_count: user_info.total_comment_count,
      profile_comment: user_info.profile_comment,
      comments: comments_rows,
      comment_offset: comments_rows.length
    });

  } catch(err) {
    
    console.error("에러: ", err);
    res.status(501).json({
      error: err
    });
    return;
  }
}


export async function reloadProfile(req, res)
{
  try{
    const {username, current_offset} = req.query;
    if(!username)
    {
      console.log("username not defined");
      res.status(401).json({
        message: "username not defined"
      });

      return;
    }

    const current_offset_t = parseInt(current_offset);

    const [user_rows] = await db.query('SELECT * FROM users WHERE username=?',[username]);

    if(user_rows.length==0)
    {
      console.log("no user searched");
      res.status(401).json({
        message: "no user searched"
      });

      return;
    }

    const user_info = user_rows[0];

    const [comments_rows] = await commentdb.query(
      `SELECT c.content AS comment, c.like_count, c.created_at AS posted_at, a.lat AS mapx, a.lng AS mapy
        FROM comments c
        JOIN app_db.addresses a ON c.address_id=a.id
        WHERE c.user_id=?
        ORDER BY c.created_at DESC
        LIMIT 10
        OFFSET ?`,
    [user_info.id, current_offset_t]);

    res.status(201).json(
      {
        comments_offset: current_offset_t+comments_rows.length,
        comments: comments_rows,
        token: res.locals.newToken
      }
    );

  } catch(err){
    
    console.error("error: ", err);
    res.status(501).json({
      error: err
    });

    return;
  }

}

export async function searchUsers(req, res)
{
  try{
    const {username} = req.query;

    if(!username || username.length<2)
    {
      console.log("error: no username or field less than 2");
      res.status(400).json({
        token: res.locals.newToken,
        error: "검색어는 최소 2글자 이상"
      });

      return;
    }

    const currentUserId = req.user.id;
    const searchPattern = `%${username}%`;

    const [result] = await db.query(`
      SELECT id, username, profile_comment, follower_count, total_like_count
      FROM users
      WHERE username LIKE ? AND id !=?
      ORDER BY follower_count DESC, total_like_count DESC
      LIMIT 20`, [searchPattern, currentUserId] );

    res.status(200).json({
        token: res.locals.newToken,
        users: result,
        count: result.length
    });

    return;

  } catch(err){
    console.error("error: ", err);
    res.status(500).json({
      error: err
    });
  }
}

export async function updateProfileComment(req, res)
{
  try{
    const {profile_comment} = req.body;
    const userId = req.user.id;

    if(profile_comment && profile_comment.length > 200){
      return res.status(400).json({
        error: "profile comment length over 200"
      });
    }

    await db.query(`
      UPDATE users
      SET profile_comment = ? 
      WHERE id = ?`, [profile_comment, userId]);

    res.status(200).json({
      token: res.locals.newToken,
      message: "updated profile comment",
      profile_comment: profile_comment
    });

  } catch(err) {
    console.error("error: ", err);
    res.status(500).json({
      error: err
    });
  }
}

export async function getFollowStatus(req, res)
{
  try{
    const {username} = req.query;
    const currentUserId = req.user.id;

    if(!username)
    {
      console.log("error: no username");
      return res.status(400).json({
        error: "username required"
      });
    }

    const [user] = await db.query(`
      SELECT id FROM users
      WHERE username=?`, [username]);

    if(user.length===0)
    {
      console.log("error: no user searched");
      return res.status(404).json({
        error: "no user found"
      });
    }

    const user_t = user[0].id;

    if(currentUserId===user_t)
    {
      return res.status(200).json({
        is_following: false,
        is_self: true,
        token: res.locals.newToken
      });
    }

    const [follow] = await db.query(`
      SELECT id
      FROM follows
      WHERE follower_id=? AND followee_id=?`, [currentUserId, user_t]);

    res.status(200).json({
      is_following: follow.length >0,
      is_self: false,
      token: res.locals.newToken
    });

  } catch(err){
    console.error("error: ", err);
    res.status(500).json({
      error: err
    });
  }
}

export async function getFollowersList(req, res) {   // 팔로워 목록 조회 API
  try {
    const { username, offset = 0 } = req.query;
    const offsetInt = parseInt(offset);

    if (!username) {
      return res.status(400).json({
        error: "사용자 이름이 필요합니다."
      });
    }

    const [user] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (user.length === 0) {
      console.log("error: no user found");
      return res.status(404).json({
        error: "사용자를 찾을 수 없습니다."
      });
    }

    const targetUserId = user[0].id;

    const [followers] = await db.query(`
      SELECT u.id, u.username, u.profile_comment, u.follower_count, u.total_like_count
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.followee_id = ?
      LIMIT 20 OFFSET ?
    `, [targetUserId, offsetInt]);

    res.status(200).json({
      followers: followers,
      count: followers.length,
      offset: offsetInt + followers.length,
      token: res.locals.newToken
    });

  } catch (err) {
    console.error("팔로워 목록 조회 오류:", err);
    res.status(500).json({
      error: "서버 오류"
    });
  }
}

export async function getFollowingList(req, res) {   // 팔로잉 목록 조회 API
  try {
    const { username, offset = 0 } = req.query;
    const offsetInt = parseInt(offset);

    if (!username) {
      return res.status(400).json({
        error: "사용자 이름이 필요합니다."
      });
    }

    const [user] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (user.length === 0) {
      return res.status(404).json({
        error: "사용자를 찾을 수 없습니다."
      });
    }

    const targetUserId = user[0].id;

    const [following] = await db.query(`
      SELECT u.id, u.username, u.profile_comment, u.follower_count, u.total_like_count,
      FROM follows f
      JOIN users u ON f.followee_id = u.id
      WHERE f.follower_id = ?
      LIMIT 20 OFFSET ?
    `, [targetUserId, offsetInt]);

    res.status(200).json({
      following: following,
      count: following.length,
      offset: offsetInt + following.length,
      token: res.locals.newToken
    });

  } catch (err) {
    console.error("팔로잉 목록 조회 오류:", err);
    res.status(500).json({
      error: "서버 오류"
    });
  }
}