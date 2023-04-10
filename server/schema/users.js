import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
    login: {
        type: String,
        index: true,
        unique: true,
    },
    passwordHash: {
        type: String,
    }
});

export default usersSchema;