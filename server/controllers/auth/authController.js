import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { config } from '../../config.js';
import { ErrorHandler } from '../../middlewares/error.js';
import { verifyToken } from '../../middlewares/auth.js';
import { checkExisting, addUser } from '../../database/user.js';

const { JWT_SECRET, SALT_ROUNDS } = config;


const authController = {

    login: async (req, res, next) => {
        try {
            const { login, password } = req.body;

            if (!login) {
                throw new ErrorHandler(401, 'No login found. Enter a login and try again!');
            }

            const existed = await checkExisting(login);
            if (!existed) {
                throw new ErrorHandler(401, 'Username or password is incorrect. Try again!');
            }

            const match = await bcrypt.compare(password, existed.passwordHash);
            if (!match) {
                throw new ErrorHandler(401, 'Username of password is incorrect. Try again!');
            }

            const token = jwt.sign({ login: login, userID: existed._id }, JWT_SECRET, { expiresIn: '1h' });
            return res.json({ success: true, token });
        } catch (error) {
            next(error);
        }
    },

    register: async (req, res, next) => {
        try {
            if (!req.body) {
                throw new ErrorHandler(400, 'Invalid request');
            }

            const { login, password } = req.body;
            const exists = await checkExisting(login);

            if (exists) {
                throw new ErrorHandler(400, 'Login already exists. Try another one!');
            }

            const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
            await addUser(login, passwordHash);

            return res.json({
                success: true,
                message: 'Successfully registered',
            });
        } catch (error) {
            next(error);
        }
    },

    verify: (req, res) => {
        if (!req.body) {
            throw new ErrorHandler(401, 'Unauthroized user and/or route');
        }

        const { token } = req.body;
        const decoded = verifyToken(token);

        if (!decoded) {
            throw new ErrorHandler(401, 'Unauthorized action. JWT expired');
        }

        return res.status(200).json({ success: true, token: token, decoded });
    }
}

export default authController;