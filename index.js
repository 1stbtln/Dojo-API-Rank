const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('public'));

const pubgAuthToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI0ZjQwOTgxMC0yZTRjLTAxM2MtMWFjMi0wNjAzNzFjMDFlZTQiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNjkzOTQwMzg4LCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6ImtpbGwtcmVjb3JkLXYxIn0.UmtcORtJXnGlxT5CBIcz24BtM338rQzlYU3oWJ81Nc8'; // Make sure to replace this with your actual token

const playerNames = {
    // Define your player names and IDs here
    'account.5a2d79249212408792a4266e820ed5d4': '1stbtln',
    'account.928ae95a140f4158aa1852d48d487e2c': 'Forest_Blood',
    'account.f81c61ced0f7486cb3b53a17b64eef5a': 'cLkbAiT',
    'account.58317caa46be4138b3f285cdc1ac4519': 'jamryani',
    'account.2fe8afb68a3c4d4dae9e1d05f379e933': 'TwentyOneHill',
    // Add additional players as needed
    'account.861b679e209146dc998055250e5f6644': 'Gibstone',
    'account.f100704743654bb2bd70be191581439f': 'BajaMike',
    'account.4ff9aee51e49455cb4a40a13b041cc0d': 'eatsomecake',
    'account.bd78e31554ae4428bc2318439209930a': 'Impereal',
};

async function fetchPlayerData(accountId) {
    try {
        const response = await axios.get(`https://api.pubg.com/shards/steam/players/${accountId}/seasons/division.bro.official.pc-2018-28?filter[gamepad]=false`, {
            headers: {
                'Authorization': `Bearer ${pubgAuthToken}`,
                'Accept': 'application/vnd.api+json'
            }
        });

        if (response.data && response.data.data && response.data.data.attributes) {
            const stats = response.data.data.attributes.gameModeStats['squad-fpp'];
            const avgDamage = stats.damageDealt / stats.roundsPlayed;
            const avgKills = stats.kills / stats.roundsPlayed;

            // Here we apply the weights directly in the score calculation
            const weightedScore = (avgDamage * 1.5) + (avgKills * 1.2);

            return {
                name: playerNames[accountId],
                accountId: accountId,
                roundsPlayed: stats.roundsPlayed,
                overallDamage: stats.damageDealt,
                totalKills: stats.kills,
                dBNOs: stats.dBNOs,
                wins: stats.wins,
                finalScore: weightedScore // This is now correctly calculated without an undefined variable
            };
        }
    } catch (error) {
        console.error(`Error fetching PUBG data for player ${accountId}:`, error.message);
    }
    return null;
}

app.get('/getPubgData', async (req, res) => {
    const playerDataPromises = Object.keys(playerNames).map(accountId => fetchPlayerData(accountId));
    const playersData = await Promise.all(playerDataPromises);
    const validPlayerData = playersData.filter(data => data != null);

    // Sort players by the finalScore, descending
    validPlayerData.sort((a, b) => b.finalScore - a.finalScore);

    res.render('index', {
        players: validPlayerData,
        success: validPlayerData.length > 0
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/getPubgData`);
});
