import { config } from '../config.js';
import { MongoClient } from 'mongodb';

async function connectToDb() {
    try {
        const mongoClient = new MongoClient(config.DB_URL);
        console.log('Connecting to MongoDB Atlas cluster...');
        await mongoClient.connect();
        console.log('Successfully connected to MongoDB Atlas!');
        return mongoClient.db(config.DB_NAME);
    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        process.exit();
    }
}

const db = await connectToDb();

export default db;
