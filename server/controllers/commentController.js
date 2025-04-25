import db from '../db/appDb.js';
import userdb from '../db/userDb.js';

async function getOrCreateAddress(latitude, longitude) {
  //1. 좌표를 주소로 변환하기

  
}

export async function createComment(req, res) {
  const { content, posted_at, latitude, longitude } = req.body;
  const user_id = req.user.id

  if (!content || !posted_at || !latitude || !longitude) {
    return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
  }

  try {
    const buildingId = await getOrCreateAddress(latitude, longitude);
    await db.execute(
      'INSERT INTO comments (user_id, content, posted_at, building_id) VALUES (?, ?, ?, ?)',
      [user_id, content, posted_at, buildingId]
    );

    res.status(201).json({ 
      token: res.locals.newToken,
      message: '댓글 저장 완료' });

  } catch (err) {
    console.error('댓글 저장 실패:', err);
    res.status(500).json({ error: '서버 오류' });
  }
}

export async function deleteComment(req, res) {
  const { comment_id} = req.body;
  const user_id = req.user.id;

  try {
    const [comments_rows] = await db.query('SELECT * FROM comments WHERE id = ?', [comment_id]);
    if (comments_rows.length === 0)
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });

    const cur_comment = comments_rows[0];

    const [user_rows] = await userdb.query('SELECT * FROM users WHERE id = ?', [user_id]);
    if (user_rows.length === 0)
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

    const cur_user = user_rows[0];

    if (cur_comment.user_id !== cur_user.id)
      return res.status(403).json({ message: '댓글을 삭제할 권한이 없습니다.' });

    await db.execute('DELETE FROM comments WHERE id = ?', [comment_id]);

    res.status(200).json({
      token: res.locals.newToken,
      message: '댓글이 삭제되었습니다.',
      deleted_id: comment_id
    });

  } catch (err) {
    console.error('오류', err);
    res.status(500).json({ message: '서버 오류' });
  }
}

export async function editComment(req, res) {
  const { comment_id, new_contents } = req.body;
  const user_id = req.user.id;

  try {
    const [comments_rows] = await db.query('SELECT * FROM comments WHERE id = ?', [comment_id]);
    const [users_rows] = await userdb.query('SELECT * FROM users WHERE id = ?', [user_id]);

    if (comments_rows.length === 0 || users_rows.length === 0)
      return res.status(404).json({ message: '댓글 또는 사용자를 찾을 수 없습니다.' });

    const cur_comment = comments_rows[0];
    const cur_user = users_rows[0];

    if (cur_comment.user_id !== cur_user.id)
      return res.status(403).json({ message: '댓글을 수정할 권한이 없습니다.' });

    await db.execute('UPDATE comments SET content = ? WHERE id = ?', [new_contents, comment_id]);

    res.status(200).json({
      token: res.locals.newToken,
      message: '댓글 수정 완료',
      comment: {
        id: comment_id,
        user_id: user_id,
        content: new_contents,
        posted_at: cur_comment.created_at
      }
    });
    
  } catch (err) {
    console.error('오류', err);
    res.status(500).json({ message: '서버 오류' });
  }
}

export async function likeComment(req, res) {
  const {comment_id} = req.body;
  const user_id = req.user.id;

  try{
    const [like_rows] = await db.query("SELECT * FROM comment_likes WHERE comment_id=? AND user_id =?", [comment_id, user_id]);

    if(like_rows.length ===0)  //좋아요 안눌려있을 때
    {
      await db.execute("UPDATE comments set like_count = like_count+1 WHERE id = ?", [comment_id]);
      await db.execute("INSERT INTO comment_likes (comment_id, user_id) VALUES(?,?)", [comment_id, user_id]);

      res.status(201).json({
        token: res.locals.newToken,
        message: "좋아요 표시 완료"
      });
    }

    else
    {
      await db.execute("UPDATE comments set like_count = like_count-1 WHERE id = ?",[comment_id]);
      await db.execute("DELETE from comment_likes WHERE comment_id=? AND user_id =?", [comment_id, user_id]);

      res.status(201).json({
        token: res.locals.newToken,
        message: "좋아요 표시 취소"
      });
    }
  
  } catch(err) {
    console.error("error", err);
    res.status(501).json({
      message: "error"
    });
  }
  
}
