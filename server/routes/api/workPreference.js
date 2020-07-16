const router = require('express').Router();

const WorkPreference = require('../../models/WorkPreference');



/**
 * @swagger
 * path:
 *  /api/workPreference/add:
 *    post:
 *      summary: Create a new work preference for current user in the DB.
 *      tags: [Status]
 *      parameters:
 *        - in: body
 *          name: office
 *          description: User's preference in which office they intend to be in.
 *          schema:
 *            type: string
 *        - in: body
 *          name: user
 *          description: Current active user (autopopulated).
 *          schema:
 *            $ref: '#/components/schemas/User'
 *      produces:
 *       - application/json
 *      responses:
 *        200:
 *          description: Current user's latest work preference.
 *        500:
 *          description: Server error.
 */
router.post("/add", function (req, res) {

  WorkPreference.find({
    "user": req.user._id
  }).sort({
    createdAt: -1
  }).limit(1)
  .exec(async function(err, preference) {
    if (err) return res.status(500).send(err);

    //if there is existing workPreference, delete them first
    if (preference.length !== 0) await WorkPreference.remove({ "user": req.user._id });

    wp = new WorkPreference({
      office: req.body.office,
      user: req.user
    });
    wp.save(async function (err, savedWP) {
      if (!err) return res.json(savedWP);
      else return res.status(500).send(err);
    });
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
router.get("/get-latest", function (req, res) {
  WorkPreference.find({
    "user": req.user._id
  }).sort({
    createdAt: -1
  }).limit(1)
  .exec(function(err, wp) {
    if (wp.length === 0) res.json(null);
    if (!err) return res.json(wp[0]);
    else return res.status(500).send(err);
  });

});



module.exports = router;
