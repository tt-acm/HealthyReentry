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
    "Beijing":"pfu@thorntontomasetti.com",
    "Boston": ["ldavey@thorntontomasetti.com","bvollenweider@thorntontomasetti.com"],
    "Bristol": "nmisselbrook@thorntontomasetti.com", 
    "Chicago": "dweihing@thorntontomasetti.com",
    "Copenhagen": "learl@thorntontomasetti.com",
    "Dallas": "jelliott@thorntontomasetti.com",
    "Denver": "jdandrea@thorntontomasetti.com",
    "Dubai": "kkrall@thorntontomasetti.com",
    "Edinburgh": "nmisselbrook@thorntontomasetti.com",
    "Fort Lauderdale": ["molender@thorntontomasetti.com","bmalmsten@thorntontomasetti.com"],
    "Halifax": ["rbehboudi@thorntontomasetti.com","mwesolowsky@thorntontomasetti.com"],
    "Ho Chi Minh City": "cdang@thorntontomasetti.com",
    "Hong Kong": "ctam@thorntontomasetti.com",
    "Houston": ["jelliott@thorntontomasetti.com", "jwesevich@thorntontomasetti.com"],
    "Kansas City": "mfarber@thorntontomasetti.com",
    "London": "mroberts@thorntontomasetti.com",
    "Los Angeles": "seisenreich@thorntontomasetti.com",
    "Miami": ["molender@thorntontomasetti.com","bmalmsten@thorntontomasetti.com"],
    "Milwaukee": "jperonto@thorntontomasetti.com",
    "Mississauga": ["rbehboudi@thorntontomasetti.com","mwesolowsky@thorntontomasetti.com"],
    "Moscow": "lzborovsky@thorntontomasetti.com",
    "Mumbai": "akadakia@thorntontomasetti.com",
    "New York": ["jfeuerborn@thorntontomasetti.com", "egottlieb@thorntontomasetti.com"],
    "Newark": "cchristoforou@thorntontomasetti.com",
    "Ottawa": ["rbehboudi@thorntontomasetti.com","mwesolowsky@thorntontomasetti.com"],
    "Perth": "anelson@thorntontomasetti.com",
    "Philadelphia": "mcoggin@thorntontomasetti.com",
    "Phoenix": "rbaxter@thorntontomasetti.com",
    "Portland": ["mpulaski@thorntontomasetti.com","pbecker@thorntontomasetti.com"],
    "Romsey": "gheward@thorntontomasetti.com",
    "San Diego": "klegenza@thorntontomasetti.com",
    'San Francisco': ["tcurtis@thorntontomasetti.com","bshen@thorntontomasetti.com"],
    "Santa Clara": "kdebus@thorntontomasetti.com",
    "Seattle": "gbriggs@thorntontomasetti.com",
    "Tampa": "DFusco@thorntontomasetti.com",
    "Toronto": "cminerva@thorntontomasetti.com",
    "Warrington": "pwoelke@thorntontomasetti.com",
    'Washington': "pvaneepoel@thorntontomasetti.com",
    "West Hartford": "ebaumgartner@thorntontomasetti.com",
    'Wellington': "pwrona@thorntontomasetti.com",
    "Shanghai": "yzhu@thorntontomasetti.com",
    "Sydney": "anelson@thorntontomasetti.com"
}


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
            let csv3 = "Orange,Red,Total App Signups in Office\r\n";
            var numberOfOrange = usersStatusOrange.length;
            var numberOfRed = usersStatusRed.length;
            var total =  usersbyOffice.length;
            csv3 += `${numberOfOrange},${numberOfRed},${total}\r\n`
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
                    client_db.close();
                    resolve(true);
                }
            }


        });




    });


}

function sendEmail(toEmail, location, attachment, attachment2, attachment3) {

    const mailOptions = {
        to: toEmail,
        from: sender,
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
                "filename": "Breakdown by Health Status.csv",
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