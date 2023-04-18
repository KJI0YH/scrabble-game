import mysql from 'mysql2';
import { config } from '../config.js';

const connection = mysql.createConnection({
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB,
})

// Connect to the database
connection.connect(function (err) {
    if (err) {
        console.error('Error connecting to database: ' + err.stack);
        return;
    }
    console.log('Connected to database ', config.DB);
});

export default connection;