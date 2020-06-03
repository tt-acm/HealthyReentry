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
const userConfTemplate = fs.readFileSync("./server/assets/email_templates/userConfTemplate.html").toString("utf-8");
const adminUpdateTemplate = fs.readFileSync("./server/assets/email_templates/adminUpdateTemplate.html").toString("utf-8");


// Status route report --- user report
// Admin route update status -- admin report -boolean -admin true
// get graph here...
// user.id and statusEnum
async function triggerUpdates(triggerData, byAdmin) {


  try {

    byAdmin = !!byAdmin;

    let d = new Date();
    let formattedDate = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
    let localCurDate = moment(d).format('ll');

    let user = triggerData.user;
    let statusEnum = triggerData.statusEnum;
    let status = enumStatusMap.filter(i => i.code === statusEnum)[0];

    let adminEmailContent = adminTemplate.replace('<USER_NAME>', user.name).replace('<STATUS_LABEL>', status.label).replace('<TRACE_PERIOD>', variables.INCUBATION_PERIDOD);
    let adminEmailContent_byHR = adminTemplate_byHR.replace('<USER_NAME>', user.name).replace('<STATUS_LABEL>', status.label).replace('<TRACE_PERIOD>', variables.INCUBATION_PERIDOD);
    let userConfContent = userConfTemplate.replace('<STATUS_LABEL>', status.label).replace('<STATUS_DATE>', localCurDate);
    let adminUpdateContent = adminUpdateTemplate.replace('<STATUS_LABEL>', status.label);

    let csvHeader = "Name,Email,Number Of Direct Encounters,Degree of Separation,Status,Status Last Updated\r\n";
    let sub = "Healthy Reentry Alert";

    sub = "Your status color has been changed";

    if (statusEnum === 1 || statusEnum === 2) {
      adminUpdateContent += "<p>If you are in the office, please return to working remotely. If you are out of the office, please refrain from going into the office. <br><br>The Talent Team will contact you within one business day with next steps. Please contact Lizette Agostini with questions.</p>";
      userConfContent += "<p>If you are in the office, please return to working remotely. If you are out of the office, please refrain from going into the office. <br><br>The Talent Team will contact you within one business day with next steps. Please contact Lizette Agostini with questions.</p>";
    }

    // inform the user
    if (byAdmin) {
      await sendEmail("Your status color has been changed", [user.email], adminUpdateContent);
    } else {
      await sendEmail("You have updated your status color", [user.email], userConfContent);
    }

    if (statusEnum === 1) // Status Reported Orange
    {
      let graph = await eg(user.email, 2, null); // get last two days of encounters... \

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
      if (byAdmin) {
        await sendEmail("Employee’s log", variables.ADMIN_USERS, adminEmailContent_byHR, attachment, filename); //admin changed status
      } else {
        await sendEmail("Employee’s log", variables.ADMIN_USERS, adminEmailContent, attachment, filename); //user changed their status themselves
      }

      // inform every direct contact
      if (emails.length > 0) {
        await sendEmail("Attention: Refrain from coming to the office", emails, orangeContent);
      }
    } else if (statusEnum === 2) { // Status Reported Red
      let graph = await eg(user.email, variables.INCUBATION_PERIDOD, null); // get encounters within incubation period

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
        await sendEmail("Attention: Refrain from coming to the office", emails, redContent);
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
      if (byAdmin) {
        await sendEmail("Employee’s log", variables.ADMIN_USERS, adminEmailContent_byHR, attachment, filename); //admin changed status
      } else {
        await sendEmail("Employee’s log", variables.ADMIN_USERS, adminEmailContent, attachment, filename);
      }
      // inform every second degree contact
      if (emails.length > 0) await sendEmail("Attention: Refrain from coming to the office", emails, orangeContent);

    }


  return true;

} catch (excp) {
  console.log(excp);
  return false;
}

}






function sendEmail(subject, toEmails, content, attachment, filename) {
  return new Promise(function(resolve, reject) {

    const mailOptions = {
      to: toEmails,
      from: process.env.SENDGRID_EMAIL,
      subject: subject || "Healthy Reentry Alert - TESTING",
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

    // https://www.twilio.com/blog/sending-bulk-emails-3-ways-sendgrid-nodejs
    // the recepients not able to see each other

    sgClient.sendMultiple(mailOptions, function(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(mailOptions);
    });

  });

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
