const express = require('express');
require('./db/mongoose');
const Player = require('./models/player');
const Quest = require('./models/quest');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Players

app.post('/players', (req, res) => {
    const player = Player(req.body);
    player.save().then(() => {
        res.status(202).send(player);
    }).catch((error) => {
        res.status(400).send(error);
    })
});

app.get('/players', (req, res) => { 
    Player.find({}).then((players) => {
        res.status(200).send(players);
    }).catch((error) => {
        res.status(500).send();
    });
});

app.get('/players/:id', (req, res) => {
    const _id = req.params.id;
    Player.findById(_id).then((player) => {
        if(!player) {
            return res.status(404).send();
        }
        res.status(200).send(player);
    }).catch((error) => {
        res.status(500).send();
    });
});

app.get('/quests', (req, res) => { 
    Quest.find({}).then((quests) => {
        res.status(200).send(quests);
    }).catch((error) => {
        res.status(500).send();
    });
});

app.get('/quests/:id', (req, res) => {
    const _id = req.params.id;
    Quest.findById(_id).then((quest) => {
        if(!quest) {
            return res.status(404).send();
        }
        res.status(200).send(quest);
    }).catch((error) => {
        res.status(500).send();
    });
});

// Quests

app.post('/quests', (req, res) => {
    const quest = Quest(req.body);
    quest.save().then(() => {
        res.status(202).send(quest);
    }).catch((error) => {
        res.status(400).send(error);
    })
});


app.listen(port, () => {
    console.log('Server is up on port ' + port);
})