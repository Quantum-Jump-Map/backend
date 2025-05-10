import db from '../db/appDb.js';
import userdb from '../db/userDb.js';
//import eventDb from '../db/eventDB.js';
//import { CoordToAddress, AddressToCoord } from '../Kakao/restAPI.js';

export async function level1(req, res)  // 시도 단위
{
    try{
        const {TopLeftX, TopLeftY, BottomRightX, BottomRightY} = req.body;
        const t_topleftx = parseFloat(TopLeftX);
        const t_toplefty = parseFloat(TopLeftY);
        const t_bottomrightx = parseFloat(BottomRightX);
        const t_bottomrighty = parseFloat(BottomRightY);

        const [loc] = await db.query('SELECT * from cities WHERE lng BETWEEN ? AND ? AND lat BETWEEN ? AND ?', 
            [t_topleftx, t_bottomrightx, t_toplefty, t_bottomrighty]);


        const loc_size = loc.length;   //좌표 안에 있는 위치의 개수
        console.log("loc_size: " + loc_size);
        let data = [];

        for(let i =0; i<loc_size; i++)
        {
            const [temp_comment] = await db.query('SELECT * from comments WHERE city_id=? ORDER BY like_count LIMIT 2', [loc[i].id]); //댓글 조회
            const mapx = loc[i].lng;
            const mapy = loc[i].lat;
            const comments_size = temp_comment.length; //조회된 댓글 개수 (최대 2)
            let comments_data = [];

            for(let j=0; j<comments_size; j++)
            {
                const [username] = await userdb.query('SELECT username from users WHERE id=?', [temp_comment[j].user_id]); //사용자 username 조회
                comments_data.push({
                    comment: temp_comment[j].content,  //댓글 내용
                    posted_by: username[0].username,  // username
                    posted_at: temp_comment[j].created_at, //생성시간
                    like_count: temp_comment[j].like_count //좋아요 개수
                });
            }

            data.push({
                mapx: mapx,
                mapy: mapy,
                comments_size: comments_size,
                comments: comments_data
            });
        }

        const res_json = {
            data_size: loc_size,
            data: data
        }

        res.status(201).json(res_json);
        console.log("201: success")

    } catch(err) {
        console.error("error: ", err);
        res.status(401).json({
            error: "server error"
        });
    }
}

export async function level2(req, res)   //시군구 단위
{
    try{
        const {TopLeftX, TopLeftY, BottomRightX, BottomRightY} = req.body;
        const t_topleftx = parseFloat(TopLeftX);
        const t_toplefty = parseFloat(TopLeftY);
        const t_bottomrightx = parseFloat(BottomRightX);
        const t_bottomrighty = parseFloat(BottomRightY);

        const [loc] = await db.query('SELECT * from districts WHERE lng BETWEEN ? AND ? AND lat BETWEEN ? AND ?', 
            [t_topleftx, t_bottomrightx, t_toplefty, t_bottomrighty]);


        const loc_size = loc.length;   //좌표 안에 있는 위치의 개수
        console.log("loc_size: " + loc_size);
        let data = [];

        for(let i =0; i<loc_size; i++)
        {
            const [temp_comment] = await db.query('SELECT * from comments WHERE district_id=? ORDER BY like_count LIMIT 2', [loc[i].id]); //댓글 조회
            const mapx = loc[i].lng;
            const mapy = loc[i].lat;
            const comments_size = temp_comment.length; //조회된 댓글 개수 (최대 2)
            let comments_data = [];

            for(let j=0; j<comments_size; j++)
            {
                const [username] = await userdb.query('SELECT username from users WHERE id=?', [temp_comment[j].user_id]); //사용자 username 조회
                comments_data.push({
                    comment: temp_comment[j].content,  //댓글 내용
                    posted_by: username[0].username,  // username
                    posted_at: temp_comment[j].created_at, //생성시간
                    like_count: temp_comment[j].like_count //좋아요 개수
                });
            }

            data.push({
                mapx: mapx,
                mapy: mapy,
                comments_size: comments_size,
                comments: comments_data
            });
        }

        const res_json = {
            data_size: loc_size,
            data: data
        }

        res.status(201).json(res_json);
        console.log("201: success")

    } catch(err) {
        console.error("error: ", err);
        res.status(401).json({
            error: "server error"
        });
    }
}

export async function level3(req, res)   //도로명 단위
{
    try{
        const {TopLeftX, TopLeftY, BottomRightX, BottomRightY} = req.body;
        const t_topleftx = parseFloat(TopLeftX);
        const t_toplefty = parseFloat(TopLeftY);
        const t_bottomrightx = parseFloat(BottomRightX);
        const t_bottomrighty = parseFloat(BottomRightY);

        const [loc] = await db.query('SELECT * from roads WHERE lng BETWEEN ? AND ? AND lat BETWEEN ? AND ?', 
            [t_topleftx, t_bottomrightx, t_toplefty, t_bottomrighty]);


        const loc_size = loc.length;   //좌표 안에 있는 위치의 개수
        console.log("loc_size: " + loc_size);
        let data = [];

        for(let i =0; i<loc_size; i++)
        {
            const [temp_comment] = await db.query('SELECT * from comments WHERE road_id=? ORDER BY like_count LIMIT 2', [loc[i].id]); //댓글 조회
            const mapx = loc[i].lng;
            const mapy = loc[i].lat;
            const comments_size = temp_comment.length; //조회된 댓글 개수 (최대 2)
            let comments_data = [];

            for(let j=0; j<comments_size; j++)
            {
                const [username] = await userdb.query('SELECT username from users WHERE id=?', [temp_comment[j].user_id]); //사용자 username 조회
                comments_data.push({
                    comment: temp_comment[j].content,  //댓글 내용
                    posted_by: username[0].username,  // username
                    posted_at: temp_comment[j].created_at, //생성시간
                    like_count: temp_comment[j].like_count //좋아요 개수
                });
            }

            data.push({
                mapx: mapx,
                mapy: mapy,
                comments_size: comments_size,
                comments: comments_data
            });
        }

        const res_json = {
            data_size: loc_size,
            data: data
        }

        res.status(201).json(res_json);
        console.log("201: success")

    } catch(err) {
        console.error("error: ", err);
        res.status(401).json({
            error: "server error"
        });
    }
}

export async function level4(req, res)   //건물번호 단위
{
    try{
        const {TopLeftX, TopLeftY, BottomRightX, BottomRightY} = req.body;
        const t_topleftx = parseFloat(TopLeftX);
        const t_toplefty = parseFloat(TopLeftY);
        const t_bottomrightx = parseFloat(BottomRightX);
        const t_bottomrighty = parseFloat(BottomRightY);

        const [loc] = await db.query('SELECT * from addresses WHERE lng BETWEEN ? AND ? AND lat BETWEEN ? AND ?', 
            [t_topleftx, t_bottomrightx, t_toplefty, t_bottomrighty]);


        const loc_size = loc.length;   //좌표 안에 있는 위치의 개수
        console.log("loc_size: " + loc_size);
        let data = [];

        for(let i =0; i<loc_size; i++)
        {
            const [temp_comment] = await db.query('SELECT * from comments WHERE address_id=? ORDER BY like_count LIMIT 2', [loc[i].id]); //댓글 조회
            const mapx = loc[i].lng;
            const mapy = loc[i].lat;
            const comments_size = temp_comment.length; //조회된 댓글 개수 (최대 2)
            let comments_data = [];

            for(let j=0; j<comments_size; j++)
            {
                const [username] = await userdb.query('SELECT username from users WHERE id=?', [temp_comment[j].user_id]); //사용자 username 조회
                comments_data.push({
                    comment: temp_comment[j].content,  //댓글 내용
                    posted_by: username[0].username,  // username
                    posted_at: temp_comment[j].created_at, //생성시간
                    like_count: temp_comment[j].like_count //좋아요 개수
                });
            }

            data.push({
                mapx: mapx,
                mapy: mapy,
                comments_size: comments_size,
                comments: comments_data
            });
        }

        const res_json = {
            data_size: loc_size,
            data: data
        }

        res.status(201).json(res_json);
        console.log("201: success")

    } catch(err) {
        console.error("error: ", err);
        res.status(401).json({
            error: "server error"
        });
    }
}