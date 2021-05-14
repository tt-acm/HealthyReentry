const router = require('express').Router();

const Vaccination = require('../../models/Vaccination');
const User = require('../../models/User');



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

router.post("/add-one", function (req, res) {
  console.log("req.body", req.body);
  if (req.body == null || req.body.userId == null || req.body.vaccine == null) return res.status(500).send("Invalid vaccination input"); 
  


  User.findById(req.body.userId, function(err, user) {
    if (err) res.status(500).send(err); 

    const vac = new Vaccination({    
      user: user,
      manufacturer: req.body.vaccine.manufacturer,
      date: req.body.vaccine.date
    });
  
    vac.save().then(result=> {
      console.log("result", result);
      res.send(result);
    })

  });

  
});


router.post("/delete-vaccination-record", function (req, res) {
  console.log("req.body", req.body);

  if (req.body == null) return res.status(500).send("Invalid vaccination input"); 

  console.log("about to delete", req.body._id);

  Vaccination.deleteOne({ "_id" : req.body._id }).then(result =>{
    console.log("deleted");
    res.send("Success");
  })

});


router.post("/update-vaccination-records", function (req, res) {
  console.log("req.body", req.body);

  if (req.body == null || !Array.isArray(req.body) || req.body.length == 0) return res.status(500).send("Invalid vaccination input"); 

  const allPromises = [];

  req.body.forEach(v => {
    if (v.new == true){
      const vac = new Vaccination({    
        user: req.user,
        manufacturer: v.manufacturer,
        date: v.date
      });

      allPromises.push(vac.save());
    }
    // else if (v.delete) {
    //   console.log("deleting: ", v);
    //   Vaccination.deleteOne({ "_id" : v._id })
    // }
    else if (v._id) {
      allPromises.push(
        Vaccination.findOneAndUpdate(
          { _id: v._id },
          { $set: { date: v.date, manufacturer : v.manufacturer } },
          { useFindAndModify: false }
        )
      );      
    }    
  })  

  // console.log("allprmise", allPromises);

  Promise.all(allPromises).then((result) => {
    Vaccination.find({
      "user": req.user._id
    }).sort({
      date: 1
    })
    .exec(function (err, latestVaccine) {
      if (err) res.status(500).send(err); 
      return res.send(latestVaccine);
    })     
    // res.send(result);
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
