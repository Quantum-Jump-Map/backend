import db from '../db/appDb.js';

async function getOrCreateAddress(city, district, road_name, building_number) {
  const [cityRows] = await db.query(`SELECT id FROM cities WHERE name = ?`, [city]);
  let cityId = cityRows[0]?.id;
  if (!cityId) {
    const [res] = await db.query(`INSERT INTO cities (name) VALUES (?)`, [city]);
    cityId = res.insertId;
  }

  const [districtRows] = await db.query(
    `SELECT id FROM districts WHERE name = ? AND city_id = ?`, [district, cityId]
  );
  let districtId = districtRows[0]?.id;
  if (!districtId) {
    const [res] = await db.query(
      `INSERT INTO districts (name, city_id) VALUES (?, ?)`, [district, cityId]
    );
    districtId = res.insertId;
  }

  const [roadRows] = await db.query(
    `SELECT id FROM roads WHERE name = ? AND district_id = ?`, [road_name, districtId]
  );
  let roadId = roadRows[0]?.id;
  if (!roadId) {
    const [res] = await db.query(
      `INSERT INTO roads (name, district_id) VALUES (?, ?)`, [road_name, districtId]
    );
    roadId = res.insertId;
  }

  const [buildingRows] = await db.query(
    `SELECT id FROM buildings WHERE number = ? AND road_id = ?`, [building_number, roadId]
  );
  let buildingId = buildingRows[0]?.id;
  if (!buildingId) {
    const [res] = await db.query(
      `INSERT INTO buildings (number, road_id) VALUES (?, ?)`, [building_number, roadId]
    );
    buildingId = res.insertId;
  }

  return buildingId;
}

// 댓글 저장
export async function createComment(req, res) {
  const { user_id, content, posted_at, city, district, road_name, building_number } = req.body;

  if (!user_id || !content || !posted_at || !city || !district || !road_name || !building_number) {
    return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
  }

  try {
    const buildingId = await getOrCreateAddress(city, district, road_name, building_number);
    await db.execute(`
      INSERT INTO comments (user_id, content, posted_at, building_id)
      VALUES (?, ?, ?, ?)`,
      [user_id, content, posted_at, buildingId]
    );

    res.status(201).json({ message: '댓글 저장 완료' });
  } catch (err) {
    console.error('댓글 저장 실패:', err);
    res.status(500).json({ error: '서버 오류' });
  }
}

export async function deleteComment(req, res) {   //댓글 지우기
  
}

export async function editComment(req, res) {  //댓글 수정하기

}

export async function likeComment(req, res) {  //댓글 지우기

}


