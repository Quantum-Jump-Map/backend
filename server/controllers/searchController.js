//import db from '../db/appDb.js';
import userdb from '../db/userDb.js';

export async function userSearch(req, res){
 
    try{
        
        const {params, user_offset_t} = req.query;
        
        if(!params) //검색어가 없을 때 
        {
            console.log("error: no search parameter");
            res.status(401).json({
                error: "no search parameter"
            });

            return;
        }

        //오프셋 숫자로 변환 
        const user_offset = (user_offset_t==NULL) ? 0 : parseInt(user_offset_t);

        //사용자 검색

        const [user_rows] = userdb.query(
            `SELECT username AS user 
                FROM users
                WHERE username LIKE ?%
                ORDER BY username ASC
                LIMIT 5
                OFFSET ?`, [params, user_offset]);
        
        const new_user_offset = user_offset+user_rows.length;  //offset 의 새 길이

        res.status(201).json({
            token: res.locals.newToken,
            current_offset: new_user_offset,
            users: user_rows
        });
        

    } catch(err){
        
        console.error("error: ", err);
        res.status(501).json({
            error: err
        });

        return;
    }
}