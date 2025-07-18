import userDb from '../db/userDb.js';
import Db from '../db/appDb.js';

export async function createComment(req, res){

    try{

        if(!req.user)
        {
            console.log("error: no user");
            return res.status(401).json({
                error: "no user"
            });
        }

    
        const user = req.user;
        const {comment2, comment_id} = req.body;

        if(!comment2 || !comment_id) //body 내용이 없을 때
        {
            console.log("error: missing body");
            return res.status(401).json({
                error: "missing values"
            });
        }

        const comment_id_int = parseInt(comment_id); 

        await Db.execute(`     
            INSERT INTO comments2
            (comment_id, user_id, content) VALUES(?,?,?)`,
            [comment_id_int, user.id, comment2]);   //대댓글 등록

        await Db.execute(`
            UPDATE comments
            SET comments2_count=comments2_count+1
            WHERE id=?`, [comment_id_int]);  //대댓글 개수 업데이트

        await userDb.execute(`
            UPDATE users
            SET total_comment_count=total_comment_count+1
            WHERE id=?`, [user.id]);   //총 댓글 개수 업데이트


        console.log("대댓글 등록 완료");
        return res.status(201).json({
            message: "댓글 등록 완료"
        });


    } catch(err) {
        console.error("error: ", err);
        return res.status(404).json({
            message: "error saving message"
        });
    }
}


export async function deleteComment(req, res)
{
    try{

        if(!req.user)  //사용자 정보가 없을 때
        {
            console.log("error: no user");
            return res.status(401).json({
                error: "no user"
            });
        }

        const user = req.user;
        const {comment2_id, comment_id} = req.body;

        if(!comment2_id || !comment_id)  //body 가 없을 때
        {
            console.log("error: missing body");
            return res.status(401).json({
                error: "missing values"
            });
        }

        const comment2_id_int = parseInt(comment2_id);
        const comment_id_int = parseInt(comment_id);

        const [ret] = await Db.query(`
            SELECT * FROM comments2
            WHERE id=?`, [comment2_id_int]);

        if(ret.length==0)  //대댓글이 없을 때
        {
            console.log("error: no comment");
            return res.status(401).json({
                error: "no comment"
            });
        }

        if(ret[0].id!=user.id)   //댓글을 올린 사람이 아닐 떄
        {
            console.log("error: not authorized to delete");
            return res.status(401).json({
                error: "not authorized to delete this comment"
            });
        }

        await Db.execute(`
            DELETE FROM comments2
            WHERE id=?`, [comment2_id_int]);   //지우기

        await Db.execute(`
            UPDATE comments
            SET comments2_count=comments2_count-1
            WHERE id=?`, [comment_id_int]);  //댓글의 대댓글 개수 업데이트

        
        await userDb.execute(`
            UPDATE users
            SET total_comment_count=total_comment_count-1
            WHERE id=?`, [user.id]
        );  //사용자 총 댓글 개수 업데이트

        console.log("comments2 erased");
        return res.status(201).json({
            message: "done"
        });
        

    } catch(err) {
        console.error("error: ", err);
        return res.status(404).json({
            error: err
        });
    }
}


export async function editComment(req, res)
{

    try {

        if(!req.user)  //사용자 정보가 없을 때
        {
            console.log("error: no user");
            return res.status(401).json({
                error: "no user info"
            });
        }

        const user = req.user;
        const {comment2_id, comment2} = req.body;

        if(!comment2_id || !comment2)   //body가 없을 때
        {
            console.log("error: missing body");
            return res.status(401).json({
                error: "missing values"
            });
        }

        const comment2_id_int = parseInt(comment2_id);

        const [ret] = await Db.query(`
            SELECT * FROM comments2
            WHERE id=?`, [comment2_id_int]);

        if(ret.length==0)
        {
            console.log("error: no comment");
            return res.status(401).json({
                error: "no comment"
            });
        }

        if(ret[0].user_id!=user.id)
        {
            console.log("error: not authorized to modify");
            return res.status(401).json({
                error: "not authorized to modify"
            });
        }

        await Db.execute(`
            UPDATE comments2
            SET content=?
            WHERE id=?`, [comment2, comment2_id_int]);

        console.log("done updating comment2");

        return res.status(201).json({
            message: "updated comment"
        });

    } catch(err) {
        console.error("error: ", err);
        return res.status(404).json({
            error: err
        });
    }
}


export async function likeComment(req, res)
{

    try{

        if(!req.user)  //사용자 정보가 없을 때
        {
            console.log("error: no user");
            return res.status(401).json({
                error: "no user info"
            });
        }

        const {comment2_id} = req.body;
        const user = req.user;
        

        if(!comment2_id)  //body 내용이 없을 때
        {
            console.log("error: missing body");
            return res.status(401).json({
                error: "missing values"
            });
        }

        const comment2_id_int = parseInt(comment2_id);

        const [ret] = await Db.query(`
            SELECT * FROM comments2
            WHERE id=?
            `, [comment2_id_int]);

        if(ret.length==0)  //조회된 댓글이 없을 때
        {
            console.log("error: no comment");
            return res.status(401).json({
                error: "no comment"
            });
        }

        if(ret[0].user_id==user.id)  //스스로의 댓글을 좋아요 누를 때
        {
            console.log("error: liking one's comment is prohibited");
            return res.status(401).json({
                error: "liking one's comment is prohibited"
            });
        }


        const [ret_like] = await Db.query(`
            SELECT * FROM comment2_likes
            WHERE user_id=? AND comments2_id=?
            `, [user.id, comment2_id_int]);

        if(ret_like.length!=0)  //좋아요 취소
        {
            await Db.execute(`
                DELETE FROM comment2_likes
                WHERE user_id=? AND comments2_id=?
                `, [user.id, comment2_id_int]);  //좋아요 취소

            await Db.execute(`
                UPDATE comments2
                SET like_count=like_count-1
                WHERE id=?`, [comment2_id_int]);  //좋아요 취소 반영

            await userDb.execute(`
                UPDATE users
                SET total_like_count=total_like_count-1
                WHERE id=?`, [ret[0].user_id]);  //전체 좋아요수 취소 반영

            console.log("좋아요 취소 완료");
            return res.status(201).json({
                message: "like cancelled"
            });
        }

        else //좋아요 하기
        {     
            await Db.execute(`
                INSERT INTO comment2_likes
                (comments2_id, user_id) VALUES(?,?)`, [comment2_id_int, user.id]);  //좋아요 추가하기

            await Db.execute(`
                UPDATE comments2
                SET like_count=like_count+1
                WHERE id=?`, [comment2_id_int]);  //좋아요 반영

            await userDb.execute(`
                UPDATE users
                SET total_like_count=total_like_count+1
                WHERE id=?`, [ret[0].user_id]);  //전체 좋아요수 반영

            console.log("좋아요 완료");
            return res.status(201).json({
                message: "liked"
            });

        }

    } catch(err) {

        console.error("error: ", err);
        return res.status(404).json({
            error: err
        });
    }
}

export async function reportComment(req, res)
{

    try {

        if(!req.user)
        {
            console.log("error: no user");
            return res.status(401).json({
                error: "no user"
            });
        }
        
        if(!req.body)
        {
            console.log("no body");
            return res.status(401).json({
                error: "no body"
            });
        }

        const rep_data = req.body;
        const reporter_id = req.user.id;

        const [ret] = await reportdb.query(`
            SELECT * FROM report_db
            WHERE report_entity_type=3 AND report_entity_id=? AND reporter_id=?`,
            [rep_data.report_entity_id, reporter_id]);

        if(ret.length==0) {   //신고 되어 있는지 확인하기
            console.log("already reported");
            return res.status(401).json({
                message: 'Already Reported'
            });
        }

        await reportdb.execute(`
            INSERT INTO report_db
            (reporter_id, report_entity_type, report_entity_id, report_reason, report_details)
            VALUES(?,?,?,?,?)`,
            [reporter_id, 3, rep_data.report_entity_id, rep_data.report_reason, rep_data.report_details]);

        return res.status(201).json({
            message: "Reported"
        });

    } catch(err) {
        console.error("error: ", err);
        return res.status(404).json({
            error: err
        });
    }
}

