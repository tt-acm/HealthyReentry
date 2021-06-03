// heroku scheduler script for automated email to office directors
// heroku scheduler every hour

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

var moment = require('moment');
moment().format();

const sgClient = require('@sendgrid/mail');
sgClient.setApiKey(process.env.SENDGRID_API_KEY);
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
    "Chicago": ["rmichelin@thorntontomasetti.com", "jperonto@thorntontomasetti.com"],
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
    "Warrington": ["pwoelke@thorntontomasetti.com", "jaevans@thorntontomasetti.com"],
    'Washington': "pvaneepoel@thorntontomasetti.com",
    "West Hartford": "ebaumgartner@thorntontomasetti.com",
    'Wellington': "pwrona@thorntontomasetti.com",
    "Shanghai": "yzhu@thorntontomasetti.com",
    "Sydney": "anelson@thorntontomasetti.com"
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
  "Edinburgh - Limehillock": 27,
  "Fort Lauderdale": 25,
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
  "Tampa": 6,
  "Toronto": 11,
  "Warrington": 25,
  'Washington': 54,
  "West Hartford": 5,
  'Wellington': 1,
  "York": 1
}

let zones = {};
zones["-7"] = ["Los Angeles", "San Francisco", "Seattle", "San Diego", 'Santa Clara'];
zones["-6"] = ["Denver", "Albuquerque", "Phoenix"];
zones["-5"] = ["Chicago", "Kansas City", "Milwaukee", "Houston", "Dallas", "Austin"];
zones["-4"] = ["New York - 120 Broadway", "New York - Downtown", "Newark", "Philadelphia", "Washington", "Fort Lauderdale", "Portland", "Boston", "Toronto", "Mississauga", "West Hartford", "Ottawa", "Tampa", "Miami", "Atlanta"];
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
// function nodeToCsv(node, vaccinationData) {
//     if (vaccinationData) return `${node.name},${node.email},${colorDict[node.status.status]}, ${moment(node.status.date).format('MMMM DD YYYY')}, ${vaccinationData.count}, ${moment(vaccinationData.lastDate).format('MMMM DD YYYY')}, ${vaccinationData.manufacturer}\r\n`;
//     else return `${node.name},${node.email},${colorDict[node.status.status]}, ${moment(node.status.date).format('MMMM DD YYYY')}\r\n`;
// }
function nodeToCsv(node, vaccinationData) {
  return `${node.name},${node.email},${colorDict[node.status.status]}, ${moment(node.status.date).format('MMMM DD YYYY')}\r\n`;
}

function nodeToCsvVac(user) {
    return `${user.name},${user.email},${user.vaccination.count}, ${moment(user.vaccination.lastDate).format('MMMM DD YYYY')}, ${user.vaccination.manufacturer}\r\n`;
}


var curTimeZoneOfficeCount = null;
var finishedOfficeCount = 0;

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

                curTimeZoneOfficeCount = zones[key].length;
                finishedOfficeCount = 0;


                console.log("There offices are currently at 10AM: ", zones[key]);
                //3.  loop over offices in the zone
                var offices = zones[key];
                offices.forEach(office => {
                    // 4. filter work preferences by office (key)
                    // if the filtered wp is empty do not sent email
                    // else
                    // 5. create cvs of user name and email
                    // 6. send email to OD

                    getOfficeUserVaccination(db, office).then(usersWithVacs => {

                      const wpbyOffice = allWorkPreferences.filter(wp => wp.office === office);
                      let uniqueUpbyOffice = [];
                      let namesPerOffice = [];

                      wpbyOffice.forEach(o => {
                        if (!namesPerOffice.includes(String(o.user))) {
                          uniqueUpbyOffice.push(o);
                          namesPerOffice.push(String(o.user));
                        }
                      });


                      generateODContent(db, uniqueUpbyOffice, usersWithVacs).then(function(csv){
                        let attachment = Buffer.from(csv).toString('base64'); 
                        let attachmentVac = null                       

                        var email = directors[office];
                        let thisOfficeUserCount = userCountByOffice[office];
                        let inOfficePercentage = (uniqueUpbyOffice.length / thisOfficeUserCount * 100).toFixed(2);

                        var vaccedPercentage = 0;
                        var vaccinatedCount = 0
                        let csvHeaderVac = "Name,Email, Vaccination Count, Last Vaccinated, Vaccine Manufacturer\r\n";


                        if (usersWithVacs && usersWithVacs.length > 0) {
                          const vaccedUser = usersWithVacs.filter(u=> u.vaccination);
                          vaccinatedCount = vaccedUser.length;

                          if (vaccedUser.length > 0) {
                            vaccedPercentage = (vaccedUser.length / thisOfficeUserCount * 100).toFixed(2);                            
                            
                            vaccedUser.sort((a,b) => {
                              return (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0;
                            });

                            vaccedUser.forEach(u => {
                              csvHeaderVac += nodeToCsvVac(u);
                            });                           
                          }
                        }

                        attachmentVac = Buffer.from(csvHeaderVac).toString('base64');
                        

                        let content = templateContent
                        .replace('<USER_COUNT>', thisOfficeUserCount)
                        .replace('<ATTENDANCE_PERCENT>', inOfficePercentage)
                        .replace('<ATTENDANCE_COUNT>', uniqueUpbyOffice.length)
                        .replace('<VACCINATION_COUNT>', vaccinatedCount)
                        .replace('<VACCINATION_PERCENT>', vaccedPercentage);

                        sendEmail(email, office, attachment, attachmentVac,content, db);
                      })
                    })
                    

                });

            }



        });

    })

}).catch(err => {
    console.error("An error occurred reading the database.");
    console.error(err);
});

function generateODContent(db, wpbyOffice, usersWithVacs) {
  return new Promise((resolve, reject) => {
    // let csvHeader = "Name,Email, Status, Status Last Updated, Vaccination Count, Last Vaccinated, Vaccine Manufacturer\r\n";
    let csvHeader = "Name,Email, Status, Status Last Updated\r\n";
    let csv = csvHeader;
    let counter = 0;


    if (!wpbyOffice || wpbyOffice.length == 0) return resolve(csvHeader);


    wpbyOffice.forEach(function(wp) {
      getUser(db, wp).then(function(u){
        // const userWithVac = usersWithVacs.filter(uVac => String(uVac._id) == String(u._id))[0];

        // if (userWithVac && userWithVac.vaccination) csv += nodeToCsv(u, userWithVac.vaccination);
        // else csv += nodeToCsv(u);
        csv += nodeToCsv(u);        
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
            if (!st) console.log("invalid status", user.name);
            currentUser.status = st[0];
            resolve (currentUser);
          });
        }
    });
  })
}

function getOfficeUserVaccination(client_db, curOffice) {
  return new Promise((resolve, reject) => {
    var officeToSearch = curOffice;
    if (curOffice == "New York - 120 Broadway") officeToSearch = "New York";
    else if (curOffice == "New York - Downtown" || curOffice == "New York - Madison") resolve(null);
    
    let db = client_db.db();
    let userCollection = db.collection('users');
    let vaccinationCollection = db.collection('vaccinations');

    let includeUser = {
        "_id": 1,
        "email": 1,
        "name":1
    }
    // Search all users in this office
    userCollection
      .find({location: officeToSearch}, includeUser)
      .toArray( function (err, users) {
        if (err) reject();
        if (!users || users.length == 0) resolve([]);

        let promises = [];

        users.forEach(u => {
          let curP = vaccinationCollection.find({
            "user": u._id
          })
          .sort({
            date: -1
          }).toArray();

          promises.push(curP);
        })

        Promise.all(promises).then((usersWithVacs) => {

          usersWithVacs.forEach((vaccine, index) => {
            var curVac = {
              manufacturer:null,
              lastDate: null,
              count: 0
            }
            if (!vaccine || vaccine.length == 0) return;

            const uniqueManufacturer = [];

            vaccine.forEach(v => {
              if (!uniqueManufacturer.includes(v.manufacturer)) uniqueManufacturer.push(v.manufacturer);
            })
            
            
            curVac.count = vaccine.length;
            if (vaccine.length == 1) {
              curVac.manufacturer = vaccine[0].manufacturer    
            }
            else {
              curVac.manufacturer = uniqueManufacturer.join("; ");
            }

            curVac.lastDate = vaccine[0].date;                    
            users[index].vaccination = curVac;
          })
          resolve(users)
        });        
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
            allWorkPreferences = allWps;
            resolve(true);

        });

    });


}

function sendEmail(emails, location, attachment, attachmentVac, emailContent, db) {
    var toEmails = Array.isArray(emails)? emails : [emails];

    const mailOptions = {
        // to: toEmail,
        // to: "hsun@thorntontomasetti.com",
        from: sender,
        bcc: 'hsun@thorntontomasetti.com',
        subject: "Daily Office Update – " + location,
        html: emailContent
    };

    if (attachment) {
        mailOptions.attachments = [{
            "content": attachment,
            "filename": "Employees Who Will Be Working in the Office.csv",
            "type": "text/csv"
        },{
            "content": attachmentVac,
            "filename": "Employees Who Have a Vaccination Record.csv",
            "type": "text/csv"
        }];
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


    finishedOfficeCount += 1;

    if (finishedOfficeCount == curTimeZoneOfficeCount) {
      console.log("finished, closing db...");

      db.close();
    }

    // sgClient.send(mailOptions, function (err) {
    //     console.log("err?", err)
    //     if (err)
    //         return;
    //     else
    //         console.log('sent');
    //
    // });



}
