const router = require('express').Router();
const fs = require('fs');

const sgClient = require("../../lib/sgClient");
const variables = require("../../util/variables");
const eg = require('../../lib/build_encounter_graph');

const User = require('../../models/User');
const Encounter = require('../../models/Encounter');
const Status = require('../../models/Status');

const orangeContent = fs.readFileSync('server/assets/email_templates/orangeContent.html').toString("utf-8");
const redContent = fs.readFileSync("server/assets/email_templates/redContent.html").toString("utf-8");

/**
 * @swagger
 * path:
 *  /api/encounters/add-one:
 *    post:
 *      summary: Submit a new encounter to database.
 *      tags: [Encounters]
 *      parameters:
 *        - in: body
 *          name: date
 *          description: Date of the encounter; uses current date if null.
 *          schema:
 *            type: date
 *        - in: body
 *          name: id
 *          description: Encountered user's id (use id or email).
 *          schema:
 *            type: string
 *        - in: body
 *          name: email
 *          description: Encountered user's email (use id or email).
 *          schema:
 *            type: string
 *      produces:
 *       - application/json
 *      responses:
 *        200:
 *          description: The newly created encounter.
 *        500:
 *          description: Server error.
 */
router.post("/add-one", function (req, res) {

    var encounter = new Encounter({
        users: []
    });
    if (req.body.date) encounter.date = req.body.date;
    else encounter.date = new Date();

    if (req.body.id) {
        encounter.users.push(req.body.id); // req.user will be added presave
        encounter.save(function (err, savedEncounter) {
            if (!err) return res.json(savedEncounter);
            else return res.status("500").send(err);
        });

    } else if (req.body.email) {

        User.findOne({
                "email": req.body.email.toLowerCase()
            })
            .exec(function (err, user) {
                if (!err) {
                    encounter.users.push(user); // req.user will be added presave
                    encounter.save(function (error, savedEncounter) {
                        if (!error) return res.json(savedEncounter);
                        else return res.status("500").send(error);
                    });

                } else {
                    return res.status(500).send(err);
                }
            });

    }
});


/**
 * @swagger
 * path:
 *  /api/encounters/add-many:
 *    post:
 *      summary: Submit multiple encounters to database, can be group encounters.
 *      tags: [Encounters]
 *      parameters:
 *        - in: body
 *          name: date
 *          description: Date of the encounter; uses current date if null.
 *          schema:
 *            type: date
 *        - in: body
 *          name: ids
 *          description: User ids for logging the encounters excluding the sender.
 *          schema:
 *            type: list
 *            items:
 *              type: string
 *        - in: body
 *          name: isGroup
 *          description: If true it is considered as a group encounters which add all combinations of 
 *                       encounters within the group. If false add encounter only with the sender.
 *          schema:
 *            type: boolean
 *      produces:
 *       - application/json
 *      responses:
 *        200:
 *          description: The newly created encounter.
 *        500:
 *          description: Server error.
 */
router.post("/add-many", async function (req, res) {


    try {

        let ids = req.body.encounters.reduce(function (out, x) {
            out.push(x._id);
            return out;
        }, []);

        // make copy of others ids which will be used to check status later
        let allIds = JSON.parse(JSON.stringify(ids));
    
        let encounters = [];
    
        if (req.body.isGroup) {
            // add sender to ids and add all combinations to encounter array
            ids.push(req.user.id);
    
            for (let k = 0; k < ids.length - 1; k++) {
    
                let id = ids[k];
    
                for (let l = k + 1; l < ids.length; l++) {
                    let e = new Encounter({
                        users: []
                    });
                    e.date = (req.body.date) ? req.body.date : new Date();
                    
                    e.users.push(id);
                    e.users.push(ids[l]);
                    encounters.push(e.toObject());
    
                }
    
            }    
    
        } else {
    
            // this add enounters with the sender user only
            ids.forEach(function (id) {
    
                let e = new Encounter({
                    users: []
                });
                if (req.body.date) e.date = req.body.date;
                else e.date = new Date();
                e.users.push(req.user.id);
                e.users.push(id);
                encounters.push(e.toObject());
    
            });
    
        }
    
        await Encounter.insertMany(encounters);

        // add self's id to the pool before checking for exposure risk
        allIds.push(req.user.id);

        let worstStatus = 0;
        let isGreen = [];
        let isOrange = [];
        let isRed = [];
        
        let statuses = [];
        for(let uid of allIds) {
            let st = (await Status.find({
                "user": uid
            })
            .sort({
                date: -1
            })
            .limit(1))[0];
            statuses.push(st);
            if (st.status > worstStatus) worstStatus = st.status;
            if (st.status === 1) isOrange.push(uid);
            else if (st.status === 2) isRed.push(uid);
            else isGreen.push(uid);
        }

        if (worstStatus === 2) {
            let newStatuses = [];
            let emails = [];
            for(let uid of isGreen) {
                let u = await User.findOne({_id: uid});
                emails.push(u.email);
                let status = new Status({
                  status: 1, // set status Orange
                  user: u,
                  date: new Date()
                });
                newStatuses.push(status);
            }
            await Status.insertMany(newStatuses);
            if (emails.length > 0) {
                // send notification email 30mins after event to avoid being traced by users
                setTimeout(() => {
                    sendEmail("Attention: Refrain from coming to the office", emails, redContent);
                }, 60000 * 30);
            }
        }

        else if (worstStatus === 1) {
            let emails = [];
            for(let uid of isGreen) {
                let u = await User.findOne({_id: uid});
                emails.push(u.email);
            }
            if (emails.length > 0) {
                // send notification email 30mins after event to avoid being traced by users
                setTimeout(() => {
                    sendEmail("Attention: Refrain from coming to the office", emails, orangeContent);
                }, 60000 * 30);
            }
        }
        
        return res.json(true);
        

    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }


});


/**
 * @api {get} /api/encounters/find-frequent-encounters
 * @apiName Encounters
 * @apiDescription finds frequent encounters
 * @apiGroup encounters
 *
 * @apiSuccess {Object[]} encounters { -id, email, name, encounteredToday};
 * @apiError 500 Internal Server Error
 *
 */
/**
 * @swagger
 * path:
 *  /api/encounters/find-frequent-encounters:
 *    get:
 *      summary: Get current user's frequent encounters.
 *      tags: [Encounters]
 *      produces:
 *       - application/json
 *      responses:
 *        200:
 *          description: List of current user's encounters in the past 7 days, with a flag
 *                       indicating if the encounter was today.
 *        500:
 *          description: Server error.
 */
router.get("/find-frequent-encounters", function (req, res) {
    //https://docs.mongodb.com/manual/tutorial/query-arrays/

    var checkDate = new Date();
    var pastDate = checkDate.getDate() - 7;
    checkDate.setDate(pastDate);
    const today = new Date().toJSON().slice(0,10).replace(/-/g,'/');

    // returns only email, profile name, and _id
    let include = {
        "_id": 1,
        "email": 1,
        "name": 1
    }

    Encounter.find({
            "users": req.user._id,
            "date": {
                "$gte": checkDate
            }
        }).populate("users", include).sort({
            "date": -1
        })
        .exec(function (err, encounters) {
            var frequentEncounters = [];
            encounters.forEach(function (e) {

                e.users.forEach(function (user) {
                    var index = frequentEncounters.findIndex(obj => obj._id == user._id);
                    if (index === -1 && user.id != req.user.id) {
                        var jsonString = JSON.stringify(user);
                        var userObj = JSON.parse(jsonString);

                        const eDate = new Date(e.date).toJSON().slice(0,10).replace(/-/g,'/');

                        if (eDate === today) {
                            userObj.encounteredToday = true;
                        } else userObj.encounteredToday = false;
                        frequentEncounters.push(userObj);
                    }
                })
            });

            res.json(frequentEncounters);
        });
});



/**
 * @swagger
 * path:
 *  /api/encounters/get-graph:
 *    get:
 *      summary: Get graphs of all encounters for current user, send email to admin and 
 *               notify downstream contacts.
 *      tags: [Encounters]
 *      produces:
 *       - application/json
 *      responses:
 *        200:
 *          description: JSON representing graph interactions.
 *        500:
 *          description: Server error.
 */
router.post("/get-graph", function (req, res) {

    eg(req.user.email).then(async function (graph) {

        var headers = "Email, Number Of Direct Encounters, Degree of Separation , Status";

        var csv = graph.map(function (d) {
                return JSON.stringify(Object.values(d));
            })
            .join('\n')
            .replace(/(^\[)|(\]$)/mg, '');


        csv = headers + '\n' + csv;
        let buff = new Buffer(csv);
        let base64data = buff.toString('base64');

        ///EMAIL SERVICE
        // Admin List to Change
        var title = process.env.VUE_APP_NAME + " Alert - ALPHA TESTING";
        var thisHTML = "<div><p><strong>Attention:</strong><br><br>" + req.user.name + " reported their COVID_19 status as <i>" + req.body.status + ".</i><br><br>Attached are all of the employee’s encounters that have occurred within the last 14 days.</p></div>";

        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();

        var newdate = month + "/" + day + "/"+ year;
        var fileName = req.user.name + "-" + req.body.status + "-"+ newdate + ".csv";

        await sendEmail(title, variables.ADMIN_USERS, thisHTML, base64data, fileName)

        return res.json(graph);

    });


});



function sendEmail(subject, toEmails, content, attachment, filename) {
    return new Promise(function(resolve, reject) {
  
      const mailOptions = {
        to: toEmails,
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
      }
  
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


module.exports = router;
