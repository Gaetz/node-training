const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const connectionURL = 'mongodb://127.0.0.1:27017'; // Database adress
const databaseName = 'text-mmorpg';

MongoClient.connect(connectionURL, { useNewUrlParser: true }, (error, client) => {
    if (error) {
        return console.log('Unable to connect to database');
    }
});

/* 1. Test connection
console.log('Unable to connect to database')
*/

/* 2. Create db reference, collection and insert document */
/*
const db = client.db(databaseName);
db.collection('players').insertOne({
    name: 'Gaetan',
    age: 34
}, (error, result) => {
    if (error) {
        return console.log('Unable to insert player');
    }
    console.log(result.ops);
});
*/

/* 3. Create db reference, collection and insert many document */
/*
const db = client.db(databaseName);
db.collection('players').insertMany(
    [
        {
            name: 'Brice',
            age: 36
        }, {
            name: 'Mathieu',
            age: 35
        }
], (error, result) => {
    if (error) {
        return console.log('Unable to insert players');
    }
    console.log(result.ops);
});*/

/* 4. Experiences on ids */
/*
const ObjectID = mongodb.ObjectID;
const id = new ObjectID();
console.log(id);
console.log(id.getTimestamp());
console.log(id.id);
console.log(id.toHexString());
*/

/* 5. Fetch and read data */
/*
const db = client.db(databaseName);
db.collection('players').findOne({ name: 'Mathieu'}, (error, player) => {
    if (error) {
        return console.log('Unable to fetch player');
    }

    console.log(player);
});
*/

/* 6. Fetch multiple data */
/*
const db = client.db(databaseName);
db.collection('players').find({}).toArray((error, players) => {
    console.log(players);
});

db.collection('players').find({}).count((error, count) => {
    console.log(count);
});
*/
// Exercice count avatars that accept pvp

/* 7. Promises */
/*
const doWorkPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve([7, 4, 1]);
        // reject('Problem');
    }, 2000)
});

doWorkPromise.then((result) => {
    console.log('Success!', result);
}).catch((error) => {
    console.log('Error!', error);
})
*/

/* 8. Update a single document */
/*
const ObjectID = mongodb.ObjectID;
const db = client.db(databaseName);
db.collection('players').updateOne(
    { _id: new ObjectID("5e83b1809f4e34270605d294") },
    {
        $set:
        {
            name: 'Sancho'
        }
    }).then((result) => {
        console.log('Success!', result);
    }).catch((error) => {
        console.log('Failure!', error);
    });

// Exercice : use updateMany to add one to all players' age.
const updateAgePromise = db.collection('players').updateMany({},
    {
        $inc:
        {
            age: 1
        }
    }).then((result) => {
        console.log('Success!', result);
    }).catch((error) => {
        console.log('Failure!', error);
    });
*/

/* 9. Delete documents */
/*
const ObjectID = mongodb.ObjectID;
const db = client.db(databaseName);
db.collection('players').deleteOne( {_id: new ObjectID("5e83ac1f077ff52328c1ab70")} );
*/
