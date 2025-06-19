import db from '../db/live_messageDB.js';
//import { get_db_pool } from '../db/eventDb.js';


export async function message_like(req, res) {
    
    try{
        
        const user_id = req.user.id;
        const {message_id, roomId} = req.body;

        const [res1] = await db.query(`
            SELECT * FROM message_likes WHERE room_id=? AND message_id=? AND user_id=?`, 
            [roomId, message_id, user_id]);

        if(res1.length==0)  //좋아요가 없을 때 
        {
            const [ret] = await db.query(`
                INSERT INTO message_likes (room_id, message_id, user_id)
                VALUES(?,?,?)`, [roomId, message_id, user_id]);

            await db.execute(`
                UPDATE messages
                SET like_counts = like_counts+1
                WHERE id=?`, [message_id]);

            return res.status(201).json({
                message: "message liked"
            });
        }

        else {
            const [ret] = await db.execute(`
                DELETE from message_likes
                WHERE id=?`, [res1[0].id]);

            await db.execute(`
                UPDATE messages
                SET like_counts = like_counts-1
                WHERE id=?`, [message_id]);

            return res.status(201).json({
                message: "message liked cancelled"
            });
        }


    } catch(err) {

        console.log("error: ", err.message);
        return res.status(501).json({
            error: err.message
        });

    }
}

export async function enter_room(req, res)
{

    try{

        const {roomId} = req.query;

        if(!roomId)
            return res.status(401).json({
                error: "missing field"    
            });

        const roomId_t = parseInt(roomId);

        const [ret] = await db.query(`
            SELECT m.*, u.username
            FROM messages m
            JOIN user_db.users u ON u.id=m.user_id
            WHERE m.room_id=?
            ORDER BY m.posted_at DESC
            LIMIT 50`, [roomId_t]);

        return res.status(201).json({
            messages: ret,
            token: res.locals.newToken
        });


    } catch(err) {

        console.log("error: ", err.message);
        return res.status(501).json({
            error: err.message
        });
    }
}



export async function get_previous_message(req, res) {

    try {

        const {roomId, last_message} = req.query;

        const roomId_t = parseInt(roomId);
        const last_message_t = parseInt(last_message) ;

        if(!roomId || !last_message)
            return res.status(401).json({
                error: "missing field"    
            });

        const [ret] = await db.query(`
            SELECT m.*, u.username
            FROM messages m
            JOIN user_db.users u ON u.id=m.user_id
            WHERE m.room_id=? AND m.id<?
            ORDER BY m.posted_at DESC
            LIMIT 50`, [roomId_t, last_message_t]);

        return res.status(201).json({
            messages: ret,
            token: res.locals.newToken
        });


    } catch(err) {

        console.log("error: ", err.message);
        return res.status(501).json({
            error: err.message
        });

    }
}
