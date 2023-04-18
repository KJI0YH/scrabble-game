import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { ErrorHandler } from '../middlewares/error.js';

export const authenticateToken = (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new ErrorHandler(400, 'Authentication error: Missing token'));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return next(new ErrorHandler(400, 'Authentication error: Invalid token'));
    }

    socket.login = decoded.login;
    socket.userID = decoded.userID;
    next();
};

export const verifyToken = token => {
    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        return decoded;
    } catch {
        return false;
    }
};