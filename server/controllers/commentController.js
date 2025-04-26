import db from '../db/appDb.js';
import userdb from '../db/userDb.js';
import { CoordToAddress, AddressToCoord } from '../Kakao/restAPI.js';

async function getOrCreateAddress(latitude, longitude) {
  //1. 좌표를 주소로 변환하기
  const ret_address = await CoordToAddress(latitude, longitude);
  if(ret_address==null)
    return null;

  //2. city 처리
  const [cities_row] = await db.query('SELECT * FROM cities WHERE name=?', [ret_address.region_1depth_name]);
  let city_id = cities_row[0]?.id;

  if(cities_row.length==0)
  {
    const {x: city_x, y: city_y} = await AddressToCoord(`${ret_address.region_1depth_name}`);
    const [res] = await db.query('INSERT INTO cities (name, lat, lng) VALUES(?,?,?)',[ret_address.region_1depth_name, city_y, city_x]);
    city_id = res.insertId;
  }

  //3. district 처리
  const [districts_row] = await db.query('SELECT * FROM districts WHERE city_id=? AND name=?', [city_id, ret_address.region_2depth_name]);
  let district_id = districts_row[0]?.id;

  if(districts_row.length==0)
  {
    const {x: district_x, y: district_y} = await AddressToCoord(`${ret_address.region_1depth_name} ${ret_address.region_2depth_name}`);
    const [res] = await db.query('INSERT INTO districts (name, city_id, lat, lng) VALUES(?,?,?,?)',[ret_address.region_2depth_name, city_id, district_y, district_x]);
    district_id = res.insertId;
  }

  //4. roads 처리
  
  const [roads_row] = await db.query('SELECT * FROM roads WHERE district_id=? AND name=?', [district_id, ret_address.road_name]);
  let road_id = roads_row[0]?.id;

  if(roads_row.length==0)
  {
    const {x: road_x, y: road_y} = await AddressToCoord(`${ret_address.region_1depth_name} ${ret_address.region_2depth_name} ${ret_address.road_name}`);
    const [res] = await db.query('INSERT INTO roads (name, city_id, district_id, lat, lng) VALUES(?,?,?,?)',[ret_address.road_name, city_id, district_id, road_y, road_x]);
    road_id = res.insertId;
  }

  // 5. addresses 처리
  let building_num = ret_address.main_building_no;
  if(ret_address.sub_building_no!="")
    building_num += `-${ret_address.sub_building_no}`;

  const [addresses_row] = await db.query('SELECT * FROM addresses WHERE road_id=? AND building_num=?', [road_id, building_num]);
  let address_id = addresses_row[0]?.id;

  if(addresses_row.length==0)
  {
    const {x: address_x, y: address_y} = await AddressToCoord(`${ret_address.region_1depth_name} ${ret_address.region_2depth_name} ${ret_address.road_name} ${building_num}`);
    const [res] = await db.query('INSERT INTO addresses (city_id, district_id, road_id, building_num, lat, lng) VALUES(?,?,?,?,?,?)',
      [city_id, district_id, road_id, building_num, address_y, address_x]);
    address_id = res.insertId;
  }

  return address_id;
}

export async function createComment(req, res) {
  const { content, latitude, longitude } = req.body;
  const user_id = req.user.id

  if (!content || !latitude || !longitude) {
    return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
  }

  try {
    const address_id = await getOrCreateAddress(latitude, longitude);
    if(address_id==null)
      return res.status(500).json({
        message: "error"
      });

    await db.execute(
      'INSERT INTO comments (user_id, content, address_id) VALUES (?, ?, ?)',
      [user_id, content, posted_at, address_id]
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
