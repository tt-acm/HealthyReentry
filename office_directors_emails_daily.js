// heroku scheduler script for automated email to office directors
// heroku scheduler every hour

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

var moment = require('moment');
moment().format();

const sgClient = require('@sendgrid/mail');
sgClient.setApiKey(process.env.SENDGRID_API_KEY);

var sender = process.env.SENDGRID_EMAIL;
// var sender ="healthyreentry-notifications@thorntontomasetti.com"
var url = process.env.MONGO_URL;

const fs = require('fs');
var content = fs.readFileSync("./server/assets/email_templates/officeDirectorsReport_daily.html").toString("utf-8");

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
    "Mumbai": "akadakia@thorntontomasetti.com",
    "New York - Downtown": "jfeuerborn@thorntontomasetti.com",
    "New York - Madison": "egottlieb@thorntontomasetti.com",
    "Newark": "cchristoforou@thorntontomasetti.com",
    "Ottawa": ["rbehboudi@thorntontomasetti.com", "mwesolowsky@thorntontomasetti.com"],
    "Perth": "anelson@thorntontomasetti.com",
    "Philadelphia": "mcoggin@thorntontomasetti.com",
    "Phoenix": "rbaxter@thorntontomasetti.com",
    "Portland": ["mpulaski@thorntontomasetti.com", "pbecker@thorntontomasetti.com"],
    "Romsey": "gheward@thorntontomasetti.com",
    "San Diego": "klegenza@thorntontomasetti.com",
    'San Francisco': ["tcurtis@thorntontomasetti.com", "bshen@thorntontomasetti.com"],
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

let zones = {};
zones["-7"] = ["Los Angeles", "San Francisco", "Seattle", "Wellington", "San Diego", 'Santa Clara'];
zones["-6"] = ["Washington", "Philadelphia", "Fort Lauderdale", "Dallas", "Albuquerque", "Austin", "Phoenix"];
zones["-5"] = ["Chicago", "Kansas City", "Denver", "Milwaukee", "Houston"];
zones["-4"] = ["New York - Downtown", "New York - Madison", "Newark", "Portland", "Boston", "Toronto", "Mississauga", "West Hartford", "Ottawa", "Tampa", "Miami", "Atlanta"];
zones["-3"] = ["Halifax"];
zones["1"] = ["London", "Edinburgh", "Warrington", "Romsey", "Aberdeen"];
zones["2"] = ["Copenhagen", "Bristol"];
zones["3"] = ["Moscow"];
zones["4"] = ["Dubai"];
zones["5"] = ["Mumbai"];
zones["8"] = ["Shanghai", "Beijing", "Ho Chi Minh City", "Hong Kong", "Perth"];
zones["10"] = ["Sydney"];


function calcLocalTime(offset) {

    var d = new Date();

    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);

    var nd = new Date(utc + (3600000 * offset));

    var hours = nd.getHours()

    console.log("Zone: " + offset, "Current Local Time: " + hours);

    return hours;

}

let allWorkPreferences = [];
let colorDict = ["Green", "Orange", "Red"]
//"Name,Email\r\n";
function nodeToCsv(node) {
    return `${node.name},${node.email},${colorDict[node.status.status]}, ${moment(node.status.date).format('MMMM Do YYYY')}\r\n`;
}


MongoClient.connect(url, {
    useUnifiedTopology: true
}).then(function (db) {
    console.log("CONNECTED TO DB");
    // 1. get all Work Preferences
    getWorkPreferences(db).then(function () {

        Object.keys(zones).forEach((key) => {
            var localtime = calcLocalTime(key)
            // console.log(localtime);
            // 2. Check local time
            if (localtime == 10) {

                console.log("There offices are currently at 10AM: ", zones[key]);
                //3.  loop over offices in the zone
                var offices = zones[key];
                offices.forEach(office => {
                    // 4. filter work preferences by office (key)
                    // if the filtered wp is empty do not sent email
                    // else
                    // 5. create cvs of user name and email
                    // 6. send email to OD
                    const wpbyOffice = allWorkPreferences.filter(wp => wp.office === office);

                    if (wpbyOffice.length === 0) {
                      console.log("No employee reported in this office:", office);
                      return;
                    }

                    const uniqueUpbyOffice =  [...new Map(wpbyOffice.map(item => [item[office], item])).values()]
                    console.log("Some employees reported in this office:", office, uniqueUpbyOffice.length);

                    // wpbyOffice.forEach(function(wp) {
                    //   getUser(db, wp).then(function(u){
                    //     // console.log("u", u);
                    //     csv += nodeToCsv(u);
                    //   })
                    // })
                    generateODContent(db, uniqueUpbyOffice).then(function(csv){
                      let attachment = Buffer.from(csv).toString('base64');

                      var email = directors[office];
                      console.log("email", email);
                      // email = 'hsun@thorntontomassetti.com' //// TEST
                      sendEmail(email, office, attachment );
                    })

                });

            }



        });

    })

}).catch(err => {
    console.error("An error occurred reading the database.");
    console.error(err);
});

function generateODContent(db, wpbyOffice) {
  return new Promise((resolve, reject) => {
    let csvHeader = "Name,Email, Status, Status Last Updated\r\n";
    let csv = csvHeader;
    wpbyOffice.forEach(function(wp) {
      getUser(db, wp).then(function(u){
        csv += nodeToCsv(u)
        resolve(csv);
      })
    })
  })
}

function getUser(client_db, wp) {
  return new Promise((resolve, reject) => {
    let db = client_db.db();
    let userCollection = db.collection('users');
    let statusCollection = db.collection('status');

    let includeUser = {
        "_id": 1,
        "email": 1,
        "name":1
    }
    userCollection
      .find({_id: wp.user}, includeUser)
      .toArray( function (err, user) {
        if (user && user.length > 0) {
          var currentUser = user[0];
          statusCollection.find({
                  "user": currentUser._id
              })
              .sort({
                  date: -1
              })
              .limit(1).toArray(function (error, st) {
                  currentUser.status = st[0];
                  resolve (currentUser);
              });
        }
    });
  })
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

        var checkDate = new Date(new Date().getTime() - (6 * 60 * 60 * 1000));//move back 6 hours

        let collection = db.collection('workpreferences');
        collection
          .find({
            createdAt: {
              "$gte": checkDate
            }
          }, include)
          .toArray(function (err, allWps) {
            // console.log("Work Preferences", allWps);
            allWorkPreferences = allWps;
            resolve(true);

        });

    });


}

function sendEmail(toEmail, location, attachment) {

    const mailOptions = {
        to: toEmail,
        // to: "hsun@thorntontomasetti.com",
        from: sender,
        bcc: 'hsun@thorntontomasetti.com',
        subject: "Daily 'In the Office' Employee Update - " + location,
        html: content
    };

    if (attachment) {
        mailOptions.attachments = [{
            "content": attachment,
            "filename": "Employees Who Will Be Working in the Office.csv",
            "type": "text/csv"
        }]
    }

    sgClient.send(mailOptions, function (err) {
        console.log("err?", err)
        if (err)
            return;
        else
            console.log('sent');

    });



}
