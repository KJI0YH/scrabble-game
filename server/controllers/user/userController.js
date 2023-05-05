import { config } from '../../config.js';
import { ErrorHandler } from '../../middlewares/error.js';
import { verifyToken } from '../../middlewares/auth.js';
import { checkExisting, addUser } from '../../database/user.js';
import db from '../../database/db.js';
import { ObjectId } from 'mongodb';

const { JWT_SECRET, SALT_ROUNDS } = config;


const userController = {

    get: async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ success: false, message: 'Invalid user id' });
            }

            const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
            delete user.passwordHash;
            if (user) {
                return res.status(200).json({ success: true, user: user });
            } else {
                return res.status(400).json({ success: false, message: 'User does not exists' });
            }

        } catch {
            return res.status(500).json({ success: false, message: 'Can not get a user' });
        }
    }
}

export default userController;