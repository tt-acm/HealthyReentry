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
var contentTemplate = fs.readFileSync("./server/assets/email_templates/reentryTeamReport.html").toString("utf-8");

let emails = process.env.VUE_APP_TEAM.split(',');
// let emails = [];

//"Office,Name,Email\r\n";
function nodeToCsv(node) {
    const fullyVacInfo = node.fullyVaccinated? "Yes":"No";
    return `${node.location},${node.name},${node.email}, ${fullyVacInfo}\r\n`;
}

let allUsers = [];
let allWorkPreferences = [];

let userCountByOffice = {
  "Aberdeen": 7,
  "Albuquerque": 13,
  "Atlanta": 2,
  "Austin": 7,
  "Beijing": 11,
  "Boston": 49,
  "Bristol": 4,
  "Chicago": 74,
  "Copenhagen": 2,
  "Dallas": 21,
  "Denver": 24,
  "Dubai": 4,
  "Edinburgh": 31,
  "Fort Lauderdale": 27,
  "Halifax": 2,
  "Ho Chi Minh City": 18,
  "Hong Kong": 1,
  "Houston": 11,
  "Kansas City": 42,
  "London": 42,
  "Los Angeles": 56,
  "Miami": 11,
  "Milwaukee": 4,
  "Mississauga": 12,
  "Moscow": 1,
  "Mumbai": 98,
  "New York - 120 Broadway": 387,
  "New York - Downtown": 155,
  "New York - Madison": 241,
  "Newark": 35,
  "Ottawa": 2,
  "Perth": 10,
  "Philadelphia": 23,
  "Phoenix": 2,
  "Portland": 33,
  "Romsey": 26,
  "San Diego": 6,
  'San Francisco': 49,
  "Santa Clara": 5,
  "Seattle": 10,
  "Shanghai": 17,
  "Sydney": 1,
  "Tampa": 8,
  "Toronto": 12,
  "Warrington": 26,
  'Washington': 57,
  "West Hartford": 5,
  'Wellington': 1,
  "York": 1
}

MongoClient.connect(url, {
    useUnifiedTopology: true
}).then(function (db) {
    console.log("CONNECTED TO DB");
    // console.log(emails);
    var today = new Date();
    if (today.getDay() == 5) console.log("today is friday");
    else {
        console.log("today is not friday yet!")
        db.close();
        return;
    }

    getUsers(db).then(function () {

      getWorkPreferences(db).then(function () {
          var offices = _.uniq(_.map(allUsers, 'location')).sort();
          // console.log("offices", offices);

          let csv = "Office,Name,Email, Fully Vaccinated\r\n";
          let csv2 = "Office,Name,Email, Fully Vaccinated\r\n";
          let csv3 = "Office,Orange,Red,Total App Signups in Office,Total Number of Employees Who Have Not Updated in 7 Days, Total Employee Count, Employee in office, Employee Percentage in Office, Total Fully Vaccinated Employee Count, Fully Vaccinated Employee Percentage\r\n";

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
              var totalNeedsUpdate = usersneedsUpdate.length;

              var currentOfficePop1;//default container
              var currentOfficePop2;
              var currentOfficePop3;
              if (office === "New York") {
                currentOfficePop1 = allWorkPreferences.filter(wp=>wp.office === "New York - Downtown");
                // currentOfficePop2 = allWorkPreferences.filter(wp=>wp.office === "New York - Madison");
                currentOfficePop3 = allWorkPreferences.filter(wp=>wp.office === "New York - 120 Broadway");
              }
              else if (office === "Edinburgh") {
                currentOfficePop1 = allWorkPreferences.filter(function (wp) {
                  if (wp.office === "Edinburgh" || wp.office === "Edinburgh - Limehillock") return true;
                  else return false;
                });
              }
              else currentOfficePop1 = allWorkPreferences.filter(wp=>wp.office === office);


              let uniqueUserinOffice1 = [];
              if (currentOfficePop1.length > 0) {
                currentOfficePop1.forEach(cop=>{
                  let curUser = String(cop.user);
                  if (!uniqueUserinOffice1.includes(curUser)) uniqueUserinOffice1.push(curUser);
                })
              }
              let uniqueUserinOffice2 = [];
              if (currentOfficePop2 && currentOfficePop2.length > 0) {
                currentOfficePop2.forEach(cop=>{
                  let curUser = String(cop.user);
                  if (!uniqueUserinOffice2.includes(curUser)) uniqueUserinOffice2.push(curUser);
                })
              }
              let uniqueUserinOffice3 = [];
              if (currentOfficePop3 && currentOfficePop3.length > 0) {
                currentOfficePop3.forEach(cop=>{
                  let curUser = String(cop.user);
                  if (!uniqueUserinOffice3.includes(curUser)) uniqueUserinOffice3.push(curUser);
                })
              }

              var employeeInOffice = uniqueUserinOffice1.length;
              // var employeeInOffice2 = uniqueUserinOffice2.length;
              var employeeInOffice3 = uniqueUserinOffice3.length;

              const employeeWithVac = usersbyOffice.filter(u => u.fullyVaccinated).length;

              if (office === "New York") {
                csv3 += `${"New York-120 Broadway"},${numberOfOrange},${numberOfRed},${total},${totalNeedsUpdate},${userCountByOffice["New York - 120 Broadway"]},${employeeInOffice3}, ${String((employeeInOffice3/userCountByOffice["New York - 120 Broadway"]*100).toFixed(2)) + "%"},${employeeWithVac}, ${String((employeeWithVac/userCountByOffice["New York - 120 Broadway"]*100).toFixed(2)) + "%"}\r\n`;
                csv3 += `${"New York-Downtown"},${''},${''},${''},${''},${userCountByOffice["New York - Downtown"]},${employeeInOffice},${String((employeeInOffice/userCountByOffice["New York - Downtown"]*100).toFixed(2)) + "%"},${''},${''}\r\n`;
                // csv3 += `${"New York-120 Broadway"},${''},${''},${''},${''},${''},${userCountByOffice["New York - 120 Broadway"]},${employeeInOffice3}, ${String((employeeInOffice3/userCountByOffice["New York-120 Broadway"]*100).toFixed(2)) + "%"},${''}\r\n`;
              }
              else csv3 += `${office},${numberOfOrange},${numberOfRed},${total},${totalNeedsUpdate},${userCountByOffice[office]},${employeeInOffice}, ${String((employeeInOffice/userCountByOffice[office]*100).toFixed(2)) + "%"},${employeeWithVac}, ${String((employeeWithVac/userCountByOffice[office]*100).toFixed(2)) + "%"}\r\n`;

          });

          // calcualte total office attendance
          let totalUniqueName = [];

          allWorkPreferences.forEach(awp=>{
            let awpUser = String(awp.user);
            if (!totalUniqueName.includes(awpUser)) totalUniqueName.push(awpUser);
          })


          const allUserVaccinated = allUsers.filter(u => u.fullyVaccinated);

          const usOffices = [
            "Albuquerque", 
            "Atlanta", 
            "Austin", 
            "Boston", 
            "Chicago", 
            "Dallas", 
            "Denver", 
            "Fort Lauderdale", 
            "Houston", 
            "Kansas City", 
            "Los Angeles", 
            "Miami", 
            "Milwaukee", 
            "New York", 
            "New York - 120 Broadway", 
            "Newark", 
            "Philadelphia", 
            "Phoenix", 
            "Portland", 
            "San Diego", 
            "San Francisco", 
            "Santa Clara", 
            "Seattle", 
            "Tampa", 
            "Washington", 
            "West Hartford"
          ];

          var us_employee_arr = [];
          usOffices.forEach(of => {
            const curOfficeCount = userCountByOffice[of];

            if (curOfficeCount)us_employee_arr.push(userCountByOffice[of]);
          })

          const totalUsEmployeeCount = us_employee_arr.reduce(function(a, b) { return a + b; }, 0);

          const usVaccinated = allUserVaccinated.filter(u => {
            return usOffices.includes(String(u.location));
          }).length;

         


          let content = contentTemplate.replace('<INOFFICE_PERCENTAGE>', ((totalUniqueName.length/1351)*100).toFixed(2)).replace('<INOFFICE_COUNT>', totalUniqueName.length);
          content = content.replace('<VACCINATED_PERCENTAGE>', ((allUserVaccinated.length/1351)*100).toFixed(2)).replace('<VACCINATED_COUNT>', allUserVaccinated.length);
          
          content = content.replace('<US_EMPLOYEE_COUNT>', totalUsEmployeeCount)
                          .replace('<US_VACCINATED_PERCENTAGE>', ((usVaccinated/totalUsEmployeeCount)*100).toFixed(2))
                          .replace('<US_VACCINATED_COUNT>', usVaccinated);
          
          let attachment = Buffer.from(csv).toString('base64');
          let attachment2 = Buffer.from(csv2).toString('base64');
          let attachment3 = Buffer.from(csv3).toString('base64');

          sendEmail(content, emails, attachment, attachment2, attachment3);

      })
  })

}).catch(err => {
    console.error("An error occurred reading the database.");
    console.error(err);
});

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
            client_db.close();
            resolve(true);

        });

    });


}

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
                    resolve(true);
                }
            }


        });




    });


}

function sendEmail(content, emails, attachment, attachment2, attachment3) {
    var toEmails = Array.isArray(emails)? emails : [emails];

    const mailOptions = {
        // to: toEmail,
        // to: "hsun@thorntontomasetti.com",
        from: sender,
        bcc: 'hsun@thorntontomasetti.com',
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
