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
 * @api {get} /api/admin/get-all-users
 * @apiName Encounters
 * @apiDescription get all registered users
 * @apiGroup admin
 *
 * @apiSuccess {object[]} users - list of registered users
 * @apiError 500 Internal Server Error
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
 * @api {post} /api/admin/update-users
 * @apiName Encounters
 * @apiDescription updates multiple users at the same time
 * @apiGroup admin
 *
 * @apiSuccess {object[]} users - list of updated users
 * @apiError 500 Internal Server Error
 *
 * @apiParam {Number} statusCodeToSet - status code to set for all users (use -1 to skip)
 * @apiParam {object[]} selectedUserIds - list of users ids as object to apply the changes to
 */
router.post("/update-users", async function(req, res) {

  const data = req.body;
  const mustSetStatus = data.statusCodeToSet > -1 && data.statusCodeToSet < 5;
  data.selectedUserIds = data.selectedUserIds || [];

  const savedData = [];

  for(const userData of data.selectedUserIds) {

    let user = await User.findById(userData.userId);

    await user.save();

    let savedStatus;
    if (mustSetStatus) {

      let statusEnum = parseInt(data.statusCodeToSet);

      const st = new Status({
        status: statusEnum,
        user: user
      });

      savedStatus = await st.save();

    } else {

      const st = await Status.find({ "user": user._id })
                              .sort({ date: -1 })
                              .limit(1);
      savedStatus = st[0];

    }

    let statusEnum = parseInt(data.statusCodeToSet);

    const triggerData = {
      user: user,
      statusEnum: statusEnum
    };

    // dont holdup the response for current trigger to percolate
    triggerUpdateQueue.push(triggerData);
    triggerQueue();

    const newUser = user.toObject();
    newUser.status = savedStatus;

    savedData.push(newUser);

  }

  res.json(savedData);

});




router.post("/graph", async function(req, res) {
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