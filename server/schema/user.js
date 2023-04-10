import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    login: {
        type: String,
        index: true,
        unique: true,
    },
    passwordHash: {
        type: String,
    }
});

export default userSchema;