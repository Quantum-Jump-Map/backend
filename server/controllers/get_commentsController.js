import db from '../db/appDb.js';
import userdb from '../db/userDb.js';
//import eventDb from '../db/eventDB.js';
//import { CoordToAddress, AddressToCoord } from '../Kakao/restAPI.js';

export async function level1(req, res)  // 시도 단위
{
    try{
        const {TopLeftX, TopLeftY, BottomRightX, BottomRightY} = req.query;

        console.log(`자료형: ${typeof(TopLeftX)} ${typeof(TopLeftY)} ${typeof(BottomRightX)} ${typeof(BottomRightY)}\n`);
        console.log(`값: ${TopLeftX} ${TopLeftY} ${BottomRightX} ${BottomRightY}`);
        console.log(req.query);
        const t_topleftx = Math.min(parseFloat(TopLeftX), parseFloat(BottomRightX));
        const t_toplefty = Math.max(parseFloat(TopLeftY), parseFloat(BottomRightY));
        const t_bottomrightx = Math.max(parseFloat(TopLeftX), parseFloat(BottomRightX));
        const t_bottomrighty = Math.min(parseFloat(TopLeftY), parseFloat(BottomRightY));

        const [loc] = await db.query('SELECT * from cities WHERE lng BETWEEN ? AND ? AND lat BETWEEN ? AND ?', 
            [t_topleftx, t_bottomrightx, t_bottomrighty, t_toplefty]);

        if(loc.length==0){
            res.status(201).json({
                data_size: 0,
                data: []
            });

            return;
        }

        const city_id_arr = loc.map(c=>c.id);
        const holder = city_id_arr.map(i=>'?').join(', ');

        const [db_res] = await db.query(
            `SELECT * from (SELECT c.city_id, c.content AS comment, u.username AS posted_by, c.created_at AS posted_at, c.like_count, ROW_NUMBER() OVER
            (PARTITION BY c.city_id ORDER BY c.like_count DESC) AS rn
            FROM comments c 
            JOIN user_db.users u ON c.user_id=u.id
            WHERE c.city_id IN (${holder}) ) ranked
            WHERE rn<=2
            `, city_id_arr);
        
        let comment_info = {};
            
        for(const e of db_res)
        {
            if(!comment_info[e.city_id]) comment_info[e.city_id] = [];
            comment_info[e.city_id].push({
                comment: e.comment,
                posted_by: e.posted_by,
                posted_at: e.posted_at,
                like_count: e.like_count
            });
        }

        let data = [];

        for(const l of loc)
        {
            data.push({
                mapx: l.lng,
                mapy: l.lat,
                city_id: l.id,
                comments_size: comment_info[l.id].length,
                comments: comment_info[l.id]
            });
        }

        res.status(201).json({
            data_size: data.length,
            data: data
        });

    } catch(err) {
        console.error("error: ", err);
        res.status(401).json({
            error: "server error"
        });
    }
}

export async function get_all_level1(req, res)
{
    try{
    
        const {city_id, offset} = req.query;
        const city_id_t = parseInt(city_id);
        const offset_t = parseInt(offset);

        console.log(city_id_t);
        console.log(offset_t);

        const [city_row] = await db.query(
            `SELECT c.content AS comment, u.username AS posted_by, c.created_at AS posted_at, c.like_count
                FROM comments c
                JOIN user_db.users u ON u.id=c.user_id
                WHERE c.city_id=?
                ORDER BY c.like_count DESC
                LIMIT 10
                OFFSET ?`, [city_id_t, offset_t]);

        res.status(201).json({
            data_size: city_row.length,
            offset: offset_t+city_row.length,
            comments: city_row
        });
        
    } catch(err) {
        
        console.error("error: ", err);
        res.status(501).json({
            error: err
        });

        return;
    }
}


export async function level2(req, res)   //시군구 단위
{
    try{
        const {TopLeftX, TopLeftY, BottomRightX, BottomRightY} = req.query;
        console.log(`자료형: ${typeof(TopLeftX)} ${typeof(TopLeftY)} ${typeof(BottomRightX)} ${typeof(BottomRightY)}\n`);
        console.log(`값: ${TopLeftX} ${TopLeftY} ${BottomRightX} ${BottomRightY}`);
        console.log(req.query);

        const t_topleftx = Math.min(parseFloat(TopLeftX), parseFloat(BottomRightX));
        const t_toplefty = Math.max(parseFloat(TopLeftY), parseFloat(BottomRightY));
        const t_bottomrightx = Math.max(parseFloat(TopLeftX), parseFloat(BottomRightX));
        const t_bottomrighty = Math.min(parseFloat(TopLeftY), parseFloat(BottomRightY));

        const [loc] = await db.query('SELECT * from districts WHERE lng BETWEEN ? AND ? AND lat BETWEEN ? AND ?', 
            [t_topleftx, t_bottomrightx, t_bottomrighty, t_toplefty]);

        if(loc.length==0){
            res.status(201).json({
                data_size: 0,
                data: []
            });

            return;
        }

        const district_id_arr = loc.map(c=>c.id);
        const holder = district_id_arr.map(i=>'?').join(', ');

        const [db_res] = await db.query(
            `SELECT * from (SELECT c.district_id, c.content AS comment, u.username AS posted_by, c.created_at AS posted_at, c.like_count, ROW_NUMBER() OVER
            (PARTITION BY c.district_id ORDER BY c.like_count DESC) AS rn
            FROM comments c 
            JOIN user_db.users u ON c.user_id=u.id
            WHERE c.district_id IN (${holder}) ) ranked
            WHERE rn<=2`, district_id_arr);
        
        let comment_info = {};
            
        for(const e of db_res)
        {
            if(!comment_info[e.district_id]) comment_info[e.district_id] = [];
            comment_info[e.district_id].push({
                comment: e.comment,
                posted_by: e.posted_by,
                posted_at: e.posted_at,
                like_count: e.like_count
            });
        }

        console.log(comment_info);

        let data = [];

        for(const l of loc)
        {
            data.push({
                mapx: l.lng,
                mapy: l.lat,
                district_id: l.id,
                comments_size: comment_info[l.id].length,
                comments: comment_info[l.id]
            });
        }

        res.status(201).json({
            data_size: data.length,
            data: data
        });

    } catch(err) {
        console.error("error: ", err);
        res.status(401).json({
            error: "server error"
        });
    }
}

export async function get_all_level2(req, res)
{
    try{
    
        const {district_id, offset} = req.query;
        const district_id_t = parseInt(district_id);
        const offset_t = parseInt(offset);

        console.log(district_id_t);
        console.log(offset_t);

        const [district_row] = await db.query(
            `SELECT c.content AS comment, u.username AS posted_by, c.created_at AS posted_at, c.like_count
                FROM comments c
                JOIN user_db.users u ON u.id=c.user_id
                WHERE c.district_id=?
                ORDER BY c.like_count DESC
                LIMIT 10
                OFFSET ?`, [district_id_t, offset_t]);

        res.status(201).json({
            data_size: district_row.length,
            offset: offset_t+district_row.length,
            comments: district_row
        });
        
    } catch(err) {
        
        console.error("error: ", err);
        res.status(501).json({
            error: err
        });

        return;
    }

    
}

export async function level3(req, res)   //도로명+구 단위 
{
    try{
        const {TopLeftX, TopLeftY, BottomRightX, BottomRightY} = req.query;
        console.log(`자료형: ${typeof(TopLeftX)} ${typeof(TopLeftY)} ${typeof(BottomRightX)} ${typeof(BottomRightY)}\n`);
        console.log(`값: ${TopLeftX} ${TopLeftY} ${BottomRightX} ${BottomRightY}`);
        console.log(req.query);
        const t_topleftx = Math.min(parseFloat(TopLeftX), parseFloat(BottomRightX));
        const t_toplefty = Math.max(parseFloat(TopLeftY), parseFloat(BottomRightY));
        const t_bottomrightx = Math.max(parseFloat(TopLeftX), parseFloat(BottomRightX));
        const t_bottomrighty = Math.min(parseFloat(TopLeftY), parseFloat(BottomRightY));

        const [loc] = await db.query('SELECT * from roads WHERE lng BETWEEN ? AND ? AND lat BETWEEN ? AND ?', 
            [t_topleftx, t_bottomrightx, t_bottomrighty, t_toplefty]);

        const [loc_dong] = await db.query('SELECT * FROM legal_dongs WHERE lng BETWEEN ? AND ? AND lat BETWEEN ? AND ?',
            [t_topleftx, t_bottomrightx, t_bottomrighty, t_toplefty]
        )

        if(loc.length==0 && loc_dong.length==0){
            res.status(201).json({
                data_size: 0,
                data: []
            });

            return;
        }

        const road_id_arr = loc.map(c=>c.id);
        const holder = road_id_arr.map(i=>'?').join(', ');

        const dong_id_arr = loc_dong.map(c=>c.id);
        const holder_dong = dong_id_arr.map(i=>'?').join(', ');

        const [db_res] = await db.query(
            `SELECT * from (SELECT c.road_id, c.content AS comment, u.username AS posted_by, c.created_at AS posted_at, c.like_count, ROW_NUMBER() OVER
            (PARTITION BY c.road_id ORDER BY c.like_count DESC) AS rn
            FROM comments c 
            JOIN user_db.users u ON c.user_id=u.id
            WHERE c.road_id IN (${holder}) AND c.road_id IS NOT NULL ) ranked
            WHERE rn<=2
            `, road_id_arr);

        const [db_res_dong] = await db.query(
            `SELECT * FROM (SELECT c.legal_dong_id, c.content AS comment, u.username AS posted_by, c.created_at AS posted_at, c.like_count, ROW_NUMBER() OVER
            (PARTITION BY c.legal_dong_id ORDER BY c.like_count DESC) AS rn
            FROM comments c
            JOIN user_db.users u ON c.user_id=u.id
            WHERE c.legal_dong_id IN (${holder_dong}) AND c.legal_dong_id IS NOT NULL ) ranked
            WHERE rn<=2`, dong_id_arr);
        
        let comment_info = {};
        let comment_info_dong = {};
            
        for(const e of db_res)
        {
            if(!comment_info[e.road_id_arr]) comment_info[e.road_id_arr] = [];
            comment_info[e.road_id_arr].push({
                comment: e.comment,
                posted_by: e.posted_by,
                posted_at: e.posted_at,
                like_count: e.like_count
            });
        }

        for(const e of db_res_dong)
        {
            if(!comment_info_dong[e.dong_id_arr]) comment_info_dong[e.dong_id_arr] = [];
            comment_info_dong[e.dong_id_arr].push({
                comment: e.comment,
                posted_by: e.posted_by,
                posted_at: e.posted_at,
                like_count: e.like_count
            });
        }



        let data = [];

        for(const l of loc)
        {
            data.push({
                mapx: l.lng,
                mapy: l.lat,
                is_road: true,
                loc_id: l.id,
                comments_size: comment_info[l.id].length,
                comments: comment_info[l.id]
            });
        }

        for(const l of loc_dong)
        {
            data.push({
                mapx: l.lng,
                mapy: l.lat,
                is_road: false,
                loc_id: l.id,
                comments_size: comment_info_dong[l.id].length,
                comments: comment_info_dong[l.id]
            });
        }

        res.status(201).json({
            data_size: data.length,
            data: data
        });

    } catch(err) {
        console.error("error: ", err);
        res.status(401).json({
            error: "server error"
        });
    }
}

export async function get_all_level3(req, res)
{
    try{
        const {is_road, loc_id, offset} = req.query;

        if(!is_road || !loc_id || !offset)
        {
            console.log("error: no field");
            res.status(401).json({
                error: "no field"
            });

            return;
        }

        const is_road_t = (is_road==='true') ? true: false;
        const loc_id_t = parseInt(loc_id);
        const offset_t = parseInt(offset);

        console.log(is_road_t);

        let ret;

        if(is_road_t==true){

            const [ret_t] = await db.query(
                `SELECT c.content, u.username AS posted_by, c.created_at AS posted_at, c.like_count
                FROM comments c
                JOIN user_db.users u ON u.id=c.user_id
                WHERE c.road_id IS NOT NULL AND c.road_id=?
                ORDER BY c.created_at DESC
                LIMIT 10
                OFFSET ?`, [loc_id_t, offset_t]);

            ret = ret_t;

        }

        else{
            
            const [ret_t] = await db.query(
                `SELECT c.content, u.username AS posted_by, c.created_at AS posted_at, c.like_count
                FROM comments c
                JOIN user_db.users u ON u.id=c.user_id
                WHERE c.legal_dong_id IS NOT NULL AND c.road_id=?
                ORDER BY c.created_at DESC
                LIMIT 10
                OFFSET ?`, [loc_id_t, offset_t]);

            ret = ret_t;
        }

        res.status(201).json({
            data_size: ret.length,
            offset: offset_t+ret.length,
            comments: ret
        });

        return;
       
        
    } catch(err) {
        
        console.error("error: ", err);
        res.status(501).json({
            error: err
        });

        return;
    }

    
}

export async function level4(req, res)   //건물번호 단위
{
    try{
        const {TopLeftX, TopLeftY, BottomRightX, BottomRightY} = req.query;
        console.log(`자료형: ${typeof(TopLeftX)} ${typeof(TopLeftY)} ${typeof(BottomRightX)} ${typeof(BottomRightY)}\n`);
        console.log(`값: ${TopLeftX} ${TopLeftY} ${BottomRightX} ${BottomRightY}`);
        console.log(req.query);
        const t_topleftx = Math.min(parseFloat(TopLeftX), parseFloat(BottomRightX));
        const t_toplefty = Math.max(parseFloat(TopLeftY), parseFloat(BottomRightY));
        const t_bottomrightx = Math.max(parseFloat(TopLeftX), parseFloat(BottomRightX));
        const t_bottomrighty = Math.min(parseFloat(TopLeftY), parseFloat(BottomRightY));

        const [loc] = await db.query('SELECT * from addresses WHERE lng BETWEEN ? AND ? AND lat BETWEEN ? AND ?', 
            [t_topleftx, t_bottomrightx, t_bottomrighty, t_toplefty]);

        if(loc.length==0){
            res.status(201).json({
                data_size: 0,
                data: []
            });

            return;
        }

        const address_id_arr = loc.map(c=>c.id);
        const holder = address_id_arr.map(i=>'?').join(', ');

        const [db_res] = await db.query(
            `SELECT * from (SELECT c.address_id, c.content AS comment, u.username AS posted_by, c.created_at AS posted_at, c.like_count, ROW_NUMBER() OVER
            (PARTITION BY c.address_id ORDER BY c.like_count DESC) AS rn
            FROM comments c 
            JOIN user_db.users u ON c.user_id=u.id
            WHERE c.address_id IN (${holder}) ) ranked
            WHERE rn<=2
            `, address_id_arr);
        
        let comment_info = {};
            
        for(const e of db_res)
        {
            if(!comment_info[e.address_id_arr]) comment_info[e.address_id_arr] = [];
            comment_info[e.address_id_arr].push({
                comment: e.comment,
                posted_by: e.posted_by,
                posted_at: e.posted_at,
                like_count: e.like_count
            });
        }

        let data = [];

        for(const l of loc)
        {
            data.push({
                mapx: l.lng,
                mapy: l.lat,
                address_id: l.id,
                comments_size: comment_info[l.id].length,
                comments: comment_info[l.id]
            });
        }

        res.status(201).json({
            data_size: data.length,
            data: data
        });

    } catch(err) {
        console.error("error: ", err);
        res.status(401).json({
            error: "server error"

        });
    }
}

export async function get_all_level4(req, res)
{
    try{
    
        const {address_id, offset} = req.query;

        const address_id_t = parseInt(address_id);
        const offset_t = parseInt(offset);

        const [address_row] = await db.query(
            `SELECT c.content AS comment, u.username AS posted_by, c.created_at AS posted_at, c.like_count
                FROM comments c
                JOIN user_db.users u ON u.id=c.user_id
                WHERE c.address_id=?
                ORDER BY c.like_count DESC
                LIMIT 10
                OFFSET ?`, [address_id_t, offset_t]);

        res.status(201).json({
            data_size: city_row.length,
            offset: offset_t+city_row.length,
            comments: address_row
        });
        
    } catch(err) {
        
        console.error("error: ", err);
        res.status(501).json({
            error: err
        });

        return;
    }

}

export async function level5(req, res)   //건물번호 단위
{
    const {TopLeftX, TopLeftY, BottomRightX, BottomRightY} = req.query;
        console.log(`자료형: ${typeof(TopLeftX)} ${typeof(TopLeftY)} ${typeof(BottomRightX)} ${typeof(BottomRightY)}\n`);
        console.log(`값: ${TopLeftX} ${TopLeftY} ${BottomRightX} ${BottomRightY}`);
        console.log(req.query);
        const t_topleftx = Math.min(parseFloat(TopLeftX), parseFloat(BottomRightX));
        const t_toplefty = Math.max(parseFloat(TopLeftY), parseFloat(BottomRightY));
        const t_bottomrightx = Math.max(parseFloat(TopLeftX), parseFloat(BottomRightX));
        const t_bottomrighty = Math.min(parseFloat(TopLeftY), parseFloat(BottomRightY));

        const [loc] = await db.query('SELECT * from addresses WHERE lng BETWEEN ? AND ? AND lat BETWEEN ? AND ?', 
            [t_topleftx, t_bottomrightx, t_bottomrighty, t_toplefty]);

        if(loc.length==0){
            res.status(201).json({
                data_size: 0,
                data: []
            });

            return;
        }

        const address_id_arr = loc.map(c=>c.id);
        const holder = address_id_arr.map(i=>'?').join(', ');

        const [db_res] = await db.query(
            `SELECT * from (SELECT c.address_id, c.content AS comment, u.username AS posted_by, c.created_at AS posted_at, c.like_count, ROW_NUMBER() OVER
            (PARTITION BY c.address_id ORDER BY c.like_count DESC) AS rn
            FROM comments c 
            JOIN user_db.users u ON c.user_id=u.id
            WHERE c.address_id IN (${holder}) ) ranked
            WHERE rn<=2
            `, address_id_arr);
        
        let comment_info = {};
            
        for(const e of db_res)
        {
            if(!comment_info[e.address_id]) comment_info[e.address_id] = [];
            comment_info[e.address_id].push({
                comment: e.comment,
                posted_by: e.posted_by,
                posted_at: e.posted_at,
                like_count: e.like_count
            });
        }

        let data = [];

        for(const l of loc)
        {
            data.push({
                mapx: l.lng,
                mapy: l.lat,
                address_id: l.id,
                comments_size: comment_info[l.id].length,
                comments: comment_info[l.id]
            });
        }

        res.status(201).json({
            data_size: data.length,
            data: data
        });
}

export async function get_all_level5(req, res)
{
    try{
    
        
    } catch(err) {
        
        console.error("error: ", err);
        res.status(501).json({
            error: err
        });

        return;
    }

    
}