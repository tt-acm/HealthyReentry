'use strict';

const User = require('../models/User');
const Status = require('../models/Status');

var moment = require("moment");

const sgClient = require("../lib/sgClient");
const eg = require('../lib/build_encounter_graph');
const nodeToCsvLine = require("../util/csvUtils.js").nodeToCsvLine;

const variables = require("../util/variables");
const enumStatusMap = require("../util/enumStatusMap");

const fs = require('fs');

const orangeContent = fs.readFileSync("./server/assets/email_templates/orangeContent.html").toString("utf-8");
const redContent = fs.readFileSync("./server/assets/email_templates/redContent.html").toString("utf-8");

const adminTemplate = fs.readFileSync("./server/assets/email_templates/adminTemplate.html").toString("utf-8");
const adminTemplate_byHR = fs.readFileSync("server/assets/email_templates/adminTemplate_byHR.html").toString("utf-8");
const adminTemplate_bySystem = fs.readFileSync("server/assets/email_templates/adminTemplate_bySystem.html").toString("utf-8");
const userConfTemplate = fs.readFileSync("./server/assets/email_templates/userConfTemplate.html").toString("utf-8");
const adminUpdateTemplate = fs.readFileSync("./server/assets/email_templates/adminUpdateTemplate.html").toString("utf-8");


// Status route report --- user report
// Admin route update status -- admin report -boolean -admin true
// get graph here...
// user.id and statusEnum
async function triggerUpdates(triggerData, byAdmin, currentStatus, alertUser = true, bySystem = false) {

  try {

    byAdmin = !!byAdmin;
    var alertAdmin = true;
    if (currentStatus && triggerData) {
      if (currentStatus.status > triggerData.statusEnum || currentStatus.status == triggerData.statusEnum) alertAdmin = false;
    }

    let d = new Date();
    let formattedDate = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
    let localCurDate = moment(d).format('ll');

    let user = triggerData.user;
    let statusEnum = triggerData.statusEnum;
    let status = enumStatusMap.filter(i => i.code === statusEnum)[0];

    let adminEmailContent = adminTemplate.replace('<USER_NAME>', user.name).replace('<STATUS_LABEL>', status.label).replace('<TRACE_PERIOD>', variables.INCUBATION_PERIDOD);
    let adminEmailContent_byHR = adminTemplate_byHR.replace('<USER_NAME>', user.name).replace('<STATUS_LABEL>', status.label).replace('<TRACE_PERIOD>', variables.INCUBATION_PERIDOD);
    let adminEmailContent_bySystem = adminTemplate_bySystem.replace('<USER_NAME>', user.name).replace('<STATUS_LABEL>', status.label).replace('<TRACE_PERIOD>', variables.INCUBATION_PERIDOD);
    let userConfContent = userConfTemplate.replace('<STATUS_LABEL>', status.label).replace('<STATUS_DATE>', localCurDate);
    let adminUpdateContent = adminUpdateTemplate.replace('<STATUS_LABEL>', status.label);

    let csvHeader = "Name,Email,Number Of Direct Encounters,Degree of Separation,Status,Status Last Updated, Last Encountered\r\n";
    let sub = process.env.VUE_APP_NAME + " Alert";

    sub = "Your status color has been changed";

    if (statusEnum === 1 || statusEnum === 2) {
      adminUpdateContent += "<p>If you are in the office, please return to working remotely. If you are out of the office, please refrain from going into the office. <br><br>The Talent Team will contact you within one business day with next steps. Please contact Gwendolyn Dowdy with questions.</p>";
      userConfContent += "<p>If you are in the office, please return to working remotely. If you are out of the office, please refrain from going into the office. <br><br>The Talent Team will contact you within one business day with next steps. Please contact Gwendolyn Dowdy with questions.</p>";
    }

    // inform the user
    if (alertUser) {
      if (byAdmin || bySystem) {
        sendEmail("Your status color has been changed", [user.email], adminUpdateContent);
      } else {
        sendEmail("You have updated your status color", [user.email], userConfContent);
      }
    }

    if (statusEnum === 1) // Status Reported Orange
    {
      let graph = await eg(user.email, 2); // get last two days of encounters...

      let csv = csvHeader;

      // gather direct contacts for mail and second degree contacts for the csv
      let emails = graph.reduce(function(out, x) {
        if (x['degree-of-separation'] === 1 || x['degree-of-separation'] === 2) csv += nodeToCsvLine(x);
        if (x['degree-of-separation'] === 1 && x.status < 1) out.push(x.email);
        return out;
      }, []);

      // inform HR along with csv
      // let d = new Date();
      // let formattedDate = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
      let attachment = new Buffer(csv).toString('base64');
      let filename = `Encounter_${formattedDate}_${status.label}_${user.name}.csv`;
      if (alertAdmin) {
        debugger;
        if (bySystem) {
          sendEmail("Employee’s log - " + user.name, variables.ADMIN_USERS, adminEmailContent_bySystem, attachment, filename); //admin changed status
        }
        else if (byAdmin) {
          sendEmail("Employee’s log - " + user.name, variables.ADMIN_USERS, adminEmailContent_byHR, attachment, filename); //admin changed status
        } else {
          sendEmail("Employee’s log - " + user.name, variables.ADMIN_USERS, adminEmailContent, attachment, filename); //user changed their status themselves
        }
      }

      // inform every direct contact
      if (emails.length > 0) {
        sendEmail("Attention: Refrain from coming to the office", emails, orangeContent);
      }
    } else if (statusEnum === 2) { // Status Reported Red
      let graph = await eg(user.email, variables.INCUBATION_PERIDOD); // get encounters within incubation period

      let csv = csvHeader;

      // gather direct contacts
      let emails = graph.reduce(function(out, x) {
        if (x['degree-of-separation'] === 1) {
          csv += nodeToCsvLine(x);
          if (x.status < 1) out.push(x.email);
        }
        return out;
      }, []);

      if (emails.length > 0) {
        // update the status of every first degree contact to orange
        await UpdateStatus(emails);

        // inform every direct contact
        sendEmail("Attention: Refrain from coming to the office", emails, redContent);
      }

      // gather second degree contacts
      emails = graph.reduce(function(out, x) {
        if (x['degree-of-separation'] === 2) {
          csv += nodeToCsvLine(x);
          if (x.status < 1) out.push(x.name);
        }
        return out;
      }, []);

      // inform HR along with csv
      // let d = new Date();
      // let formattedDate = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
      let filename = `Encounter_${formattedDate}_${status.label}_${user.name}.csv`;
      let attachment = new Buffer(csv).toString('base64');
      if (alertAdmin) {
        if (byAdmin) {
          sendEmail("Employee’s log - " + user.name, variables.ADMIN_USERS, adminEmailContent_byHR, attachment, filename); //admin changed status
        } else {
          sendEmail("Employee’s log - " + user.name, variables.ADMIN_USERS, adminEmailContent, attachment, filename);
        }
      }
      // inform every second degree contact
      if (emails.length > 0) sendEmail("Attention: Refrain from coming to the office", emails, orangeContent);

    }


  return true;

} catch (excp) {
  console.log(excp);
  return false;
}

}






function sendEmail(subject, emails, content, attachment, filename) {
  const toEmails = Array.isArray(emails)? emails : [emails];

  var mailOptions = {
    // to: toEmails,
    from: process.env.SENDGRID_EMAIL,
    subject: subject || process.env.VUE_APP_NAME + " - TESTING",
    text: " ",
    html: content
  };

  if (attachment) {
    mailOptions.attachments = [{
      "content": attachment,
      "filename": filename,
      "type": "text/csv"
    }]
  };

  const messages = [];
  toEmails.forEach(function(toEmail){
    var curOption = JSON.parse(JSON.stringify(mailOptions))
    curOption["to"] = toEmail;
    messages.push(curOption);
  })

  // https://www.twilio.com/blog/sending-bulk-emails-3-ways-sendgrid-nodejs
  // the recepients not able to see each other

  sgClient.send(messages).then(() => {
    console.log('emails sent successfully to: ', toEmails);
  }).catch(error => {
    console.log(error);
  });

  // https://www.twilio.com/blog/sending-bulk-emails-3-ways-sendgrid-nodejs
  // the recepients not able to see each other
  // sgClient.sendMultiple(mailOptions, function(err) {
  //   if (err) {
  //     console.log(err);
  //   }
  // });

}

function UpdateStatus(userEmails) {
  return new Promise(function(resolve, reject) {


    User.find({
        "email": {
          $in: userEmails
        }
      })
      .exec(function(err, users) {

        if (err) {
          console.log(err);
          reject(err);
          return;
        }

        var statuses = [];

        users.forEach(function(u) {
          var status = new Status({
            status: 1, // set status Orange
            user: u,
            date: new Date()
          });
          statuses.push(status);

        });


        Status.insertMany(statuses, function(error, updatedStatuses) {
          if (error) {
            // status insert fail
            console.log(error);
            reject(error);
            return;
          } else {
            // status insert success
            resolve(updatedStatuses);
          }
        });


      });


  });



}





module.exports = triggerUpdates;
