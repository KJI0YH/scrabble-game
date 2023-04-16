import dotenv from 'dotenv';
dotenv.config();

function getDefault(value, defaultValue) {
    if (!value || value === 'undefined') {
        return defaultValue;
    }
    return value;
}

const productionHosts = ['*'];
const devHosts = ['http://localhost:3000'];

export const config = {
    API_PORT: process.env.API_PORT ? Number.parseInt(process.env.API_PORT, 10) : 8080,
    SOCKET_PORT: process.env.SOCKET_PORT ? Number.parseInt(process.env.SOCKET_PORT, 10) : 44444,
    ALLOW_LIST_HOSTS: getDefault(process.env.NODE_ENV, 'development') === 'production' ? productionHosts : devHosts,

    SALT_ROUNDS: process.env.SALT_ROUNDS ? Number.parseInt(process.env.SALT_ROUNDS, 10) : 10,
    JWT_SECRET: getDefault(process.env.JWT_SECRET, 'SECRET'),

    DB_HOST: process.env.DB_HOST ?? '127.0.0.1',
    DB_USER: process.env.DB_USER ?? 'root',
    DB_PASSWORD: process.env.DB_PASSWORD ?? 'root',
    DB: 'scrabble_db',
};