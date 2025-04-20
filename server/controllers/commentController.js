import db from '../db/appDb.js';
import userdb from '../db/userDb.js';

async function getOrCreateAddress(city, district, road_name, building_number) {
  const [cityRows] = await db.query('SELECT id FROM cities WHERE name = ?', [city]);
  let cityId = cityRows[0]?.id;
  if (!cityId) {
    const [res] = await db.query('INSERT INTO cities (name) VALUES (?)', [city]);
    cityId = res.insertId;
  }

  const [districtRows] = await db.query(
    'SELECT id FROM districts WHERE name = ? AND city_id = ?',
    [district, cityId]
  );
  let districtId = districtRows[0]?.id;
  if (!districtId) {
    const [res] = await db.query(
      'INSERT INTO districts (name, city_id) VALUES (?, ?)',
      [district, cityId]
    );
    districtId = res.insertId;
  }

  const [roadRows] = await db.query(
    'SELECT id FROM roads WHERE name = ? AND district_id = ?',
    [road_name, districtId]
  );
  let roadId = roadRows[0]?.id;
  if (!roadId) {
    const [res] = await db.query(
      'INSERT INTO roads (name, district_id) VALUES (?, ?)',
      [road_name, districtId]
    );
    roadId = res.insertId;
  }

  const [buildingRows] = await db.query(
    'SELECT id FROM buildings WHERE number = ? AND road_id = ?',
    [building_number, roadId]
  );
  let buildingId = buildingRows[0]?.id;
  if (!buildingId) {
    const [res] = await db.query(
      'INSERT INTO buildings (number, road_id) VALUES (?, ?)',
      [building_number, roadId]
    );
    buildingId = res.insertId;
  }

  return buildingId;
}

export async function createComment(req, res) {
  const { user_id, content, posted_at, city, district, road_name, building_number } = req.body;

  if (!user_id || !content || !posted_at || !city || !district || !road_name || !building_number) {
    return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
  }

  try {
    const buildingId = await getOrCreateAddress(city, district, road_name, building_number);
    await db.execute(
      'INSERT INTO comments (user_id, content, posted_at, building_id) VALUES (?, ?, ?, ?)',
      [user_id, content, posted_at, buildingId]
    );

    res.status(201).json({ message: '댓글 저장 완료' });
  } catch (err) {
    console.error('댓글 저장 실패:', err);
    res.status(500).json({ error: '서버 오류' });
  }
}

export async function deleteComment(req, res) {
  const { comment_id, user_id } = req.body;

  try {
    const [comments_rows] = await db.query('SELECT * FROM comments WHERE id = ?', [comment_id]);
    if (comments_rows.length === 0)
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });

    const cur_comment = comments_rows[0];

    const [user_rows] = await userdb.query('SELECT * FROM users WHERE username = ?', [user_id]);
    if (user_rows.length === 0)
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

    const cur_user = user_rows[0];

    if (cur_comment.user_id !== cur_user.id)
      return res.status(403).json({ message: '댓글을 삭제할 권한이 없습니다.' });

    await db.execute('DELETE FROM comments WHERE id = ?', [comment_id]);

    res.status(200).json({
      message: '댓글이 삭제되었습니다.',
      deleted_id: comment_id
    });
  } catch (err) {
    console.error('오류', err);
    res.status(500).json({ message: '서버 오류' });
  }
}

export async function editComment(req, res) {
  const { comment_id, user_id, new_contents } = req.body;

  try {
    const [comments_rows] = await db.query('SELECT * FROM comments WHERE id = ?', [comment_id]);
    const [users_rows] = await userdb.query('SELECT * FROM users WHERE username = ?', [user_id]);

    if (comments_rows.length === 0 || users_rows.length === 0)
      return res.status(404).json({ message: '댓글 또는 사용자를 찾을 수 없습니다.' });

    const cur_comment = comments_rows[0];
    const cur_user = users_rows[0];

    if (cur_comment.user_id !== cur_user.id)
      return res.status(403).json({ message: '댓글을 수정할 권한이 없습니다.' });

    await db.execute('UPDATE comments SET content = ? WHERE id = ?', [new_contents, comment_id]);

    res.status(200).json({
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
  // TODO: 댓글 좋아요 기능 구현 예정
}
