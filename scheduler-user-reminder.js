// heroku scheduler script for email reminders for the users who hasn't updated the status last 7 days
// heroku scheduler runs every day

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

const sgClient = require('@sendgrid/mail');
// sgClient.setApiKey(process.env.SENDGRID_API_KEY);
sgClient.setApiKey('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');
var sender = process.env.SENDGRID_EMAIL;

const fs = require('fs');
const reminderContent = fs.readFileSync("./server/assets/email_templates/reminderTemplate.html").toString("utf-8");

console.log("reminderContent", reminderContent);

MongoClient.connect('mongodb+srv://core-hr:JbTeNFkRYJ6Kbffo@core-healthyreentry-pro.ggnfp.mongodb.net/healthyreentry?retryWrites=true&w=majority',{useUnifiedTopology: true}).then(function (db) {
    console.log("CONNECTED TO DB");
    checkUsersStatus(db);

}).catch(err => {
    console.error("An error occurred reading the database.");
    console.error(err);
});

function checkUsersStatus(client_db) {
    let db = client_db.db();
    // get all users
    // for each user check status date greater than 7 days
    let counter = 0;

    var checkDate = new Date();
    var pastDate = checkDate.getDate() - 7;
    checkDate.setDate(pastDate);

    let collection = db.collection('users');
    let statusCollection = db.collection('status');
    let allUsersCount = 0
    let emails = [];

    collection.find().count().then(function (count) {
        console.log("Total users count :", count);

        allUsersCount = count;

        const cursor = collection.find();
        cursor.forEach(function (user) {

            statusCollection.find({
                user: ObjectId(new ObjectId(user._id)),
                date: {
                    "$gte": checkDate
                }
            }).count().then(function (count) {

                if (count === 0) {
                    console.log("user has not updated status", user.email);
                    emails.push(user.email);
                    isDone();
                } else {
                    isDone();
                }

            });
        }, function (err) {

        });

    });


    function isDone() {
        counter += 1;
        //console.log("isDONE", allUsersCount, counter)
        if (allUsersCount === counter) {
            sendEmail(emails);
            console.log("Closing DB");
            client_db.close();
        }
    }

}

sendEmail = (toEmails) => {
    console.log("emails", toEmails)
    const mailOptions = {
        // to: toEmails,
        to: "hsun@thorntontomasetti.com",
        from: "healthyreentry-notifications@thorntontomasetti.com",
        subject: "Please report your status",
        html: reminderContent
        // text: "This is a friendly reminder that you haven't reported your status last 7 days, please sign in the Healthy Reentry app and submit your status."
    };

    sgClient.sendMultiple(mailOptions, function (err) {
        console.log("err?", err)
        if (err)
            return;
        else
            console.log('sent');


    });

}
