import jwt from 'jsonwebtoken';
import makeToken from './token.js';

const secretKey = process.env.JWT_SECRET;

export function CheckAndRemakeToken(req, res, next)
{
    const temp = res.headers.authorization;

    if(!temp)
        return req.status(401).json({message: "No Token"});

    const token = temp.split(' ')[1];

    try{
        const decoded = jwt.decode(token, secretKey);
        req.user = decoded;

        res.locals.newToken = makeToken(decoded);

        next();

    } catch(err) {
        console.error("error", err);
        return res.status("403").json({message: "not verified token"});
    }
}