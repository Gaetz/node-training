const express = require('express');
require('./db/mongoose');
const Quest = require('./models/quest');

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