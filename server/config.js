import dotenv from 'dotenv';
dotenv.config();

function getDefault(value, defaultValue) {
    if (!value || value === 'undefined') {
        return defaultValue;
    }
    return value;
}

const productionHosts = ['http://192.168.100.2:3000'];
const devHosts = ['http://localhost:3000', 'http://192.168.100.2:3000', 'http://192.168.191.115:3000', 'http://192.168.100.207:3000'];

export const config = {
    API_PORT: process.env.API_PORT ? Number.parseInt(process.env.API_PORT, 10) : 8080,
    SOCKET_PORT: process.env.SOCKET_PORT ? Number.parseInt(process.env.SOCKET_PORT, 10) : 44444,
    ALLOW_LIST_HOSTS: getDefault(process.env.NODE_ENV, 'development') === 'production' ? productionHosts : devHosts,

    SALT_ROUNDS: process.env.SALT_ROUNDS ? Number.parseInt(process.env.SALT_ROUNDS, 10) : 10,
    JWT_SECRET: getDefault(process.env.JWT_SECRET, 'SECRET'),

    DB_URL: getDefault(process.env.DB_URL, 'mongodb://127.0.0.1:27017/'),
    DB_NAME: getDefault(process.env.DB_NAME, 'scrabble_db'),

    YANDEX_DICTIONARY_API_KEY: getDefault(process.env.YANDEX_DICTIONARY_API_KEY, '<your yandex dictoinary API key>')
};