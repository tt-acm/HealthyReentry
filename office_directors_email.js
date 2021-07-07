// heroku scheduler script for automated email to office directors
// heroku scheduler every friday

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

var moment = require('moment');
moment().format();

const sgClient = require('@sendgrid/mail');

sgClient.setApiKey(process.env.SENDGRID_API_KEY);
var sender ="healthyreentry-notifications@thorntontomasetti.com"
var url = process.env.MONGO_URL;

const fs = require('fs');
var content = fs.readFileSync("./server/assets/email_templates/officeDirectorsReport.html").toString("utf-8");

let directors = {
  "Aberdeen": "jaevans@thorntontomasetti.com",
  "Albuquerque": "dtennant@thorntontomasetti.com",
  "Atlanta": "twhisenhunt@thorntontomasetti.com",
  "Austin": "jelliott@thorntontomasetti.com",
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
  "Houston": "jelliott@thorntontomasetti.com",
  "Kansas City": "mfarber@thorntontomasetti.com",
  "London": "mroberts@thorntontomasetti.com",
  "Los Angeles": "seisenreich@thorntontomasetti.com",
  "Miami": ["molender@thorntontomasetti.com", "bmalmsten@thorntontomasetti.com"],
  "Milwaukee": "jperonto@thorntontomasetti.com",
  "Mississauga": ["rbehboudi@thorntontomasetti.com", "mwesolowsky@thorntontomasetti.com"],
  "Moscow": "lzborovsky@thorntontomasetti.com",
  "Mumbai": ["mimam@thorntontomasetti.com", "kdutta@thorntontomasetti.com"],
  "New York": ["jfeuerborn@thorntontomasetti.com", "egottlieb@thorntontomasetti.com"],
  // "New York - 120 Broadway": ["jfeuerborn@thorntontomasetti.com", "egottlieb@thorntontomasetti.com"],
  // "New York - Downtown": "jfeuerborn@thorntontomasetti.com",
  // "New York - Madison": "egottlieb@thorntontomasetti.com",
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

let allWorkPreferences = [];

//"Name,Email\r\n";
function nodeToCsv(node, vaccination) {
    const statusDate = node.status? moment(node.status.date).format('MMMM DD YYYY') : "Not Available";
    // return `${node.name},${node.email}\r\n`;
    if (vaccination) return `${node.name},${node.email},${statusDate},${vaccination.count}, ${moment(vaccination.lastDate).format('MMMM DD YYYY')}, ${vaccination.manufacturer}, ${node.fullyVaccinated}\r\n`;
    else return `${node.name},${node.email},${statusDate}, ${''}, ${''}, ${''}, ${node.fullyVaccinated} \r\n`;
}

let allUsers = [];

let officeCount = 0;
let finishedOfficeCount = 0;


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
      officeCount = Object.keys(directors).length;

        Object.keys(directors).forEach((key, index) => {
            // three attachment
            // 1. employees who have signed up for the app,
            // 2. employees who have signed up for the app but haven't reported their health status for more than 7 days,
            // 3. the number of app users in your office with a health status of Red and/or Orange.
            getOfficeUserVaccination(db, key).then(usersWithVacs => {
              // 1. employees who have signed up for the app,
              const usersbyOffice = allUsers.filter(u => u.location === key);

              if(usersbyOffice.length === 0 ) return;
              // let csvHeader = "Name,Email, \r\n";
              let csvHeader = "Name,Email, Last reported status,Vaccination Count, Last Vaccinated, Vaccine Manufacturer, Fully Vaccinated\r\n";
              let csv = csvHeader;

              usersbyOffice.forEach((user) => {
                  const userWithVac = usersWithVacs.filter(uVac => String(uVac._id) == String(user._id))[0];
                  csv += nodeToCsv(user, userWithVac.vaccination);
              })
              let attachment = Buffer.from(csv).toString('base64');


              // 2. employees who have signed up for the app but haven't reported their health status for more than 7 days,
              var checkDate = new Date();
              var pastDate = checkDate.getDate() - 7;
              checkDate.setDate(pastDate);

              const usersneedsUpdate = usersbyOffice.filter(u => u.status.date < checkDate);
              let csv2 = csvHeader;
              usersneedsUpdate.forEach((user) => {
                const userWithVac = usersWithVacs.filter(uVac => String(uVac._id) == String(user._id))[0];
                  csv2 += nodeToCsv(user, userWithVac.vaccination)
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


              let csv3 = "Office,Number of Orange,Number of Red,Total Signups in Office, Total Office Employee Count, Employee reported in Office this week, Percentage of Employees in Office this week, Total Fully Vaccinated in Office, Percentage of Employees Fully Vaccinated\r\n";
              var numberOfOrange = usersStatusOrange.length;
              var numberOfRed = usersStatusRed.length;
              var total =  usersbyOffice.length;
              var employeeInOffice = uniqueUserinOffice1.length;
              var employeeInOffice2 = uniqueUserinOffice2.length;
              var employeeInOffice3 = uniqueUserinOffice3.length;
              const employeeVaccinated = usersWithVacs.filter(u=>u.fullyVaccinated).length;


              if (key === "New York") {
                csv3 += `${"120 Broadway"},${numberOfOrange},${numberOfRed},${total},${userCountByOffice["New York - 120 Broadway"]},${employeeInOffice3}, ${String((employeeInOffice/userCountByOffice["New York - 120 Broadway"]*100).toFixed(2)) + "%"}, ${employeeVaccinated}, ${String((employeeVaccinated/userCountByOffice["New York - 120 Broadway"]*100).toFixed(2)) + "%"}\r\n`;
                csv3 += `${"Downtown"},${''},${''},${''},${userCountByOffice["New York - Downtown"]},${employeeInOffice},${String((employeeInOffice/userCountByOffice["New York - Downtown"]*100).toFixed(2)) + "%"},${''},${''} \r\n`;
                // csv3 += `${"Midtown"},${''},${''},${''},${''},${userCountByOffice["New York - Madison"]},${employeeInOffice2}, ${String((employeeInOffice/userCountByOffice["New York - Madison"]*100).toFixed(2)) + "%"},${''} \r\n`;
                // csv3 += `${"120 Broadway"},${''},${''},${''},${''},${userCountByOffice["New York - 120 Broadway"]},${employeeInOffice3}, ${String((employeeInOffice/userCountByOffice["New York - 120 Broadway"]*100).toFixed(2)) + "%"}\r\n`;
              }
              else csv3 += `${key},${numberOfOrange},${numberOfRed},${total},${userCountByOffice[key]},${employeeInOffice}, ${String((employeeInOffice/userCountByOffice[key]*100).toFixed(2)) + "%"}, ${employeeVaccinated}, ${String((employeeVaccinated/userCountByOffice[key]*100).toFixed(2)) + "%"}\r\n`;
              let attachment3 = Buffer.from(csv3).toString('base64');


              sendEmail(directors[key], key, attachment, attachment2, attachment3);   
            })
            .catch(e => {
              console.log("error in getting vaccination info: ", key, e);
            });
          
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
                    // client_db.close();
                    resolve(true);
                }
            }
        });
    });
}


function getOfficeUserVaccination(client_db, curOffice) {
  return new Promise((resolve, reject) => {
    var officeToSearch = curOffice;
    if (curOffice == "New York - 120 Broadway") officeToSearch = "New York";
    else if (curOffice == "New York - Downtown" || curOffice == "New York - Madison") resolve([]);
    
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
        if (err) {
          console.log("vaccination search err", err);
          resolve([]);
        }
        if (!users || users.length == 0) resolve([]);

        let promises = [];

        if (users && Array.isArray(users)) {
          users.forEach(u => {
            let curP = vaccinationCollection.find({
              "user": u._id
            })
            .sort({
              date: -1
            }).toArray();
  
            promises.push(curP);
          });


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

            finishedOfficeCount += 1;

            if (finishedOfficeCount == officeCount) {
              console.log("closing db");         
              client_db.close(); 
            }

            resolve(users)

              
          }); 
        }
        else {
          resolve([]);
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
    var toEmails = Array.isArray(emails)? emails : [emails];

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
      var curOption = JSON.parse(JSON.stringify(mailOptions))
      curOption["to"] = toEmail;
      messages.push(curOption);
    })

    sgClient.send(messages).then(() => {
      console.log('emails sent successfully to: ', toEmails, location);
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
