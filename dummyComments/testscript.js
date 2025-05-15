import axios from 'axios';
import fs from 'fs';


const map_society = axios.create({
    baseURL: "http://azbayor2.tplinkdns.com:3000/",
    timeout: 3000
});

const dummyComments = JSON.parse(fs.readFileSync('./dummycomments.json', 'utf8'));
const register_info = JSON.parse(fs.readFileSync('./logininfo.json', 'utf8'));

const register_req_config = {
    url: "users/register",
    method: "post",
    data: {
        username: register_info.username,
        password: register_info.password,
        name: register_info.name,
        email: register_info.email,
        birth_date: register_info.birth_date,
        gender: register_info.gender
    }
};

const login_req_config = {
    url: "users/loginUser",
    method: "post",
    data: {
        username: register_info.username,
        password: register_info.password
    }
};


async function add_dummy_data()
{
        await map_society.request(register_req_config);  //회원가입
        const res = await map_society.request(login_req_config);  //로그인 시도

        if(res.data.message !== "로그인 성공")
        {
            console.log("error: 로그인 실패");
            return;
        }

        const res_token = res.data.token;
        const token_header = "Bearer " + res_token;

        for(const j of dummyComments.data)
        {
            const comment_data = {
                content: j.content,
                latitude: j.latitude,
                longitude: j.longitude
            };

            const comment_res = await map_society.request({
                url: "comments/createComment",
                method: "post",
                headers: {
                    'Authorization': token_header
                },
                data: comment_data
            });

            if(!comment_res.data || comment_res.data.message !== "댓글 저장 완료")
            {
                console.log("error: 댓글 저장 실패");
            }
        }


}

add_dummy_data();

