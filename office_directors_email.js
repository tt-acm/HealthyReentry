// heroku scheduler script for automated email to office directors
// heroku scheduler every friday

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

var moment = require('moment');
moment().format();

const sgClient = require('@sendgrid/mail');

sgClient.setApiKey(process.env.SENDGRID_API_KEY);
var sender = process.env.SENDGRID_EMAIL;
var url = process.env.MONGO_URL;
const fs = require('fs');
var content = fs.readFileSync("./server/assets/email_templates/officeDirectorsReport.html").toString("utf-8");

let directors = {
  "Aberdeen": "jaevans@thorntontomasetti.com",
  "Albuquerque": "dtennant@thorntontomasetti.com",
  "Atlanta": "twhisenhunt@thorntontomasetti.com",
  "Austin": "jwesevich@thorntontomasetti.com",
  "Beijing": "pfu@thorntontomasetti.com",
  "Boston": ["ldavey@thorntontomasetti.com", "bvollenweider@thorntontomasetti.com"],
  "Bristol": "nmisselbrook@thorntontomasetti.com",
  "Chicago": "dweihing@thorntontomasetti.com",
  "Copenhagen": "learl@thorntontomasetti.com",
  "Dallas": "jelliott@thorntontomasetti.com",
  "Denver": "jdandrea@thorntontomasetti.com",
  "Dubai": "kkrall@thorntontomasetti.com",
  "Edinburgh": "nmisselbrook@thorntontomasetti.com",
  "Edinburgh - Limehillock": "nmisselbrook@thorntontomasetti.com",
  "Fort Lauderdale": ["molender@thorntontomasetti.com", "bmalmsten@thorntontomasetti.com"],
  "Halifax": ["rbehboudi@thorntontomasetti.com", "mwesolowsky@thorntontomasetti.com"],
  "Ho Chi Minh City": "cdang@thorntontomasetti.com",
  "Hong Kong": "ctam@thorntontomasetti.com",
  "Houston": ["jelliott@thorntontomasetti.com", "jwesevich@thorntontomasetti.com"],
  "Kansas City": "mfarber@thorntontomasetti.com",
  "London": "mroberts@thorntontomasetti.com",
  "Los Angeles": "seisenreich@thorntontomasetti.com",
  "Miami": ["molender@thorntontomasetti.com", "bmalmsten@thorntontomasetti.com"],
  "Milwaukee": "jperonto@thorntontomasetti.com",
  "Mississauga": ["rbehboudi@thorntontomasetti.com", "mwesolowsky@thorntontomasetti.com"],
  "Moscow": "lzborovsky@thorntontomasetti.com",
  "Mumbai": ["mimam@thorntontomasetti.com", "kdutta@thorntontomasetti.com"],
  "New York - 120 Broadway": ["jfeuerborn@thorntontomasetti.com", "egottlieb@thorntontomasetti.com"],
  "New York - Downtown": "jfeuerborn@thorntontomasetti.com",
  "New York - Madison": "egottlieb@thorntontomasetti.com",
  "Newark": "cchristoforou@thorntontomasetti.com",
  "Ottawa": ["rbehboudi@thorntontomasetti.com", "mwesolowsky@thorntontomasetti.com"],
  "Perth": "anelson@thorntontomasetti.com",
  "Philadelphia": "mcoggin@thorntontomasetti.com",
  "Phoenix": "rbaxter@thorntontomasetti.com",
  "Portland": ["mpulaski@thorntontomasetti.com", "pbecker@thorntontomasetti.com"],
  "Romsey": "gheward@thorntontomasetti.com",
  "San Diego": "mconachen@thorntontomasetti.com",
  'San Francisco': ["tcurtis@thorntontomasetti.com", "bshen@thorntontomasetti.com"],
  "Santa Clara": "kdebus@thorntontomasetti.com",
  "Seattle": ["bmacrae@thorntontomasetti.com", "bmorgen@thorntontomasetti.com"],
  "Tampa": "DFusco@thorntontomasetti.com",
  "Toronto": "cminerva@thorntontomasetti.com",
  "Warrington": "pwoelke@thorntontomasetti.com",
  'Washington': "pvaneepoel@thorntontomasetti.com",
  "West Hartford": "ebaumgartner@thorntontomasetti.com",
  'Wellington': "pwrona@thorntontomasetti.com",
  "Shanghai": "yzhu@thorntontomasetti.com",
  "Sydney": "anelson@thorntontomasetti.com"
}

let userCountByOffice = {
    "Aberdeen": 8,
    "Albuquerque": 12,
    "Atlanta": 2,
    "Austin": 8,
    "Beijing": 12,
    "Boston": 50,
    "Bristol": 4,
    "Chicago": 85,
    "Copenhagen": 6,
    "Dallas": 24,
    "Denver": 25,
    "Dubai": 4,
    "Edinburgh": 28,
    "Fort Lauderdale": 29,
    "Halifax": 1,
    "Ho Chi Minh City": 16,
    "Hong Kong": 1,
    "Houston": 9,
    "Kansas City": 43,
    "London": 48,
    "Los Angeles": 50,
    "Miami": 11,
    "Milwaukee": 5,
    "Mississauga": 12,
    "Moscow": 1,
    "Mumbai": 86,
    "New York - 120 Broadway": 396,
    "New York - Downtown": 155,
    "New York - Madison": 241,
    "Newark": 32,
    "Ottawa": 2,
    "Perth": 8,
    "Philadelphia": 23,
    "Phoenix": 2,
    "Portland": 39,
    "Romsey": 29,
    "San Diego": 5,
    'San Francisco': 45,
    "Santa Clara": 5,
    "Seattle": 10,
    "Tampa": 5,
    "Toronto": 12,
    "Warrington": 24,
    'Washington': 53,
    "West Hartford": 4,
    'Wellington': 1,
    "Shanghai": 17,
    "Sydney": 1
}

let allWorkPreferences = [];

//"Name,Email\r\n";
function nodeToCsv(node) {
    return `${node.name},${node.email}\r\n`;
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
        //console.log("allUsers", allUsers);
        Object.keys(directors).forEach((key, index) => {
            // three attachment
            // 1. employees who have signed up for the app,
            // 2. employees who have signed up for the app but haven't reported their health status for more than 7 days,
            // 3. the number of app users in your office with a health status of Red and/or Orange.

            console.log(key); // office

            // 1. employees who have signed up for the app,
            const usersbyOffice = allUsers.filter(u => u.location === key);
            console.log("usersbyOffice", usersbyOffice.length);
            if(usersbyOffice.length === 0 ) return;
            let csvHeader = "Name,Email\r\n";
            let csv = csvHeader;

            usersbyOffice.forEach((user) => {
                csv += nodeToCsv(user)
            })
            let attachment = Buffer.from(csv).toString('base64');

            // 2. employees who have signed up for the app but haven't reported their health status for more than 7 days,
            var checkDate = new Date();
            var pastDate = checkDate.getDate() - 7;
            checkDate.setDate(pastDate);

            const usersneedsUpdate = usersbyOffice.filter(u => u.status.date < checkDate);
            let csv2 = csvHeader;
            usersneedsUpdate.forEach((user) => {
                csv2 += nodeToCsv(user)
            })
            let attachment2 = Buffer.from(csv2).toString('base64');

            // 3. the number of app users in your office with a health status of Red and/or Orange.
            const usersStatusOrange = usersbyOffice.filter(u => u.status.status === 1);
            const usersStatusRed = usersbyOffice.filter(u => u.status.status === 2);

            var currentOfficePop1;//default container
            var currentOfficePop2;
            var currentOfficePop3;
            if (key === "New York") {
              currentOfficePop1 = allWorkPreferences.filter(wp=>wp.office === "New York - Downtown");
              currentOfficePop2 = allWorkPreferences.filter(wp=>wp.office === "New York - Madison");
              currentOfficePop3 = allWorkPreferences.filter(wp=>wp.office === "New York - 120 Broadway");
            }
            else if (key === "Edinburgh") {
              currentOfficePop1 = allWorkPreferences.filter(function (wp) {
                if (wp.office === "Edinburgh" || wp.office === "Edinburgh - Limehillock") return true;
                else return false
              });
            }
            else currentOfficePop1 = allWorkPreferences.filter(wp=>wp.office === key);

            // console.log("currentOfficePop", currentOfficePop1, currentOfficePop2);

            let uniqueUserinOffice1 = [];
            if (currentOfficePop1.length > 0) {
              currentOfficePop1.forEach(cop=>{
                let copUser = String(cop.user);
                if (!uniqueUserinOffice1.includes(copUser)) uniqueUserinOffice1.push(copUser);
              })
            }
            let uniqueUserinOffice2 = [];
            if (currentOfficePop2 && currentOfficePop2.length > 0) {
              currentOfficePop2.forEach(cop=>{
                let copUser = String(cop.user);
                if (!uniqueUserinOffice2.includes(copUser)) uniqueUserinOffice2.push(copUser);
              })
            }
            let uniqueUserinOffice3 = [];
            if (currentOfficePop3 && currentOfficePop3.length > 0) {
              currentOfficePop3.forEach(cop=>{
                let copUser = String(cop.user);
                if (!uniqueUserinOffice3.includes(copUser)) uniqueUserinOffice3.push(copUser);
              })
            }


            let csv3 = "Office,Number of Orange,Number of Red,Total Signups in Office, Employee Count, Employee reported in Office this week, Percentage of Employee in Office this week\r\n";
            var numberOfOrange = usersStatusOrange.length;
            var numberOfRed = usersStatusRed.length;
            var total =  usersbyOffice.length;
            var employeeInOffice = uniqueUserinOffice1.length;
            var employeeInOffice2 = uniqueUserinOffice2.length;
            var employeeInOffice3 = uniqueUserinOffice3.length;


            if (key === "New York") {
              csv3 += `${key},${numberOfOrange},${numberOfRed},${total},${''},${''}\r\n`;
              csv3 += `${"Downtown"},${''},${''},${''},${userCountByOffice["New York - Downtown"]},${employeeInOffice},${String((employeeInOffice/userCountByOffice["New York - Downtown"]*100).toFixed(2)) + "%"}\r\n`;
              csv3 += `${"Midtown"},${''},${''},${''},${userCountByOffice["New York - Madison"]},${employeeInOffice2}, ${String((employeeInOffice/userCountByOffice["New York - Madison"]*100).toFixed(2)) + "%"}\r\n`;
              csv3 += `${"120 Broadway"},${''},${''},${''},${userCountByOffice["New York - 120 Broadway"]},${employeeInOffice3}, ${''}\r\n`;
            }
            else csv3 += `${key},${numberOfOrange},${numberOfRed},${total},${userCountByOffice[key]},${employeeInOffice}, ${String((employeeInOffice/userCountByOffice[key]*100).toFixed(2)) + "%"}\r\n`;
            let attachment3 = Buffer.from(csv3).toString('base64');

            sendEmail(directors[key], key, attachment, attachment2, attachment3);

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
            "location": 1
        }

        let collection = db.collection('users');
        let statusCollection = db.collection('status');

        collection.find({}, include).toArray(function (err, users) {
            var counter = 0;
            getWorkPreferences(client_db).then(function(){
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
            })


            function isDone() {
                counter += 1;
                if (users.length === counter) {
                    client_db.close();
                    resolve(true);
                }
            }


        });




    });


}

function getWorkPreferences(client_db) {
    return new Promise((resolve, reject) => {
        let db = client_db.db();

        let include = {
            "_id": 1,
            // "dateOfConsent": 1,
            "user": 1,
            // "location": 1
        }

        var checkDate = new Date(new Date().getTime() - (6*24 * 60 * 60 * 1000));//move back 6 days

        let collection = db.collection('workpreferences');
        collection
          .find({
            createdAt: {
              "$gte": checkDate
            },
            office: { $ne: "Remote" }
          }, include)
          .toArray(function (err, allWps) {
            // console.log("Work Preferences", allWps);
            allWorkPreferences = allWps;
            resolve(true);
        });
    });
}

function sendEmail(emails, location, attachment, attachment2, attachment3) {
    const toEmails = Array.isArray(emails)? emails : [emails];

    const mailOptions = {
        // to: toEmail,
        // to: "hsun@thorntontomasetti.com",
        from: sender,
        bcc: 'hsun@thorntontomasetti.com',
        subject: "Healthy Reentry – Weekly Report for " + location,
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
                "filename": "Office Breakdown.csv",
                "type": "text/csv"
            }

        ]
    }

    const messages = [];
    toEmails.forEach(function(toEmail){
      var curOption = mailOptions;
      curOption["to"] = toEmail;
      messages.push(curOption);
    })

    sgClient.send(messages).then(() => {
      console.log('emails sent successfully to: ', toEmails);
    }).catch(error => {
      console.log(error);
    });

    // sgClient.send(messages, function (err) {
    //     console.log("err?", err)
    //     if (err)
    //         return;
    //     else
    //         console.log('sent');
    //
    // });



}
