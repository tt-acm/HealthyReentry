const router = require('express').Router();

const Vaccination = require('../../models/Vaccination');



/**
 * @swagger
 * path:
 *  /api/vaccination/add-vaccination-records:
 *    post:
 *      summary: Submit several new vaccination records.
 *      tags: [Vaccination]
 *      produces:
 *       - application/json
 *      responses:
 *        200:
 *          description: Current user's full vaccine record.
 *        500:
 *          description: Server error.
 */
router.post("/add-vaccination-records", function (req, res) {

  if (req.body == null || !Array.isArray(req.body) || req.body.length == 0) return res.status(500).send("Invalid vaccination input"); 

  const newVacArr = [];

  req.body.forEach(v => {
    const vac = new Vaccination({    
      user: req.user,
      manufacturer: v.manufacturer,
      date: v.date
    });

    newVacArr.push(vac);
  })

  

  Vaccination.insertMany(newVacArr, function(error, updatedVaccinations) {
    if (error) {
      // status insert fail
      console.log(error);
      return res.status(500).send("Failed to save vaccination records"); 
    } else {
      // status insert success
      Vaccination.find({
        "user": req.user._id
      }).sort({
        date: 1
      })
      .exec(function (err, latestVaccine) {
        if (err) res.status(500).send(err); 
        return res.send(latestVaccine);
      })      
    }
  });

});


/**
 * @swagger
 * path:
 *  /api/vaccination/get-current:
 *    get:
 *      summary: Get the latest vaccine for the current user.
 *      tags: [Vaccination]
 *      produces:
 *       - application/json
 *      responses:
 *        200:
 *          description: Current user's latest vaccine.
 *        500:
 *          description: Server error.
 */
router.get("/get-current", function (req, res) {
  Vaccination.find({
    "user": req.user._id
  }).sort({
    date: 1
  }).limit(1)
  .exec(function (err, latestVaccine) {
    if (err) res.status(500).send(err); 
    return res.send(latestVaccine[0]);
  })
});

router.get("/get-all", function (req, res) {
  Vaccination.find({
    "user": req.user._id
  }).sort({
    date: 1
  })
  .exec(function (err, latestVaccine) {
    if (err) res.status(500).send(err); 
    return res.send(latestVaccine);
  })
});



module.exports = router;
