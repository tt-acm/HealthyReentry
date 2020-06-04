const router = require('express').Router();

const Status = require('../../models/Status');

const triggerUpdates = require('../../lib/trigger_updates');


/**
 * @swagger
 * path:
 *  /api/status/report:
 *    post:
 *      summary: Submit a new status update for the current user.
 *      tags: [Status]
 *      parameters:
 *        - in: body
 *          name: status
 *          description: Status code to set for all users (use -1 to skip).
 *          schema:
 *            type: integer
 *            enum: [-1, 0, 1, 2]
 *        - in: body
 *          name: user
 *          description: Current active user (autopopulated).
 *          schema:
 *            $ref: '#/components/schemas/User'
 *      produces:
 *       - application/json
 *      responses:
 *        200:
 *          description: Current user's latest status.
 *        500:
 *          description: Server error.
 */
router.post("/report", function (req, res) {

  var status = new Status({
    status: req.body.status,
    user: req.user
  });

  status.save(async function (err, savedStatus) {

    const triggerData = {
      user: req.user,
      statusEnum: status.status
    };
    
    // no await
    triggerUpdates(triggerData);
    
    if (!err) return res.json(savedStatus);
    else return res.status(500).send(err);
  });

});


/**
 * @swagger
 * path:
 *  /api/status/get-current:
 *    get:
 *      summary: Get the latest status for the current user.
 *      tags: [Status]
 *      produces:
 *       - application/json
 *      responses:
 *        200:
 *          description: Current user's latest status.
 *        500:
 *          description: Server error.
 */
router.get("/get-current", function (req, res) {
  Status.find({
      "user": req.user._id
    }).sort({
      date: -1
    }).limit(1)
    .exec(function (err, statuses) {
      if (statuses == null) res.json(null);
      if (!err) return res.json(statuses[0]);
      else return res.status(500).send(err);
    });

});



module.exports = router;