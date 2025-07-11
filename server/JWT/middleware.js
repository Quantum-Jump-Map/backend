import jwt from 'jsonwebtoken';
import { makeToken } from './token.js';

const secretKey = process.env.JWT_SECRET;

export async function CheckAndRemakeToken(req, res, next) {
  const temp = req.headers.authorization;

  if (!temp || !temp.startsWith('Bearer ')) {
    console.log("no token");
    return res.status(401).json({ message: "No Token" });
  }

  const token = temp.split(' ')[1];

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;

    res.locals.newToken = await makeToken(decoded);

    next();
  } catch (err) {
    console.error("JWT Verify Error:", err);
    return res.status(403).json({ message: "Not verified token" });
  }
}
