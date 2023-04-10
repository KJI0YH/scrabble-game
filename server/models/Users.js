import mongoose from "mongoose";
import usersSchema from "../schema/users";

const Users = mongoose.model('Users', usersSchema);
export default Users;