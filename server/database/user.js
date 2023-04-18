import db from "./db.js";

export async function checkExisting(login) {
    const result = await db.collection('users').findOne({ login: login });
    return result;
}

export async function addUser(login, passwordHash) {
    const user = { login: login, passwordHash: passwordHash };
    const result = await db.collection('users').insertOne(user);
    return result;
}