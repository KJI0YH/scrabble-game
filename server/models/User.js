import mongoose from "mongoose";
import usersSchema from "../schema/user.js";

const User = mongoose.model('Users', usersSchema);
export default User;

/**
 * Checks if login already exists
 * @param {login} user login to check
 * @returns {boolean|Object} true if login existing, false otherwise
 */
export async function checkExisting(login) {
    const match = await User.findOne({ login: login });
    return match;
}