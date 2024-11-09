const { MongoClient } = require('mongodb');
const uri = process.env.DB_URL;
console.log(uri)
const client = new MongoClient(uri);

const dictionary = {};

const tail = ([dbs, cols, callback, ...xs]) => xs;
async function runMongoFunction(dbString, collectionString, callback) {
    var results;
    try {
        await client.connect();
        var dbCollectionString = dbString + '+' + collectionString;
        var collection

        if (dictionary[dbCollectionString] == undefined) {
            var database = client.db(dbString);
            collection = database.collection(collectionString);
            dictionary[dbCollectionString] = collection;
        } else {
            collection = dictionary[dbCollectionString];
        }

        results = await callback(collection, ...tail(arguments));

    } catch (e) {
        console.error(e);
    }



    return results;
}

module.exports = { runMongoFunction };