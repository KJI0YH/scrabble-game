import mongoose from "mongoose";
import { config } from '../config.js';

mongoose.connect(config.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('connected', () => {
    console.log('Mongoose connection open to ', config.DB_URL);
});

db.on('error', error => {
    console.warn(`Mongoose connection error: ${error}`);
});

db.on('disconnected', () => {
    console.warn('Mongoose connection disconnected');
})

export default mongoose;