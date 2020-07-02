const router = require('express').Router();

const sgClient = require("../../lib/sgClient");
const variables = require("../../util/variables");
const eg = require('../../lib/build_encounter_graph');

const User = require('../../models/User');
const Encounter = require('../../models/Encounter');



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


    var ids = req.body.encounters.reduce(function (out, x) {
        out.push(x._id);
        return out;
    }, []);
    var numEncounters = ids.length;
    if (req.body.isGroup === "true") numEncounters = combinations(numEncounters + 1, 2);

    var encounters = [];

    if (req.body.isGroup === "true") {
        // add sender to ids and add all combinations to encounter array
        req.body.ids.push(req.user.id);

        for (var k = 0; k < req.body.ids.length - 1; k++) {

            var id = req.body.ids[k];

            for (var l = k + 1; l < req.body.ids.length; l++) {
                var e = new Encounter({
                    users: []
                });
                if (req.body.date) e.date = req.body.date;

                else e.date = new Date();
                e.users.push(id);
                e.users.push(req.body.ids[l]);
                encounters.push(e.toObject());

            }

            Encounter.insertMany(encounters, function (err, docs) {
                if (err) {
                    console.log("error in insert Many", err);
                    return res.status(500).send();
                } else {
                    return res.json(true);
                }
            });

        }



    } else {

        // this add enounters with the sender user only
        ids.forEach(function (id) {

            var e = new Encounter({
                users: []
            });
            if (req.body.date) e.date = req.body.date;
            else e.date = new Date();
            e.users.push(req.user.id);
            e.users.push(id);
            encounters.push(e.toObject());

        });

        Encounter.insertMany(encounters, function (err, docs) {
            if (err) {
                console.log("error in insert Many", err);
                return res.status(500).send();
            } else {
                return res.json(true);
            }
        });

    }


});


//https://www.w3resource.com/javascript-exercises/javascript-math-exercise-42.php
//calculation of the k combination
function product_Range(a, b) {
    var prd = a,
        i = a;

    while (i++ < b) {
        prd *= i;
    }
    return prd;
}


function combinations(n, r) {
    if (n == r) {
        return 1;
    } else {
        r = (r < n - r) ? n - r : r;
        return product_Range(r + 1, n) / product_Range(1, n - r);
    }
}


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

    eg(req.user.email).then(function (graph) {

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
        const mailOptions = {
            to: variables.ADMIN_USERS,
            from: process.env.SENDGRID_EMAIL,
            subject: title,
            text: " ",
            html: thisHTML,
            "attachments": [{
                "content": base64data,
                "content_id": "",
                "disposition": "attachment",
                "filename": fileName,
                "type": "text/csv"
            }]

        };

        sendEmail(mailOptions).then(function () {
            return res.json(graph);
        });

    });


    function sendEmail(mailOptions) {
        return new Promise(function (resolve, reject) {
            // https://github.com/sendgrid/sendgrid-python/blob/master/USAGE.md#post-mailsend
            sgClient.send(mailOptions, function (err) {
                if (err) {
                    console.log("email failed", err);
                    reject();
                }

                resolve();
            });

        });

    }


});



module.exports = router;
