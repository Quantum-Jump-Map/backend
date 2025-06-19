import db from '../db/live_messageDB.js';
import { get_db_pool } from '../db/eventDb.js';

const event_db = get_db_pool();

export async function make_room(roomId) {    //방 만들기 
    try{

        const [res] = await db.query('SELECT * FROM message_room WHERE id=?', [roomId]);
        if(res.length!=0)
            return res[0].room_name;

        const [event_info] = await event_db.query(`
            SELECT content_id, title FROM festivals WHERE content_id=?`, [roomId]);

        if(event_info.length==0)
        {
            console.log("error: no event found");
            return;
        }

        const event_name = event_info[0].title;

        await db.execute(`INSERT INTO message_room (id, room_name) VALUES(?,?)`, [roomId, event_name]);

        return event_name;

    } catch(err) {
        console.log("error: ", err.message);
    }
}


export async function insert_message(info, user_id) {   //메시지 저장 
    try{
        
        const {roomId, message} = info;

        if(!roomId || !message || !user_id)
        {
            console.log("error: missing field");
            return null;
        }

        const [res] = await db.execute(`INSERT INTO messages (room_id, content, user_id)   
            VALUES(?,?,?)`, [roomId, message, user_id]);    //저장 

        const [res_t] = await db.query(`
            SELECT * FROM messages WHERE id=?`, [res.insertId]);    //조회

        return res_t[0] || null;
        

    } catch(err) {
        console.log("error: ", err.message);
        return null;
    }
}



