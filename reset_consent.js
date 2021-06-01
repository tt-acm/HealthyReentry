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

    let userCollection = db.collection('users');
    let allUsersCount = 0;
    let counter = 0;


    userCollection.find().count().then(function (count) {
        console.log("Total users count :", count);

        allUsersCount = count;

        const cursor = userCollection.find();
        cursor.forEach(async function (user) {
            //https://docs.mongodb.com/manual/reference/method/db.collection.save/ use insertOne
            // if (user.dateOfConsent) {
            //   delete user.dateOfConsent;
            // }

            try {
               userCollection.updateOne(
                  { "_id" : user._id },
                  { $unset: { dateOfConsent : "" }}
               );
            } catch (e) {
               console.log(e);
            }
            // await collection.save(user);

            isDone();
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
