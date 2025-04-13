const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// MySQL 대신 메모리 데이터베이스 사용
// const mysql = require('mysql2/promise');
const { body, validationResult } = require('express-validator');

// 환경 변수 로드
dotenv.config();

// 앱 초기화
const app = express();

// 미들웨어
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// 메모리 데이터베이스 (MySQL 대체)
const db = {
  users: [],
  cities: [
    { city_id: 1, city_name: '서울특별시' }
  ],
  districts: [
    { district_id: 1, city_id: 1, district_name: '강남구' },
    { district_id: 2, city_id: 1, district_name: '서초구' },
    { district_id: 3, city_id: 1, district_name: '마포구' }
  ],
  roads: [
    { road_id: 1, district_id: 1, road_name: '테헤란로' },
    { road_id: 2, district_id: 2, road_name: '강남대로' },
    { road_id: 3, district_id: 3, road_name: '월드컵북로' }
  ],
  blocks: [
    { block_id: 1, road_id: 1, number_start: 1, number_end: 100, latitude: 37.5024, longitude: 127.0303 },
    { block_id: 2, road_id: 1, number_start: 101, number_end: 200, latitude: 37.5032, longitude: 127.0411 },
    { block_id: 3, road_id: 2, number_start: 1, number_end: 100, latitude: 37.4968, longitude: 127.0280 },
    { block_id: 4, road_id: 3, number_start: 1, number_end: 100, latitude: 37.5665, longitude: 126.9780 }
  ],
  comments: [],
  commentReactions: [],
  chatRooms: [],
  chatMessages: [],
  nextId: {
    user: 1,
    comment: 1,
    reaction: 1,
    chatRoom: 1,
    chatMessage: 1
  }
};

// 데이터베이스 연결 풀 제거
// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME || 'map_society',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// JWT 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'mapsociety_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: '토큰이 유효하지 않습니다.' });
    }
    
    req.user = user;
    next();
  });
};

// 라우트: 사용자 등록
app.post('/auth/register', [
  body('username').isLength({ min: 3 }).withMessage('사용자 이름은 3자 이상이어야 합니다.'),
  body('email').isEmail().withMessage('유효한 이메일 주소를 입력하세요.'),
  body('password').isLength({ min: 6 }).withMessage('비밀번호는 6자 이상이어야 합니다.')
], async (req, res) => {
  // 유효성 검사 오류 확인
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { username, email, password } = req.body;
  
  try {
    // 이메일 중복 확인
    const existingUser = db.users.find(user => user.email === email);
    
    if (existingUser) {
      return res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });
    }
    
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 사용자 생성
    const userId = db.nextId.user++;
    const newUser = {
      user_id: userId,
      username,
      email,
      password_hash: hashedPassword,
      created_at: new Date().toISOString(),
      last_login: null
    };
    
    db.users.push(newUser);
    
    // JWT 토큰 생성
    const token = jwt.sign(
      { id: userId, username },
      process.env.JWT_SECRET || 'mapsociety_secret_key',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      user_id: userId,
      username,
      token
    });
  } catch (error) {
    console.error('사용자 등록 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 라우트: 로그인
app.post('/auth/login', [
  body('email').isEmail().withMessage('유효한 이메일 주소를 입력하세요.'),
  body('password').notEmpty().withMessage('비밀번호를 입력하세요.')
], async (req, res) => {
  // 유효성 검사 오류 확인
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { email, password } = req.body;
  
  try {
    // 사용자 조회 (메모리 데이터베이스 사용)
    const user = db.users.find(user => user.email === email);
    
    if (!user) {
      // 테스트 목적으로 자동 사용자 생성
      if (email === 'test@example.com' && password === 'password123') {
        // 테스트 사용자 자동 생성
        const userId = db.nextId.user++;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
          user_id: userId,
          username: 'TestUser',
          email,
          password_hash: hashedPassword,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        };
        
        db.users.push(newUser);
        
        // JWT 토큰 생성
        const token = jwt.sign(
          { id: userId, username: 'TestUser' },
          process.env.JWT_SECRET || 'mapsociety_secret_key',
          { expiresIn: '24h' }
        );
        
        return res.status(200).json({
          user_id: userId,
          username: 'TestUser',
          token
        });
      }
      
      return res.status(401).json({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }
    
    // 비밀번호 확인
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }
    
    // 마지막 로그인 시간 업데이트
    user.last_login = new Date().toISOString();
    
    // JWT 토큰 생성
    const token = jwt.sign(
      { id: user.user_id, username: user.username },
      process.env.JWT_SECRET || 'mapsociety_secret_key',
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      user_id: user.user_id,
      username: user.username,
      token
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 라우트: 위치 목록 조회
app.get('/locations', async (req, res) => {
  const { lat, lng, radius = 1.0 } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({ message: '위도(lat)와 경도(lng)가 필요합니다.' });
  }
  
  try {
    // 위치 정보 조회 - 실제 구현에서는 좌표 기반 쿼리 필요
    // 간단한 구현으로 대체
    const blocks = db.blocks.map(block => {
      const road = db.roads.find(r => r.road_id === block.road_id);
      return {
        block_id: block.block_id,
        address: `${road.road_name} ${block.number_start}-${block.number_end}`,
        latitude: block.latitude,
        longitude: block.longitude
      };
    });
    
    // 각 블록에 대한 상위 코멘트 조회
    const blocksWithComments = blocks.map(block => {
      const blockComments = db.comments
        .filter(c => c.block_id === block.block_id)
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 2);
      
      return {
        ...block,
        top_comments: blockComments
      };
    });
    
    res.status(200).json(blocksWithComments);
  } catch (error) {
    console.error('위치 정보 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 라우트: 위치 상세 정보 조회
app.get('/locations/:blockId/details', authenticateToken, async (req, res) => {
  const { blockId } = req.params;
  
  try {
    const block = db.blocks.find(b => b.block_id === parseInt(blockId));
    
    if (!block) {
      return res.status(404).json({ message: '위치 정보를 찾을 수 없습니다.' });
    }
    
    const road = db.roads.find(r => r.road_id === block.road_id);
    const district = db.districts.find(d => d.district_id === road.district_id);
    const city = db.cities.find(c => c.city_id === district.city_id);
    
    const locationDetail = {
      block: {
        block_id: block.block_id,
        address: `${road.road_name} ${block.number_start}-${block.number_end}`,
        latitude: block.latitude,
        longitude: block.longitude
      },
      road_id: road.road_id,
      road_name: road.road_name,
      district_id: district.district_id,
      district_name: district.district_name,
      city_id: city.city_id,
      city_name: city.city_name
    };
    
    res.status(200).json(locationDetail);
  } catch (error) {
    console.error('위치 상세 정보 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 라우트: 댓글 목록 조회
app.get('/locations/:blockId/comments', authenticateToken, async (req, res) => {
  const { blockId } = req.params;
  
  try {
    const comments = db.comments
      .filter(c => c.block_id === parseInt(blockId))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // 사용자 정보 추가
    const commentsWithUser = comments.map(comment => {
      const user = db.users.find(u => u.user_id === comment.user_id);
      return {
        ...comment,
        username: user ? user.username : '알 수 없음'
      };
    });
    
    res.status(200).json(commentsWithUser);
  } catch (error) {
    console.error('댓글 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 라우트: 댓글 작성
app.post('/locations/:blockId/comments', [
  authenticateToken,
  body('content').notEmpty().withMessage('댓글 내용을 입력하세요.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { blockId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;
  
  try {
    const block = db.blocks.find(b => b.block_id === parseInt(blockId));
    
    if (!block) {
      return res.status(404).json({ message: '위치 정보를 찾을 수 없습니다.' });
    }
    
    const commentId = db.nextId.comment++;
    const newComment = {
      comment_id: commentId,
      user_id: userId,
      block_id: parseInt(blockId),
      content,
      likes: 0,
      dislikes: 0,
      created_at: new Date().toISOString()
    };
    
    db.comments.push(newComment);
    
    const user = db.users.find(u => u.user_id === userId);
    
    res.status(201).json({
      ...newComment,
      username: user.username
    });
  } catch (error) {
    console.error('댓글 작성 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 라우트: 댓글 좋아요/싫어요
app.post('/comments/:commentId/reaction', [
  authenticateToken,
  body('is_like').isBoolean().withMessage('좋아요 여부를 지정하세요.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { commentId } = req.params;
  const { is_like } = req.body;
  const userId = req.user.id;
  
  try {
    const comment = db.comments.find(c => c.comment_id === parseInt(commentId));
    
    if (!comment) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }
    
    // 기존 반응 확인
    const existingReaction = db.commentReactions.find(
      r => r.comment_id === parseInt(commentId) && r.user_id === userId
    );
    
    if (existingReaction) {
      // 기존 반응이 같으면 반응 취소
      if (existingReaction.is_like === is_like) {
        // 반응 카운트 업데이트
        if (is_like) {
          comment.likes = Math.max(0, comment.likes - 1);
          } else {
          comment.dislikes = Math.max(0, comment.dislikes - 1);
        }
        
        // 반응 제거
        db.commentReactions = db.commentReactions.filter(
          r => !(r.comment_id === parseInt(commentId) && r.user_id === userId)
        );
        
        return res.status(200).json({
          comment_id: comment.comment_id,
          likes: comment.likes,
          dislikes: comment.dislikes,
          user_reaction: null
        });
      } else {
        // 기존 반응이 다르면 반응 변경
        // 기존 반응 카운트 감소
        if (existingReaction.is_like) {
          comment.likes = Math.max(0, comment.likes - 1);
          } else {
          comment.dislikes = Math.max(0, comment.dislikes - 1);
        }
        
        // 새 반응 카운트 증가
        if (is_like) {
          comment.likes += 1;
          } else {
          comment.dislikes += 1;
        }
        
        // 반응 업데이트
        existingReaction.is_like = is_like;
        existingReaction.created_at = new Date().toISOString();
      }
    } else {
      // 새 반응 추가
      const reactionId = db.nextId.reaction++;
      const newReaction = {
        reaction_id: reactionId,
        comment_id: parseInt(commentId),
        user_id: userId,
        is_like,
        created_at: new Date().toISOString()
      };
      
      db.commentReactions.push(newReaction);
      
      // 반응 카운트 업데이트
      if (is_like) {
        comment.likes += 1;
      } else {
        comment.dislikes += 1;
      }
    }
      
      res.status(200).json({
      comment_id: comment.comment_id,
      likes: comment.likes,
      dislikes: comment.dislikes,
      user_reaction: is_like
    });
  } catch (error) {
    console.error('댓글 반응 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 