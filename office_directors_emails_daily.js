// heroku scheduler script for automated email to office directors
// heroku scheduler every hour

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

var moment = require('moment');
moment().format();

const sgClient = require('@sendgrid/mail');
sgClient.setApiKey(process.env.SENDGRID_API_KEY);
// var sender = process.env.SENDGRID_EMAIL;
var sender ="healthyreentry-notifications@thorntontomasetti.com"
var url = process.env.MONGO_URL;


const fs = require('fs');
var templateContent = fs.readFileSync("./server/assets/email_templates/officeDirectorsReport_daily.html").toString("utf-8");


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
    "Edinburgh - Limehillock": 28,
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

let zones = {};
zones["-7"] = ["Los Angeles", "San Francisco", "Seattle", "San Diego", 'Santa Clara'];
zones["-6"] = ["Denver", "Albuquerque", "Phoenix"];
zones["-5"] = ["Chicago", "Kansas City", "Milwaukee", "Houston", "Dallas", "Austin"];
zones["-4"] = ["New York - 120 Broadway", "New York - Downtown", "New York - Madison", "Newark", "Philadelphia", "Washington", "Fort Lauderdale", "Portland", "Boston", "Toronto", "Mississauga", "West Hartford", "Ottawa", "Tampa", "Miami", "Atlanta"];
zones["-3"] = ["Halifax"];
// zones["1"] = ["London", "Edinburgh", "Edinburgh - Limehillock", "Warrington", "Romsey", "Aberdeen"];
zones["0"] = ["London", "Edinburgh", "Edinburgh - Limehillock", "Warrington", "Romsey", "Aberdeen", "Bristol"];
zones["1"] = ["Copenhagen"];
// zones["2"] = ["Copenhagen", "Bristol"];
zones["3"] = ["Moscow"];
zones["4"] = ["Dubai"];
zones["5"] = ["Mumbai"];
zones["8"] = ["Shanghai", "Beijing", "Ho Chi Minh City", "Hong Kong", "Perth"];
zones["11"] = ["Sydney"];
zones["13"] = ["Wellington"];


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

                    let uniqueUpbyOffice = [];
                    let namesPerOffice = [];

                    wpbyOffice.forEach(o => {
                      if (!namesPerOffice.includes(String(o.user))) {
                        uniqueUpbyOffice.push(o);
                        namesPerOffice.push(String(o.user));
                      }
                    });


                    // const uniqueUpbyOffice =  [...new Map(wpbyOffice.map(item => [item[user], item])).values()]
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
                      // console.log("email", email);
                      let thisOfficeUserCount = userCountByOffice[office];
                      let percentage = (uniqueUpbyOffice.length / thisOfficeUserCount * 100).toFixed(2);

                      let content = templateContent.replace('<USER_COUNT>', thisOfficeUserCount).replace('<ATTENDANCE_PERCENT>', percentage).replace('<ATTENDANCE_COUNT>', uniqueUpbyOffice.length);

                      // email = 'hsun@thorntontomassetti.com' //// TEST
                      sendEmail(email, office, attachment, content);
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
    let counter = 0;
    wpbyOffice.forEach(function(wp) {
      getUser(db, wp).then(function(u){
        csv += nodeToCsv(u)
        counter += 1;
        if (counter === wpbyOffice.length) resolve(csv);
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

function sendEmail(emails, location, attachment, emailContent) {
    const toEmails = Array.isArray(emails)? emails : [emails];

    const mailOptions = {
        // to: toEmail,
        // to: "hsun@thorntontomasetti.com",
        from: sender,
        bcc: 'hsun@thorntontomasetti.com',
        subject: "Daily 'In the Office' Employee Update - " + location,
        html: emailContent
    };
    // console.log("mailOptions", mailOptions);

    if (attachment) {
        mailOptions.attachments = [{
            "content": attachment,
            "filename": "Employees Who Will Be Working in the Office.csv",
            "type": "text/csv"
        }]
    }
    // console.log("mailOptions", mailOptions);
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

    // sgClient.send(mailOptions, function (err) {
    //     console.log("err?", err)
    //     if (err)
    //         return;
    //     else
    //         console.log('sent');
    //
    // });



}
