// heroku scheduler script for automated email to office directors
// heroku scheduler every friday

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var _ = require('lodash');

var moment = require('moment');
moment().format();

const sgClient = require('@sendgrid/mail');

sgClient.setApiKey(process.env.SENDGRID_API_KEY);
var sender = process.env.SENDGRID_EMAIL;
var url = process.env.MONGO_URL;

const fs = require('fs');
var content = fs.readFileSync("./server/assets/email_templates/reentryTeamReport.html").toString("utf-8");

let emails = process.env.VUE_APP_TEAM.split(',');

//"Office,Name,Email\r\n";
function nodeToCsv(node) {
    return `${node.location},${node.name},${node.email}\r\n`;
}

let allUsers = [];


MongoClient.connect(url, {
    useUnifiedTopology: true
}).then(function (db) {
    console.log("CONNECTED TO DB");
    console.log(emails);
    var today = new Date();
    if (today.getDay() == 5) console.log("today is friday");
    else {
        console.log("today is not friday yet!")
        db.close();
        return;
    }

    getUsers(db).then(function () {
        //console.log("allUsers", allUsers);
        var offices = _.uniq(_.map(allUsers, 'location')).sort();
        console.log(offices);

        let csv = "Office,Name,Email\r\n";
        let csv2 = "Office,Name,Email\r\n";
        let csv3 = "Office,Orange,Red,Total App Signups in Office,Total Number of Employees Who Have Not Updated in 7 Days\r\n";

        offices.forEach(office => {
            //console.log(office)
            // 1. employees who have signed up for the app, 
            const usersbyOffice = allUsers.filter(u => u.location === office);

            usersbyOffice.forEach((user) => {
                csv += nodeToCsv(user)
            })

            // 2. employees who have signed up for the app but haven't reported their health status for more than 7 days,
            var checkDate = new Date();
            var pastDate = checkDate.getDate() - 7;
            checkDate.setDate(pastDate);

            const usersneedsUpdate = usersbyOffice.filter(u => u.status.date < checkDate);

            usersneedsUpdate.forEach((user) => {
                csv2 += nodeToCsv(user)
            })

            // 3. the number of app users in your office with a health status of Red and/or Orange.
            const usersStatusOrange = usersbyOffice.filter(u => u.status.status === 1);
            const usersStatusRed = usersbyOffice.filter(u => u.status.status === 2);

            var numberOfOrange = usersStatusOrange.length;
            var numberOfRed = usersStatusRed.length;
            var total = usersbyOffice.length;
            var totalNeedsUpdate = usersneedsUpdate.length;
            csv3 += `${office},${numberOfOrange},${numberOfRed},${total},${totalNeedsUpdate}\r\n`

        });

        let attachment = Buffer.from(csv).toString('base64');
        let attachment2 = Buffer.from(csv2).toString('base64');
        let attachment3 = Buffer.from(csv3).toString('base64');

        sendEmail(emails, attachment, attachment2, attachment3);

    })

}).catch(err => {
    console.error("An error occurred reading the database.");
    console.error(err);
});

function getUsers(client_db) {
    return new Promise((resolve, reject) => {
        let db = client_db.db();

        let include = {
            "_id": 1,
            // "dateOfConsent": 1,
            "name": 1,
            "location": 1
        }

        let collection = db.collection('users');
        let statusCollection = db.collection('status');

        collection.find({}, include).toArray(function (err, users) {
            var counter = 0;
            for (let u of users) {
                statusCollection.find({
                        "user": u._id
                    })
                    .sort({
                        date: -1
                    })
                    .limit(1).toArray(function (error, st) {
                        u.status = st[0];
                        allUsers.push(u);
                        isDone();

                    });

            }



            function isDone() {
                counter += 1;
                if (users.length === counter) {
                    resolve(true);
                }
            }


        });




    });


}

function sendEmail(toEmail, attachment, attachment2, attachment3) {

    const mailOptions = {
        to: toEmail,
        from: sender,
        subject: "Healthy Reentry – Weekly Report",
        html: content
    };

    if (attachment) {
        mailOptions.attachments = [{
                "content": attachment,
                "filename": "Employees Who Have Signed up.csv",
                "type": "text/csv"
            },
            {
                "content": attachment2,
                "filename": "Employees Who Have Not Updated in 7 Days.csv",
                "type": "text/csv"
            },
            {
                "content": attachment3,
                "filename": "Headcount By Office.csv",
                "type": "text/csv"
            }

        ]
    }

    sgClient.send(mailOptions, function (err) {
        console.log("err?", err)
        if (err)
            return;
        else
            console.log('sent');

    });



}