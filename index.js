const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(express.static('public')); 

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const pubgAuthToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI0ZjQwOTgxMC0yZTRjLTAxM2MtMWFjMi0wNjAzNzFjMDFlZTQiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNjkzOTQwMzg4LCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6ImtpbGwtcmVjb3JkLXYxIn0.UmtcORtJXnGlxT5CBIcz24BtM338rQzlYU3oWJ81Nc8';

async function fetchPlayerData(accountId) {
  try {
    const response = await axios.get(`https://api.pubg.com/shards/steam/players/${accountId}/seasons/division.bro.official.pc-2018-27?filter[gamepad]=false`, {
      headers: {
        'Authorization': pubgAuthToken,
        'Accept': 'application/vnd.api+json'
      }
    });
    const stats = response.data.data[0].attributes.gameModeStats['squad-fpp'];
    return {
      roundsPlayed: stats.matchesPlayed,
      overallDamage: stats.damageDealt,
      totalKills: stats.kills
    };
  } catch (error) {
    console.error(`Error fetching PUBG data for player ${accountId}:`, error.response ? error.response.data : error.message);
    throw error;
  }
}

app.get('/getPubgData', async (req, res) => {
  try {
    const [player1Data, player2Data, player3Data, player4Data] = await Promise.all([
      fetchPlayerData('account.861b679e209146dc998055250e5f6644'),
      fetchPlayerData('account.f100704743654bb2bd70be191581439f'),
      fetchPlayerData('account.4ff9aee51e49455cb4a40a13b041cc0d'),
      fetchPlayerData('account.bd78e31554ae4428bc2318439209930a')
    ]);

    const rankArray = [
      (player1Data.roundsPlayed / player1Data.overallDamage) + player1Data.totalKills,
      (player2Data.roundsPlayed / player2Data.overallDamage) + player2Data.totalKills,
      (player3Data.roundsPlayed / player3Data.overallDamage) + player3Data.totalKills,
      (player4Data.roundsPlayed / player4Data.overallDamage) + player4Data.totalKills
    ];
   
    rankArray.sort((a, b) => b - a);

    res.render('index', {
      success: true,
      player1Var: rankArray[0],
      player2Var: rankArray[1],
      player3Var: rankArray[2],
      player4Var: rankArray[3],
    });

  } catch (error) {
    console.error('Error in /getPubgData:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }  
});
