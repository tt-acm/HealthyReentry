const router = require('express').Router();
const sgClient = require('@sendgrid/mail');
const fs = require('fs');

const Vaccination = require('../../models/Vaccination');
const User = require('../../models/User');

const adminUpdateTemplate = fs.readFileSync("./server/assets/email_templates/VaccinationUpdate_byAdmin.html").toString("utf-8");
const userUpdateTemplate = fs.readFileSync("./server/assets/email_templates/VaccinationUpdate_byUser.html").toString("utf-8");


sgClient.setApiKey(process.env.SENDGRID_API_KEY);
var sdSender = process.env.SENDGRID_EMAIL;

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
// router.post("/add-vaccination-records", function (req, res) {

//   if (req.body == null || !Array.isArray(req.body) || req.body.length == 0) return res.status(500).send("Invalid vaccination input"); 

//   const newVacArr = [];

//   req.body.forEach(v => {
//     const vac = new Vaccination({    
//       user: req.user,
//       manufacturer: v.manufacturer,
//       date: v.date
//     });

//     newVacArr.push(vac);
//   })  

//   Vaccination.insertMany(newVacArr, function(error, updatedVaccinations) {
//     if (error) {
//       // status insert fail
//       console.log(error);
//       return res.status(500).send("Failed to save vaccination records"); 
//     } else {
//       // status insert success
//       Vaccination.find({
//         "user": req.user._id
//       }).sort({
//         date: 1
//       })
//       .exec(function (err, latestVaccine) {
//         if (err) res.status(500).send(err); 
//         return res.send(latestVaccine);
//       })      
//     }
//   });

// });

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

  if (req.body == null || !Array.isArray(req.body)) return res.status(500).send("Invalid vaccination input"); 

  console.log("about to delete", req.body);

  var allPromises = [];

  req.body.forEach(d => {
    allPromises.push(Vaccination.deleteOne({ "_id" : d._id }));
  })

  Promise.all(allPromises).then((result) => {
    console.log("result", result);
    res.send("Success");
  });

  

});


router.post("/update-vaccination-records", function (req, res) {
  console.log("req.body", req.body);

  if (!req.body.sender || !req.body.target || !req.body.content) return res.status(500).send("Invalid info.");
  const body = req.body.content;
  if (body == null || !Array.isArray(body) || body.length == 0) return res.status(500).send("Invalid vaccination input"); 

  
  const allPromises = [];

  body.forEach(v => {
    if (v.new == true){
      console.log("THIS IS NEW", v);

      if (!v.manufacturer || !v.date) return;
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

      triggerEmailConfirmation(req.body.sender, req.body.target);
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


const triggerEmailConfirmation = function (sender, target) {
  let adminContent = adminUpdateTemplate.replace(new RegExp('<PRODUCTION_URL>', 'g'), process.env.VUE_APP_URL);
  let userContent = userUpdateTemplate.replace(new RegExp('<PRODUCTION_URL>', 'g'), process.env.VUE_APP_URL);


    const adminEmailOptions = {
        to: target,
        from: sdSender,
        subject: "Your vaccination record has been updated",
        html: adminContent
    };

    const userEmailOptions = {
      to: target,
      from: sdSender,
      subject: "You have updated your vaccination record",
      html: userContent
  };


  var option;

  if (sender == "Admin") option = adminEmailOptions;
  else if (sender == "User") option = userEmailOptions;
  else return; 

  sgClient.send(option).then(() => {
    console.log('emails sent successfully to: ', target);
  }).catch(error => {
    console.log(error);
  });    
}


module.exports = router;
