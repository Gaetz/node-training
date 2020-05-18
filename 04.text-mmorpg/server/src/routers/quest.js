const express = require('express');
const Quest = require('../models/quest');
const router = new express.Router();


// Quests

router.post('/quests', async (req, res) => {
    const quest = Quest(req.body);
    try {
        await quest.save();
        res.status(202).send(quest);
    } catch(error) {
        res.status(400).send(error);
    }
});

router.get('/quests', async (req, res) => { 
    try {
        //const completedQuery = req.query.isCompleted
        const limitQuery = req.query.limit
        const sortByQuery = req.query.sortBy
        let quests = []
        if(limitQuery) {
            if(sortByQuery)
            {
                const parts = sortByQuery.split(':')
                const sign = parts[1] === 'desc' ? '-' : ''
                quests = await Quest.find({})
                    .limit(parseInt(limitQuery))
                    .sort( sign+parts[0] );
            } else {
                quests = await Quest.find({}).limit(parseInt(limitQuery))
            }
        } else {
            quests = await Quest.find({});
        }
        res.status(200).send(quests);
    }
    catch(error) {
        console.log(error)
        res.status(500).send();
    }
});

router.get('/quests/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        const quest = await Quest.findById(_id);
        if(!quest) {
            return res.status(404).send();
        }
        res.status(200).send(quest);
    } catch(error) {
        res.status(500).send();
    }
});

router.patch('/quests/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'isCompleted'];
    const isValid = updates.every( update => allowedUpdates.includes(update));
    if(!isValid) {
        res.status(400).send();
    }

    try {
        const quest = await Quest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if(!quest) {
            return res.status(404).send();
        }
        res.send(quest);
    } catch(error) {
        res.status(400).send();
    }
});

router.delete('/quests/:id', async (req, res) => {
    try {
        const quest = await Quest.findByIdAndDelete(req.params.id);
        if(!quest) {
            return res.status(404).send();
        }
        res.send(quest);
    } catch(error) {
        res.status(500).send();
    }
});

module.exports = router;