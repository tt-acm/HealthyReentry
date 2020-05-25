'use strict';

const User = require('../models/User');
const Status = require('../models/Status');

const sgClient = require("../lib/sgClient");
const eg = require('../lib/build_encounter_graph');

const variables = require("../util/variables");
const enumStatusMap = require("../util/enumStatusMap");

const fs = require('fs');

const orangeContent = fs.readFileSync("./server/assets/email_templates/orangeContent.html").toString("utf-8");
const redContent = fs.readFileSync("./server/assets/email_templates/redContent.html").toString("utf-8");

const adminTemplate = fs.readFileSync("./server/assets/email_templates/adminTemplate.html").toString("utf-8");
const userConfTemplate = fs.readFileSync("./server/assets/email_templates/userConfTemplate.html").toString("utf-8");
const adminUpdateTemplate = fs.readFileSync("./server/assets/email_templates/adminUpdateTemplate.html").toString("utf-8");

function nodeToCsvLine(node) {
  let status = enumStatusMap.filter(i => i.code === node.status)[0];
  return `${node.name},${node['number_of_encounters']},${node['degree-of-separation']},${status.label}\r\n`;
}


// Status route report --- user report
// Admin route update status -- admin report -boolean -admin true
// get graph here...
// user.id and statusEnum
async function triggerUpdates(triggerData, byAdmin) {


  try {

    byAdmin = !!byAdmin;

    let user = triggerData.user;
    let statusEnum = triggerData.statusEnum;
    let status = enumStatusMap.filter(i => i.code === statusEnum)[0];

    let adminEmailContent = adminTemplate.replace('<USER_NAME>', user.name)
                                         .replace('<STATUS_LABEL>', status.label)
                                         .replace('<TRACE_DAYS>', variables.INCUBATION_PERIDOD);
    let userConfContent = userConfTemplate.replace('<STATUS_LABEL>', status.label);
    let adminUpdateContent = adminUpdateTemplate.replace('<STATUS_LABEL>', status.label);

    let csvHeader = "Email,Number Of Direct Encounters,Degree of Separation,Status\r\n";
    let sub = "Encounter Alert";

    sub = "Your status color has been changed";
    // inform the user
    if (byAdmin) {
      await sendEmail([user.email], sub, adminUpdateContent);
    } else {
      await sendEmail([user.email], sub, userConfContent);
    }

    if (statusEnum === 1) // Status Reported Orange
    {
      let graph = await eg(user.email);

      let csv = csvHeader;

      // gather direct contacts for mail and second degree contacts for the csv
      let emails = graph.reduce(function (out, x) {
        if (x['degree-of-separation'] === 1 || x['degree-of-separation'] === 2) csv += nodeToCsvLine(x);
        if (x['degree-of-separation'] === 1 && x.status < 1) out.push(x.name);
        return out;
      }, []);

      // inform HR along with csv
      let d = new Date();
      let formattedDate = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
      let attachment = new Buffer(csv).toString('base64');
      let filename = `Encounter_${formattedDate}_${status.label}_${user.name}.csv`;
      sub = "Employee’s log";
      await sendEmail(variables.ADMIN_USERS, sub, adminEmailContent, attachment, filename);

      // inform every direct contact
      if (emails.length > 0) {
        sub = "Attention: Refrain from coming to the office";
        await sendEmail(emails, sub, orangeContent);
      }
    } else { // Status Reported Red
      let graph = await eg(user.email);

      let csv = csvHeader;

      // gather direct contacts
      let emails = graph.reduce(function (out, x) {
        if (x['degree-of-separation'] === 1) {
          csv += nodeToCsvLine(x);
          if (x.status < 1) out.push(x.name);
        }
        return out;
      }, []);

      if (emails.length > 0) {
        // update the status of every first degree contact to orange
        await UpdateStatus(emails);

        // inform every direct contact
        sub = "Attention: Refrain from coming to the office";
        await sendEmail(emails, sub, redContent);

        // gather second degree contacts
        emails = graph.reduce(function (out, x) {
          if (x['degree-of-separation'] === 2) {
            csv += nodeToCsvLine(x);
            if (x.status < 1) out.push(x.name);
          }
          return out;
        }, []);

        // inform HR along with csv
        let d = new Date();
        let formattedDate = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
        let filename = `Encounter_${formattedDate}_${status.label}_${user.name}.csv`;
        let attachment = new Buffer(csv).toString('base64');
        sub = "Employee’s log";
        await sendEmail(variables.ADMIN_USERS, sub, adminEmailContent, attachment, filename);

        // inform every second degree contact
        sub = "Attention: Refrain from coming to the office";
        await sendEmail(emails, sub, orangeContent);

      }


    }

    return true;

  } catch (excp) {
    console.log(excp);
    return false;
  }

}






function sendEmail(toEmails, subject, content, attachment, filename) {
  return new Promise(function (resolve, reject) {

    const mailOptions = {
      to: toEmails,
      from: process.env.SENDGRID_EMAIL,
      subject: subject,
      text: " ",
      html: content
    };

    if(attachment) {
      mailOptions.attachments = [{
                                  "content": attachment,
                                  "filename": filename,
                                  "type": "text/csv"
                                }]
    };

    // https://www.twilio.com/blog/sending-bulk-emails-3-ways-sendgrid-nodejs
    // the recepients not able to see each other

    sgClient.sendMultiple(mailOptions, function (err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(mailOptions);
    });

  });

}

function UpdateStatus(userEmails) {
  return new Promise(function (resolve, reject) {


    User.find({
        "email": {
          $in: userEmails
        }
      })
      .exec(function (err, users) {

        if(err) {
          console.log(err);
          reject(err);
          return;
        }

        var statuses = [];

        users.forEach(function (u) {
          var status = new Status({
            status: 1, // set status Orange
            user: u,
            date: new Date()
          });
          statuses.push(status);

        });


        Status.insertMany(statuses, function (error, updatedStatuses) {
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
