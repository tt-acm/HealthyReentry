const router = require('express').Router();

const User = require('../../models/User');
const Status = require('../../models/Status');

const eg = require('../../lib/build_encounter_graph');
const triggerUpdates = require('../../lib/trigger_updates');



/**
 * @api {any} /api/admin
 * @apiName _Middleware
 * @apiDescription Only allow admins to access admin routes
 * @apiGroup admin
 */
router.use(function (req, res, next) {
  if (!req.user.permissions.admin) {
    res.status("404").send("Not found");
  } else {
    next();
  }
});


/**
 * @swagger
 * path:
 *  /api/admin/get-all-users:
 *    get:
 *      summary: Get all users from the database.
 *      tags: [Admin]
 *      produces:
 *       - application/json
 *      responses:
 *        200:
 *          description: All stored users.
 *        500:
 *          description: Server error.
 */
router.get("/get-all-users", async function(req, res) {

  const ret = [];

  let include = {
    "_id": 1,
    "dateOfConsent": 1,
    "name": 1,
    "email": 1,
    "location": 1
  }

  const users = await User.find({}, include).exec();

  for(let u of users) {
    let nu = u.toObject();
    const st = await Status.find({ "user": nu._id })
                           .sort({ date: -1 })
                           .limit(1);
    nu.status = st[0];
    ret.push(nu)
  }

  res.json(ret);

});


/**
 * @swagger
 * path:
 *  /api/admin/update-users:
 *    post:
 *      summary: Updates multiple users at the same time.
 *      tags: [Admin]
 *      parameters:
 *        - in: body
 *          name: statusCodeToSet
 *          description: Status code to set for all users (use -1 to skip).
 *          schema:
 *            type: integer
 *            enum: [-1, 0, 1, 2]
 *        - in: body
 *          name: selectedUserIds
 *          description: List of users ids as object to apply the changes to.
 *          schema:
 *            type: list
 *            items:
 *              type: string
 *      produces:
 *       - application/json
 *      responses:
 *        200:
 *          description: All updated users.
 *        500:
 *          description: Server error.
 */
router.post("/update-users", async function(req, res) {

  const data = req.body;
  const mustSetStatus = data.statusCodeToSet > -1 && data.statusCodeToSet < 5;
  const mustSetLocation = data.locationToSet !== null;
  data.selectedUserIds = data.selectedUserIds || [];

  const savedData = [];

  for(const userData of data.selectedUserIds) {

    let user = await User.findById(userData.userId);

    if(mustSetLocation) {
      user.location = data.locationToSet;
      await user.save();
    }

    let savedStatus;

    if (mustSetStatus) {

      let statusEnum = parseInt(data.statusCodeToSet);

      const st = new Status({
        status: statusEnum,
        user: user
      });

      savedStatus = await st.save();

      // trigger graph update only if the post request was meant to update status
      const triggerData = {
        user: user,
        statusEnum: statusEnum
      };
  
      // dont holdup the response for current trigger to percolate
      triggerUpdateQueue.push(triggerData);
      triggerQueue();

    } else {

      const st = await Status.find({ "user": user._id })
                              .sort({ date: -1 })
                              .limit(1);
      savedStatus = st[0];

    }

    const newUser = user.toObject();
    newUser.status = savedStatus;

    savedData.push(newUser);

  }

  res.json(savedData);

});


/**
 * @swagger
 * path:
 *  /api/admin/get-graph:
 *    post:
 *      summary: Get the interaction graph for users with given email ids.
 *      tags: [Admin]
 *      parameters:
 *        - in: body
 *          name: incubationDays
 *          description: Number of days from user's last status update to check for encounters.
 *          schema:
 *            type: integer
 *        - in: body
 *          name: emails
 *          description: List of user email addresses.
 *          schema:
 *            type: list
 *            items:
 *              type: string
 *      produces:
 *       - application/json
 *      responses:
 *        200:
 *          description: JSON representing graph interactions.
 *        500:
 *          description: Server error.
 */
router.post("/get-graph", async function(req, res) {
  let emailList = req.body.emails;
  let incubationDays = parseInt(req.body.incubationDays);
  if (!emailList || emailList.length < 1 || !incubationDays) {
    res.status(400).send("Missing parameters.");
    return;
  }
  let graphs = [];
  for(let email of emailList) {
    let graph = await eg(email, incubationDays);
    graphs.push(graph);
  }
  res.json(graphs);
});




const triggerUpdateQueue = [];

async function triggerQueue() {
  
  while(triggerUpdateQueue.length > 0) {
    let triggerData = triggerUpdateQueue.shift();

    let success = await triggerUpdates(triggerData, true);
    if (!success) {
      console.log('Trigger failed for following data');
      console.log(triggerData);
    }
  }

}


module.exports = router;