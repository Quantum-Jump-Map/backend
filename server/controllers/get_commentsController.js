import db from '../db/appDb.js';
import userdb from '../db/userDb.js';
//import eventDb from '../db/eventDB.js';
//import { CoordToAddress, AddressToCoord } from '../Kakao/restAPI.js';

export async function level1(req, res)  // 시도 단위
{
    try{
        const {TopLeftX, TopLeftY, BottomRightX, BottomRightY} = req.query;
        const user_info = req.user;

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
            `SELECT * from (SELECT c.city_id, c.id AS comment_id, c.content AS comment, u.username AS posted_by, c.created_at AS posted_at, c.like_count, cl.id AS liked, ROW_NUMBER() OVER
            (PARTITION BY c.city_id ORDER BY c.like_count DESC) AS rn
            FROM comments c 
            JOIN user_db.users u ON c.user_id=u.id
            LEFT JOIN comment_likes cl ON cl.comment_id=c.id AND cl.user_id=?
            WHERE c.city_id IN (${holder}) ) ranked
            WHERE rn<=2
            `, [req.user.id]) || [];
        
        let comment_info = {};
            
        for(const e of db_res)
        {
            if(!comment_info[e.city_id]) comment_info[e.city_id] = [];
            comment_info[e.city_id].push({
                comment: e.comment,
                comment_id: e.comment_id,
                posted_by: e.posted_by,
                posted_at: e.posted_at,
                like_count: e.like_count,
                comment_liked: e.liked
            });
        }

        let data = [];

        for(const l of loc)
        {
            const comments_temp = comment_info[l.id] || [];
            if(!comments_temp || comments_temp.length === 0)
                continue;
            
            data.push({
                mapx: l.lng,
                mapy: l.lat,
                city_id: l.id,
                address: {
                    city: l.name
                },
                comments_size: comments_temp.length,
                comments: comments_temp
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
            `SELECT c.content AS comment, c.id AS comment_id, u.username AS posted_by, c.created_at AS posted_at, c.like_count
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

        const [loc] = await db.query(`
            SELECT d.*, c.name AS city_name
            FROM districts d
            JOIN cities c ON d.city_id=c.id 
            WHERE d.lng BETWEEN ? AND ? AND d.lat BETWEEN ? AND ?`, 
            [t_topleftx, t_bottomrightx, t_bottomrighty, t_toplefty]);

        if(loc.length==0){
            res.status(201).json({
                data_size: 0,
                data: []
            });

            return;
        }

        console.log(loc.length);

        const district_id_arr = loc.map(c=>c.id);
        const holder = district_id_arr.map(i=>'?').join(', ');

        const [db_res] = await db.query(
            `SELECT * from (SELECT c.district_id, c.content AS comment, c.id AS comment_id, u.username AS posted_by, c.created_at AS posted_at, c.like_count, ROW_NUMBER() OVER
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
                comment_id: e.comment_id,
                posted_by: e.posted_by,
                posted_at: e.posted_at,
                like_count: e.like_count
            });
        }

        console.log(comment_info);

        let data = [];

        for(const l of loc) 
        {
            const comments_temp = comment_info[l.id] || [];

            if(!comments_temp || comments_temp.length === 0)
                continue;

            
            data.push({
                mapx: l.lng,
                mapy: l.lat,
                district_id: l.id,
                address: {
                    city: l.city_name,
                    district: l.name
                },
                comments_size: comments_temp.length,
                comments: comments_temp
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
            `SELECT c.content AS comment, c.id AS comment_id, u.username AS posted_by, c.created_at AS posted_at, c.like_count
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

        let comment_info = {};
        let comment_info_dong = {};
        let data = [];

        const [loc] = await db.query(`
            SELECT r.*, d.name AS district_name, c.name AS city_name
            FROM roads r
            JOIN districts d ON d.id=r.district_id
            JOIN cities c ON c.id=r.city_id
            WHERE r.lng BETWEEN ? AND ? AND r.lat BETWEEN ? AND ?`, 
            [t_topleftx, t_bottomrightx, t_bottomrighty, t_toplefty]);

        const [loc_dong] = await db.query(`
            SELECT l.*, d.name AS district_name, c.name AS city_name
            FROM legal_dongs l 
            JOIN districts d ON d.id=l.district_id
            JOIN cities c ON c.id=l.city_id
            WHERE l.lng BETWEEN ? AND ? AND l.lat BETWEEN ? AND ?`,
            [t_topleftx, t_bottomrightx, t_bottomrighty, t_toplefty]
        );

        if(loc.length==0 && loc_dong.length==0){
            res.status(201).json({
                data_size: 0,
                data: []
            });

            return;
        }

        if(loc.length!=0)
        {
            const road_id_arr = loc.map(c=>c.id);
            const holder = road_id_arr.map(i=>'?').join(', ');

            const [db_res] = await db.query(
                `SELECT * from (SELECT c.road_id, c.id AS comment_id, c.content AS comment, u.username AS posted_by, c.created_at AS posted_at, c.like_count, ROW_NUMBER() OVER
                (PARTITION BY c.road_id ORDER BY c.like_count DESC) AS rn
                FROM comments c 
                JOIN user_db.users u ON c.user_id=u.id
                WHERE c.road_id IN (${holder}) AND c.road_id IS NOT NULL ) ranked
                WHERE rn<=2
                `, road_id_arr);

            for(const e of db_res)
            {
                if(!comment_info[e.road_id]) comment_info[e.road_id] = [];
                comment_info[e.road_id].push({
                    comment: e.comment,
                    comment_id: e.comment_id,
                    posted_by: e.posted_by,
                    posted_at: e.posted_at,
                    like_count: e.like_count
                });
            }

            for(const l of loc)
            {
                const comments_temp = comment_info[l.id] || [];
                if(!comments_temp || comments_temp.length === 0)
                    continue;
                
                data.push({
                    mapx: l.lng,
                    mapy: l.lat,
                    is_road: true,
                    address: {
                        city: l.city_name,
                        district: l.district_name,
                        legal_dong: null,
                        road: l.name
                    },
                    loc_id: l.id,
                    comments_size: comments_temp.length,
                    comments: comments_temp
                });
            }
        }
        

        if(loc_dong.length!=0)
        {
            const dong_id_arr = loc_dong.map(c=>c.id);
            const holder_dong = dong_id_arr.map(i=>'?').join(', ');

            const [db_res_dong] = await db.query(
                `SELECT * FROM (SELECT c.legal_dong_id, c.id AS comment_id, c.content AS comment, u.username AS posted_by, c.created_at AS posted_at, c.like_count, ROW_NUMBER() OVER
                (PARTITION BY c.legal_dong_id ORDER BY c.like_count DESC) AS rn
                FROM comments c
                JOIN user_db.users u ON c.user_id=u.id
                WHERE c.legal_dong_id IN (${holder_dong}) AND c.legal_dong_id IS NOT NULL ) ranked
                WHERE rn<=2`, dong_id_arr);
            
            for(const e of db_res_dong)
            {
                if(!comment_info_dong[e.legal_dong_id]) comment_info_dong[e.legal_dong_id] = [];
                comment_info_dong[e.legal_dong_id].push({
                    comment: e.comment,
                    comment_id: e.comment_id,
                    posted_by: e.posted_by,
                    posted_at: e.posted_at,
                    like_count: e.like_count
                });
            }

            for(const l of loc_dong)
            {
                const comments_temp = comment_info_dong[l.id] || [];
                if(!comments_temp || comments_temp.length === 0)
                    continue;
                
                data.push({
                    mapx: l.lng,
                    mapy: l.lat,
                    is_road: false,
                    address: {
                        city: l.city_name,
                        district: l.district_name,
                        legal_dong: l.name,
                        road: null
                    },
                    loc_id: l.id,
                    comments_size: comments_temp.length,
                    comments: comments_temp
                });
            }
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
                `SELECT c.content, c.id AS comment_id, u.username AS posted_by, c.created_at AS posted_at, c.like_count
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
                `SELECT c.content, c.id AS comment_id, u.username AS posted_by, c.created_at AS posted_at, c.like_count
                FROM comments c
                JOIN user_db.users u ON u.id=c.user_id
                WHERE c.legal_dong_id IS NOT NULL AND c.legal_dong_id=?
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

        const [loc] = await db.query(`
            SELECT a.*, r.name AS road_name, d.name AS district_name, c.name AS city_name, a.is_road
            FROM addresses a
            LEFT JOIN roads r ON r.id=a.road_id
            JOIN districts d ON d.id=a.district_id
            JOIN cities c ON c.id=a.city_id
            WHERE a.lng BETWEEN ? AND ? AND a.lat BETWEEN ? AND ? AND a.is_road=1`, 
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
            `SELECT * from (SELECT c.address_id, c.id AS comment_id, c.content AS comment, u.username AS posted_by, c.created_at AS posted_at, c.like_count, ROW_NUMBER() OVER
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
                comment_id: e.comment_id,
                posted_by: e.posted_by,
                posted_at: e.posted_at,
                like_count: e.like_count
            });
        }

        let data = [];

        for(const l of loc)
        {
            const comments_temp = comment_info[l.id] || [];
            if(!comments_temp || comments_temp.length === 0)
                continue;
            
            data.push({
                mapx: l.lng,
                mapy: l.lat,
                address_id: l.id,
                is_road: l.is_road,
                address: {
                    city: l.city_name,
                    district: l.district_name,
                    roads: l.road_name,
                    building_num: l.address_num
                },
                comments_size: comments_temp.length,
                comments: comments_temp
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
            `SELECT c.content AS comment, c.id AS comment_id, u.username AS posted_by, c.created_at AS posted_at, c.like_count
                FROM comments c
                JOIN user_db.users u ON u.id=c.user_id
                WHERE c.address_id=?
                ORDER BY c.like_count DESC
                LIMIT 10
                OFFSET ?`, [address_id_t, offset_t]);

        res.status(201).json({
            data_size: address_row.length,
            offset: offset_t+address_row.length,
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
    try{
    
        const {TopLeftX, TopLeftY, BottomRightX, BottomRightY} = req.query;
        console.log(`자료형: ${typeof(TopLeftX)} ${typeof(TopLeftY)} ${typeof(BottomRightX)} ${typeof(BottomRightY)}\n`);
        console.log(`값: ${TopLeftX} ${TopLeftY} ${BottomRightX} ${BottomRightY}`);
        console.log(req.query);
        const t_topleftx = Math.min(parseFloat(TopLeftX), parseFloat(BottomRightX));
        const t_toplefty = Math.max(parseFloat(TopLeftY), parseFloat(BottomRightY));
        const t_bottomrightx = Math.max(parseFloat(TopLeftX), parseFloat(BottomRightX));
        const t_bottomrighty = Math.min(parseFloat(TopLeftY), parseFloat(BottomRightY));

        const [loc] = await db.query(`
            SELECT a.*, r.name AS road_name, d.name AS district_name, c.name AS city_name, l.name AS legal_dong_name, a.is_road
            FROM addresses a
            LEFT JOIN roads r ON r.id=a.road_id
            LEFT JOIN legal_dongs l ON l.id=a.legal_dong_id
            JOIN districts d ON d.id=a.district_id
            JOIN cities c ON c.id=a.city_id
            WHERE a.lng BETWEEN ? AND ? AND a.lat BETWEEN ? AND ?`, 
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
            `SELECT * from (SELECT c.address_id, c.id AS comment_id, c.content AS comment, u.username AS posted_by, c.created_at AS posted_at, c.like_count, ROW_NUMBER() OVER
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
                comment_id: e.comment_id,
                posted_by: e.posted_by,
                posted_at: e.posted_at,
                like_count: e.like_count
            });
        }

        let data = [];

        for(const l of loc)
        {
            const comments_temp = comment_info[l.id] || [];
            if(!comments_temp || comments_temp.length === 0)
                continue;
            
            data.push({
                mapx: l.lng,
                mapy: l.lat,
                address_id: l.id,
                is_road: l.is_road,
                address: {
                    city: l.city_name,
                    district: l.district_name,
                    roads: l.road_name || null,
                    legal_dong: l.legal_dong_name || null,
                    building_num: l.address_num
                },
                comments_size: comments_temp.length,
                comments: comments_temp
            });
        }

        res.status(201).json({
            data_size: data.length,
            data: data
        });

    }catch (err) {
        console.log("error: ", err.message);
        res.status(401).json({
            error: err.message
        });
    }
}

export async function get_all_level5(req, res)
{
    try{
        const {address_id, offset} = req.query;

        const address_id_t = parseInt(address_id);
        const offset_t = parseInt(offset);

        const [address_row] = await db.query(
            `SELECT c.content AS comment, c.id AS comment_id, u.username AS posted_by, c.created_at AS posted_at, c.like_count
                FROM comments c
                JOIN user_db.users u ON u.id=c.user_id
                WHERE c.address_id=?
                ORDER BY c.like_count DESC
                LIMIT 10
                OFFSET ?`, [address_id_t, offset_t]);

        res.status(201).json({
            data_size: address_row.length,
            offset: offset_t+address_row.length,
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