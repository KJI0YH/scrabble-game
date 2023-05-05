const q = Math.log(10) / 400;
const qSquared = Math.pow(q, 2);
const g = (rd) => 1 / Math.sqrt(1 + 3 * Math.pow(rd, 2) * qSquared / Math.pow(Math.PI, 2));

export function calculateGlicko(players, results) {
    const newRatings = [];
    const newRDs = [];

    players.forEach((player, i) => {
        let dSquared = 0;
        let expected = 0;

        players.forEach((opponent, j) => {
            if (i !== j) {
                const gRD = g(opponent.ratingDeviation);
                const E = 1 / (1 + Math.pow(10, -gRD * (player.ratingGlicko - opponent.ratingGlicko) / 400));
                const actualScore = results[i][j];

                dSquared += Math.pow(gRD, 2) * E * (1 - E) * qSquared;
                expected += gRD * (actualScore - E);
            }
        });
        dSquared = Math.pow(dSquared, -1);

        const newRating = player.ratingGlicko + (q / ((1 / Math.pow(player.ratingDeviation, 2) + 1 / dSquared))) * expected;
        const newRD = Math.sqrt(Math.pow((1 / Math.pow(player.ratingDeviation, 2) + 1 / dSquared), -1));

        newRatings.push(newRating);
        newRDs.push(newRD);
    });

    newRatings.forEach((rating, i) => {
        players[i].ratingGlicko = rating;
        players[i].ratingDeviation = newRDs[i];
    });

    return players;
}