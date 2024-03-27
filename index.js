const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('public'));

const pubgAuthToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI0ZjQwOTgxMC0yZTRjLTAxM2MtMWFjMi0wNjAzNzFjMDFlZTQiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNjkzOTQwMzg4LCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6ImtpbGwtcmVjb3JkLXYxIn0.UmtcORtJXnGlxT5CBIcz24BtM338rQzlYU3oWJ81Nc8'; // Replace with your actual PUBG API token


const playerNames = {
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
            return {
                name: playerNames[accountId],
                accountId: accountId,
                roundsPlayed: stats.roundsPlayed,
                overallDamage: stats.damageDealt,
                totalKills: stats.kills,
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
    const validPlayerData = playersData.filter(data => data !== null);

    
    validPlayerData.sort((a, b) => b.totalKills - a.totalKills);

    res.render('index', {
        players: validPlayerData, 
        success: validPlayerData.length > 0
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/getPubgData`);
});
