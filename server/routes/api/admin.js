const router = require('express').Router();

const User = require('../../models/User');
const Status = require('../../models/Status');

const eg = require('../../lib/build_encounter_graph');
const triggerUpdates = require('../../lib/trigger_updates');
const storedRegions = require('../../util/officeList');



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
 *  /api/admin/get-users-by-filters:
 *    post:
 *      summary: Get users from the database.
 *      tags: [Admin]
 *      parameters:
 *        - in: body
 *          name: skip
 *          description: Number of users to skip from the start.
 *          schema:
 *            type: integer
 *            example: 20
 *        - in: body
 *          name: limit
 *          description: Number of users to return after skipping `skip` number of users.
 *          schema:
 *            type: integer
 *            example: 10
 *        - in: body
 *          name: nameSearch
 *          description: Text to use to for searching by name. Does case-insensitive 'contains' matching.
 *          schema:
 *            type: string
 *            example: joh
 *        - in: body
 *          name: offices
 *          description: List of offices to use to restrict searches to (null implies no filters).
 *          schema:
 *            type: Array
 *            example: ["New York", "Mumbai", "Chicago"]
 *      produces:
 *       - application/json:
 *      responses:
 *        200:
 *          description: Returns users from the database, sorted alphabetically with pagination applied.
 *        500:
 *          description: Server error.
 */
router.post("/get-users-by-filters", async function(req, res) {

  let skip = req.body.skip;
  let limit = req.body.limit;
  let nameSearch = req.body.nameSearch;
  let offices = req.body.offices;

  let include = {
    "_id": 1,
    "dateOfConsent": 1,
    "name": 1,
    "email": 1,
    "location": 1
  };

  let filteredCountQuery = !Array.isArray(offices)
                          ? User.count({ name: {'$regex': nameSearch, '$options': 'i'} })
                          : User.count({
                              name: {'$regex': nameSearch, '$options': 'i'},
                              location: {$in: offices}
                            });
  let filteredCount = await filteredCountQuery.exec();

  let findQuery = !Array.isArray(offices)
                ? User.find({ name: {'$regex': nameSearch, '$options': 'i'} }, include)
                : User.find({
                    name: {'$regex': nameSearch, '$options': 'i'},
                    location: {$in: offices}
                  }, include);

  const dbUsers = await findQuery
                        .sort({ name: 1})
                        .skip(skip)
                        .limit(limit)
                        .exec();

  let users = [];
  for(let u of dbUsers) {
    let nu = u.toObject();
    const st = await Status.find({ "user": nu._id })
                           .sort({ date: -1 })
                           .limit(1);
    nu.status = st[0];
    users.push(nu)
  }

  users.reverse();

  let ret = {
    users: users,
    filteredCount: filteredCount
  };

  res.json(ret);

});


/**
 * @swagger
 * path:
 *  /api/admin/get-uncategorized-offices:
 *    get:
 *      summary: Get list of all offices not in the region wise categorized office list.
 *      tags: [Admin]
 *      produces:
 *       - application/json
 *      responses:
 *        200:
 *          description: List of office names.
 *        500:
 *          description: Server error.
 */
router.get("/get-uncategorized-offices", async function(req, res) {
  let unknownOffices = new Set();
  let knownOffices = [];
  Object.keys(storedRegions).forEach(r => {
    knownOffices = knownOffices.concat(storedRegions[r]);
  });

  let include = {
    "location": 1
  };
  let locs = await User.find({ location: {$nin: knownOffices} }, include).exec();

  locs.forEach(l => unknownOffices.add(l.location));
  let ret = Array.from(unknownOffices);
  ret.sort();

  res.json(ret);
});


/**
 * @swagger
 * path:
 *  /api/admin/get-office-stats:
 *    post:
 *      summary: Get counts of total red, orange and green reports from office locations.
 *      tags: [Admin]
 *      parameters:
 *        - in: body
 *          name: selectedLocations
 *          description: Array of offices to make the selections for.
 *          schema:
 *            type: Array
 *            example: ["New York", "Mumbai", "Chicago"]
 *      produces:
 *       - application/json:
 *      responses:
 *        200:
 *          description: Returns counts of total red, orange and green reports from office locations.
 *        500:
 *          description: Server error.
 */
router.post("/get-office-stats", async function(req, res) {
  let offices = req.body.selectedLocations;

  let ret = [];
  for(let o of offices) {
    let users = await User.find({ location: o }).exec();

    let stats = {
      green: 0,
      orange: 0,
      red: 0,
      total: users.length
    };
    for(let u of users) {
      let st = (await Status.find({ "user": u._id })
                            .sort({ date: -1 })
                            .limit(1))[0];
      if(st.status === 0) stats.green++;
      else if(st.status === 1) stats.orange++;
      else if(st.status === 2) stats.red++;
    }

    let officeStats = {
      office: o,
      stats: stats
    };
    ret.push(officeStats);
  }

  return res.json(ret);
});


/**
 * @swagger
 * path:
 *  /api/admin/get-office-status-updates:
 *    post:
 *      summary: Get list of users who havn't updated their status in the last 7 days.
 *      tags: [Admin]
 *      parameters:
 *        - in: body
 *          name: selectedLocations
 *          description: Array of offices to make the selections for.
 *          schema:
 *            type: Array
 *            example: ["New York", "Mumbai", "Chicago"]
 *      produces:
 *       - application/json:
 *      responses:
 *        200:
 *          description: Returns office-wise list of users who haven't updated their statuses in last 7 days.
 *        500:
 *          description: Server error.
 */
router.post("/get-office-status-updates", async function(req, res) {
  let offices = req.body.selectedLocations;

  let include = {
    "_id": 1,
    "name": 1,
    "email": 1
  };

  let ret = [];
  let d = new Date();
  d.setHours(0,0,0,0);
  let cutoffDate = d.setDate(d.getDate() - 7);

  for(let o of offices) {
    let allUsers = await User.find({ location: o }, include).exec();
    let unreportedUsers = [];
    for(let u of allUsers) {
      let st = (await Status.find({ "user": u._id })
                            .sort({ date: -1 })
                            .limit(1))[0];
      if (st.date < cutoffDate) {
        let user = u.toObject();
        user.status = st;
        unreportedUsers.push(user);
      }
    }
    ret.push({
      office: o,
      users: unreportedUsers
    });
  }

  return res.json(ret);
});


/**
 * @swagger
 * path:
 *  /api/admin/get-total-users-stats:
 *    get:
 *      summary: Get stats about total users in the database.
 *      tags: [Admin]
 *      produces:
 *       - application/json
 *      responses:
 *        200:
 *          description: Stats on stored users.
 *        500:
 *          description: Server error.
 */
router.get("/get-total-users-stats", async function(req, res) {

  const ret = {};

  ret.total = await User.count({}).exec();

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

      const latestStatus = await Status.find({ "user": userData.userId })
                             .sort({ date: -1 })
                             .limit(1);
      var ls;
      if (latestStatus && latestStatus.length > 0) ls = latestStatus[0];

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
      triggerQueue(ls);

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

async function triggerQueue(ls) {

  while(triggerUpdateQueue.length > 0) {
    let triggerData = triggerUpdateQueue.shift();

    let success = await triggerUpdates(triggerData, true, ls);
    if (!success) {
      console.log('Trigger failed for following data');
      console.log(triggerData);
    }
  }

}


module.exports = router;
