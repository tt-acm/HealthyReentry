const router = require('express').Router();

const Status = require('../../models/Status');

const triggerUpdates = require('../../lib/trigger_updates');


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