import db from '../db/userDb.js';


export async function login(req, res)  //로그인했을때 토큰 갱신 또는 유지
{
    try{
        
        if(!req.body.token || !req.body.device_id)
        {
            console.log('error: no fcm token');
            res.status(401).json({
                message: 'no token'
            });

            return;
        }

        const user_id = req.user.id;   //사용자 id
        const user_name = req.user.username  //사용자 닉네임


        const [ret] = await db.query(`
            SELECT * FROM fcm_tokens
            WHERE user_id=? AND device_id=?
            `, [user_id, req.body.device_id]);

        if(ret.length==0)  //저장된 토큰이 없을 때
        {
            await db.execute(`
                INSERT INTO fcm_tokens
                (user_id, fcm_token, username, device_id) VALUES (?,?,?,?)`, [user_id, req.body.token, user_name, req.body.device_id]);

            return res.status(201).json({
                message: 'saved fcm token'
            });
        }

        if(ret[0].fcm_token!=req.body.token)
        {
            await db.execute(`
                UPDATE fcm_tokens
                SET fcm_token=?
                WHERE user_id=? AND device_id=?`);

            return res.status(201).json({
                message: 'updated fcm token'
            });
        }

        return res.status(201).json({
            message: 'token already exists'
        });

    } catch(err) {
        
        console.log(err);
        return res.status(401).json({
            error: err
        });
    }
}


export async function logout(req, res)  //로그아웃 시 토큰 지우기
{
    try{
        if(!req.body.token)  //토큰이 없을 때
        {
            console.log("error: no fcm token");
            return res.status(201).json({
                message: 'No fcm token'
            });
        }

        const user_id = req.body.id;
        
        await db.query(`
            DELETE FROM fcm_tokens
            WHERE user_id=? AND fcm_token=?`, [user_id, req.body.token]);

        res.status(401).json({
            message: 'fcm token deleted'
        });

        return;

    } catch(err) {

        console.log(err);
        return res.status(401).json({
            error: err
        });

    }
}