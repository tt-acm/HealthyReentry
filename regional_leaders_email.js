// heroku scheduler script for automated email to office directors
// heroku scheduler every friday

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const regions = require('./server/util/officeList');

var moment = require('moment');
moment().format();

const sgClient = require('@sendgrid/mail');

var sender ="healthyreentry-notifications@thorntontomasetti.com"
sgClient.setApiKey(process.env.SENDGRID_API_KEY);
var url = process.env.MONGO_URL;


const fs = require('fs');
var content = fs.readFileSync("./server/assets/email_templates/regionalLeadersReport.html").toString("utf-8");

let leaders = {
    "East": "trittenhouse@thorntontomasetti.com",
    "West": "rtreece@thorntontomasetti.com",
    "Mid-Atlantic and South": "mtamaro@thorntontomasetti.com",
    "Midwest": "fehsan@thorntontomasetti.com",
    "Europe": "pthompson@thorntontomasetti.com",
    "Pacific Rim": "yzhu@thorntontomasetti.com"
}

let userCountByOffice = {
  "Aberdeen": 7,
  "Albuquerque": 13,
  "Atlanta": 2,
  "Austin": 8,
  "Beijing": 11,
  "Boston": 49,
  "Bristol": 4,
  "Chicago": 76,
  "Copenhagen": 2,
  "Dallas": 20,
  "Denver": 24,
  "Dubai": 4,
  "Edinburgh": 27,
  "Fort Lauderdale": 27,
  "Halifax": 2,
  "Ho Chi Minh City": 17,
  "Hong Kong": 1,
  "Houston": 10,
  "Kansas City": 42,
  "London": 42,
  "Los Angeles": 48,
  "Miami": 11,
  "Milwaukee": 4,
  "Mississauga": 11,
  "Moscow": 1,
  "Mumbai": 94,
  "New York - 120 Broadway": 403,
  "New York - Downtown": 155,
  "New York - Madison": 241,
  "Newark": 31,
  "Ottawa": 2,
  "Perth": 9,
  "Philadelphia": 22,
  "Phoenix": 2,
  "Portland": 33,
  "Romsey": 28,
  "San Diego": 5,
  'San Francisco': 47,
  "Santa Clara": 4,
  "Seattle": 11,
  "Shanghai": 17,
  "Sydney": 1,
  "Tampa": 8,
  "Toronto": 11,
  "Warrington": 25,
  'Washington': 54,
  "West Hartford": 5,
  'Wellington': 1,
  "York": 1
}


//"Office,Name,Email\r\n";
function nodeToCsv(node) {
    const fullyVacInfo = node.fullyVaccinated? "Yes":"No";
    return `${node.location},${node.name},${node.email},${fullyVacInfo}\r\n`;
}

let allUsers = [];


MongoClient.connect(url, {
    useUnifiedTopology: true
}).then(function (db) {
    console.log("CONNECTED TO DB");

    var today = new Date();
    if (today.getDay() == 5) console.log("today is friday");
    else {
        console.log("today is not friday yet!")
        db.close();
        return;
    }

    getUsers(db).then(function () {
        Object.keys(regions).forEach((key, index) => {
            // 3. the number of app users in the office with a health status of Red and/or Orange.
            var email = leaders[key];

            let csv = "Office,Name,Email, Fully Vaccinated\r\n";
            let csv2 = "Office,Name,Email, Fully Vaccinated\r\n";
            let csv3 = "Office,Orange,Red, Total Office Employee Count, Total App Signups in Office, Total Office Count of Fully Vaccinated\r\n";
            var offices = regions[key];
            offices.forEach(office => {
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
                    const vaccinatedEmployeeCount = usersbyOffice.filter(u => u.fullyVaccinated > 0).length;
                    if (office == "New York") csv3 += `${office},${numberOfOrange},${numberOfRed}, ${userCountByOffice["New York - 120 Broadway"]}, ${total},${vaccinatedEmployeeCount}\r\n`;     
                    else  csv3 += `${office},${numberOfOrange},${numberOfRed}, ${userCountByOffice[office]}, ${total},${vaccinatedEmployeeCount}\r\n`;     
            });


            let attachment = Buffer.from(csv).toString('base64');
            let attachment2 = Buffer.from(csv2).toString('base64');
            let attachment3 = Buffer.from(csv3).toString('base64');

            sendEmail(email, key, attachment, attachment2, attachment3);

        });


    })

}).catch(err => {
    db.close();
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
            "location": 1,
            "fullyVaccinated": 1
        }

        let collection = db.collection('users');
        let statusCollection = db.collection('status');
        let vaccinationCollection = db.collection('vaccinations');

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

                        vaccinationCollection.find({
                            "user": u._id
                        })
                        .count()
                        .then(count => {
                            u.vaccinationCount = count;
                            allUsers.push(u);
                            isDone();
                        })        

                    });

            }
            function isDone() {
                counter += 1;
                if (users.length === counter) {
                    console.log("closing db...");
                    client_db.close();
                    resolve(true);
                }
            }
        });
    });
}


function sendEmail(emails, location, attachment, attachment2, attachment3) {
    var toEmails = Array.isArray(emails)? emails : [emails];

    const mailOptions = {
        // to: toEmail,
        // to: "hsun@thorntontomasetti.com",
        from: sender,
        bcc: 'hsun@thorntontomasetti.com',
        subject: "Healthy Reentry – Weekly Report for " + location + " Region",
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
                "filename": "Breakdown by Office.csv",
                "type": "text/csv"
            }

        ]
    }


    const messages = [];
    toEmails.forEach(function(toEmail){
      var curOption = JSON.parse(JSON.stringify(mailOptions))
      curOption["to"] = toEmail;
      messages.push(curOption);
    })

    sgClient.send(messages).then(() => {
      console.log('emails sent successfully to: ', toEmails);
    }).catch(error => {
      console.log(error);
    });

    // sgClient.send(mailOptions, function (err) {
    //     console.log("err?", err)
    //     if (err)
    //         return;
    //     else
    //         console.log('sent');
    //
    // });



}
