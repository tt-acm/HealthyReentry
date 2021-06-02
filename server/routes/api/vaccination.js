const router = require('express').Router();
const sgClient = require('@sendgrid/mail');
const fs = require('fs');

const Vaccination = require('../../models/Vaccination');
const User = require('../../models/User');

const adminUpdateTemplate = fs.readFileSync("./server/assets/email_templates/VaccinationUpdate_byAdmin.html").toString("utf-8");
const userUpdateTemplate = fs.readFileSync("./server/assets/email_templates/VaccinationUpdate_byUser.html").toString("utf-8");


sgClient.setApiKey(process.env.SENDGRID_API_KEY);
var sdSender = process.env.SENDGRID_EMAIL;


router.post("/delete-vaccination-record", function (req, res) {
  if (req.body == null || !Array.isArray(req.body)) return res.status(500).send("Invalid vaccination input"); 

  var allPromises = [];
  req.body.forEach(d => {
    allPromises.push(Vaccination.deleteOne({ "_id" : d._id }));
  })

  Promise.all(allPromises).then((result) => {
    // console.log("result", result);
    res.send("Success");
  });
});


router.post("/update-vaccination-records", function (req, res) {
  if (!req.body.sender || !req.body.target || !req.body.content) return res.status(500).send("Invalid info.");
  const body = req.body.content;
  if (body == null || !Array.isArray(body) || body.length == 0) return res.status(500).send("Invalid vaccination input"); 

  
  const allPromises = [];
  body.forEach(v => {
    if (v.new == true){
      if (!v.manufacturer || !v.date) return;
      const vac = new Vaccination({    
        user: req.user,
        manufacturer: v.manufacturer,
        date: v.date
      });

      allPromises.push(vac.save());
    }
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
// router.get("/get-current", function (req, res) {
//   Vaccination.find({
//     "user": req.user._id
//   }).sort({
//     date: 1
//   }).limit(1)
//   .exec(function (err, latestVaccine) {
//     if (err) res.status(500).send(err); 
//     return res.send(latestVaccine[0]);
//   })
// });

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
