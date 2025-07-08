import { init_fcm } from "./fcm_init.js";
import userDb from "../db/userDb.js";

const admin = init_fcm();

async function getfcmToken(user_id)
{
    try{
        const [ret] = await userDb.query(`
            SELECT * FROM fcm_tokens
            WHERE user_id=?`, [user_id]);

        if(ret.length==0)
            return [];

        return ret;
    
    } catch(err) {
        console.log(err);
        return [];
    }
}

export async function sendFollow(follower_username, user_id)  //팔로우 알림
{
    try {

        const info = getfcmToken(user_id);
        if(info.length==0)
            return;
        
        let fcmTokens = [];
        
        for(const data of info)
            fcmTokens.push(data.fcm_token);

        const message = {
            tokens: fcmTokens,
            notification: {
                title: "새로운 팔로워",
                body: `${follower_username}님께서 팔로우 하셨습니다`
            } 
        };

        const response = await admin.getMessaging().sendEachForMulticast(message);
        if(response.failureCount>0)
        {
            console.log("error: some tokens were not sent");
            return;
        }

    } catch(err) {
        console.log(err);
        return;
    }
}


export async function sendLike(comment, like_user_id, user_id)  //댓글 좋아요 알림
{


}


export async function sendComment(comment, comment_2, commentor_id, user_id)  //대댓글 알림
{



}