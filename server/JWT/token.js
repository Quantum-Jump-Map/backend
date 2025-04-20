// 토큰 발급, 토큰 갱신, 토큰 검사
import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET;
const timeOut = process.env.JWT_EXPIRES_IN;

export function makeToken(user)
{
    const payload = {
        id: user.id,
        username: user.username
    };

    return jwt.sign(payload, secretKey, timeOut);
}



