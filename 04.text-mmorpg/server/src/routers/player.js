const express = require('express');
const router = new express.Router();
const Player = require('../models/player');

router.post('/players', async (req, res) => {
    const player = Player(req.body);
    try {
        await player.save();
        res.status(202).send(player);
    } catch(error) {
        res.status(400).send(error);
    }
});

/*
Formerly:
app.post('/players', (req, res) => {
    const player = Player(req.body);
    player.save().then(() => {
        res.status(202).send(player);
    }).catch((error) => {
        res.status(400).send(error);
    })
});
*/

router.get('/players', async (req, res) => { 
    try {
        const players = await Player.find({})
        res.status(200).send(players);
    } catch(error) {
        res.status(500).send();
    }
});

router.get('/players/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        const player = await Player.findById(_id);
        if(!player) {
            return res.status(404).send();
        }
        res.status(200).send(player);
    } catch(error) {
        res.status(500).send();
    }
});

router.patch('/players/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    console.log(updates)
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValid = updates.every( (update) => allowedUpdates.includes(update));
    if(!isValid) {
        return res.status(400).send();
    }

    try {
        const player = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if(!player) {
            return res.status(404).send();
        }
        res.send(player);
    } catch(error) {
        res.status(400).send();
    }
});

router.delete('/players/:id', async (req, res) => {
    try {
        const player = await Player.findByIdAndDelete(req.params.id);
        if(!player) {
            return res.status(404).send();
        }
        res.send(player);
    } catch(error) {
        res.status(500).send();
    }
});

module.exports = router;