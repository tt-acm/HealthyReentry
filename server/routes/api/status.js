const router = require('express').Router();

const Status = require('../../models/Status');

const triggerUpdates = require('../../lib/trigger_updates');


router.post("/report", function (req, res) {

  //First, search for latest status
  Status.find({
      "user": req.user._id
    }).sort({
      date: -1
    }).limit(1)
    .exec(function (err, statuses) {
      if (err) return res.status(500).send(err);

      var latestStatus;
      if (statuses && statuses.length > 0) {
        latestStatus = {
          status: statuses[0].status,
          date: statuses[0].date
        };
      }

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
        triggerUpdates(triggerData, false, latestStatus);

        if (!err) return res.json(savedStatus);
        else return res.status(500).send(err);
      });
  });

});

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
