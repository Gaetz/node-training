require('dotenv').config();
const express = require('express');
require('./db/mongoose');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const playerRouter = require('./routers/player');
app.use(playerRouter);

const questRouter = require('./routers/quest');
app.use(questRouter);

app.listen(port, () => {
    console.log('Server is up on port ' + port);
})

/* Quest to Player 
const Quest = require('./models/quest')
const testQ2P = async () => {
    const quest = await Quest.findById('5ec23ce04e5e3b2040fddea3')
    await quest.populate('owner').execPopulate()
    console.log(quest.owner)
}
testQ2P()
*/
/* POlayer to Quests
const Player = require('./models/player')
const testP2Q = async () => {
    const player = await Player.findById('5ebd5a3986092e0974fee144')
    await player.populate('quests').execPopulate()
    console.log(player.quests)
}
testP2Q()
*/