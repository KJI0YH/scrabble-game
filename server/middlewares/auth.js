import jwt from 'jsonwebtoken';
import { config } from '../config.js';

const auth = (req, res, next) => {
    const token = req.headers.authorization;
    jwt.verify(token, config.JWT_SECRET, (error, _) => {
        if (error) {
            res.json('Token not provided');
        } else {
            next();
        }
    });
};

export const verifyToken = token => {
    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        return decoded;
    } catch {
        return false;
    }
};

export default auth;