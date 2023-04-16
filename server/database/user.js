import connection from "./db.js";

export const checkExisting = async (login) => {
    const [result] = await connection.promise().query('SELECT * FROM scrabble_db.user WHERE login = ?', [login]);
    return result[0];
};

export const addUser = async (login, password_hash) => {
    await connection.execute('INSERT INTO user (login, password_hash, last_online) VALUES(?, ?, NOW())', [login, password_hash]);
}   