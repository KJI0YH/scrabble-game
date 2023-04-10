import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { config } from '../config.js';
import { ErrorHandler } from '../middlewares/error.js';

import User, { checkExisting } from '../models/User.js';

const { JWT_SECRET, SALT_ROUNDS } = config;

const authController = {
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
            const newUser = new User({ login: login, passwordHash: passwordHash });

            await newUser.save();

            return res.json({
                success: true,
                message: 'Successfully registered',
            });
        } catch (error) {
            next(error);
        }
    },
}

export default authController;