var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

MongoClient.connect(process.env.MONGO_URL, {
    useUnifiedTopology: true
}).then(function (db) {
    console.log("CONNECTED TO DB");
    resetUsersStatus(db);

}).catch(err => {
    console.error("An error occurred reading the database.");
    console.error(err);
});

function resetUsersStatus(client_db) {
    let db = client_db.db();

    // get all users 
    // for each user save status as green

    let collection = db.collection('users');
    let statusCollection = db.collection('status');
    let allUsersCount = 0
    let counter = 0;


    collection.find().count().then(function (count) {
        console.log("Total users count :", count);

        allUsersCount = count;

        var d = new Date();
        const cursor = collection.find();
        cursor.forEach(function (user) {
            //https://docs.mongodb.com/manual/reference/method/db.collection.save/ use insertOne

            statusCollection.insertOne({
                    user: ObjectId(user._id),
                    date: d,
                    status: 0
                }).then(result => {
                    console.log(`Successfully inserted item with _id: ${result.insertedId}`);
                    isDone();
                })
                .catch(err => {
                    console.error(`Failed to insert item: ${err}`);
                    isDone();
                });

        });

    });


    function isDone() {
        counter += 1;
        if (allUsersCount === counter) {
            console.log("Closing DB");
            client_db.close();
        }
    }

}