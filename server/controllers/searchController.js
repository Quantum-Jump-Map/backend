import db from '../db/appDb.js';
import userdb from '../db/userDb.js';

export async function search(req, res){
 
    try{
        
        const {params, user_offset_t, comment_offset_t} = req.query;
        
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
        const comment_offset = (comment_offset_t==NULL)? 0: parseInt(comment_offset_t);

        //1. 사용자 검색

        const [user_rows] = userdb.query(
            `SELECT username AS user 
                FROM users
                WHERE username LIKE ?%
                ORDER BY username ASC
                LIMIT 5
                OFFSET ?`, [params, user_offset]);
        
        const new_user_offset = user_offset+user_rows.length;  //offset 의 새 길이


        //2. 댓글 검색

        //검색문으로 사용자 조회 
        const [user_rows_2] = userdb.query(
            `SELECT id AS userid
                FROM users
                WHERE username=?`, [params]);
        
        const searched_user = (user_rows_2.length==0) ? 0:user_rows_2[0];

        //검색 기능

        const [comment_rows] = db.query(
            `SELECT comment, posted_by, posted_at, like_count, mapx, mapy, address
            FROM (SELECT * FROM comments
            JOIN user_db.users u ON u.id=comments.user_id
            JOIN addresses a ON a. )`
        )
        

    } catch(err){
        
        console.error("error: ", err);
        res.status(501).json({
            error: err
        });

        return;
    }
}