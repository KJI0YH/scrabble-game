import db from "./db.js";

export async function checkExisting(login) {
    const result = await db.collection('users').findOne({ login: login });
    return result;
}

export async function addUser(login, passwordHash) {
    const user = {
        login: login,
        passwordHash: passwordHash,
        gamesPlayed: 0,
        wins: 0,
        draws: 0,
        loses: 0,
        averageGameScore: 0,
        maxScore: 0,
        joined: new Date(),
        ratingGlicko: 1000,
        ratingDeviation: 350,
    };
    const result = await db.collection('users').insertOne(user);
    return result;
}