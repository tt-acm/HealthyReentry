const router = require('express').Router();
const fs = require('fs');
const sgClient = require("../../lib/sgClient");

const User = require('../../models/User');
const Status = require('../../models/Status');
const parseUser = require('../../util/parseUser');


/**
 * @swagger
 * path:
 *  /api/user/user-by-email:
 *    get:
 *      summary: Get user by email address.
 *      tags: [Users]
 *      produces:
 *       - application/json
 *      responses:
 *        200:
 *          description: Stored user.
 *        500:
 *          description: Server error.
 */
router.post("/user-by-email", function(req, res) {

  // returns only email, profile name, and _id
  let include = {
    "_id": 1,
    "email": 1,
    "name": 1
  }

  User.findOne({
    "email": req.body.email.toLowerCase()
  }, include)
      .exec(function(err, user) {
          if (err) {
              return res.status(500).send();
          }
          return res.json(user);
      });
});


/**
 * @swagger
 * path:
 *  /api/user/consent-signed:
 *    get:
 *      summary: Method to update database with user's consent accpetance date.
 *      tags: [Users]
 *      produces:
 *       - application/json
 *      responses:
 *        200:
 *          description: Updated user.
 *        500:
 *          description: Server error.
 */
router.get("/consent-signed", function (req, res) {
  User.findById(req.user.id)
    .exec(function (err, user) {
      if (!err) {
        user.dateOfConsent = new Date();

        user.save(function (error, updatedUser) {
          if (error) return res.status(500).send();
          // send copy of consent


          sendEmail(req.user.email, req.user.name).then(function () {
            // return res.send(updatedUser);
            // console.log("copy of consent sent");
          });
          return res.send(updatedUser);

        });


      } else {
        return res.status(500).send();
      }
    });


  function sendEmail(userEmail, userName) {
    return new Promise(function (resolve, reject) {

      var title = process.env.VUE_APP_NAME + " - Disclosure & Consent";
      var firstName = userName.split(' ')[0];
      var thisHTML = "<div><p>"+ firstName+ ",<br><br>Thank you for enrolling in the " + process.env.VUE_APP_NAME + " application. Attached is the disclosure and consent file you reviewed and agreed to.</p></div>";

      const path = './server/assets/Disclosure.pdf';
      var attachment = fs.readFileSync(path);


      let buff = new Buffer(attachment);
      let base64data = buff.toString('base64');

      // attachment str(b64data,'utf-8')
      const mailOptions = {
        to: userEmail,
        from: process.env.SENDGRID_EMAIL,
        subject: title,
        text: " ",
        html: thisHTML,
        "attachments": [{
          "content": base64data,
          "content_id": "disclosure",
          "disposition": "attachment",
          "filename": "Disclosure and Consent.pdf",
          "type": "application/pdf"
        }]

      };

      // https://github.com/sendgrid/sendgrid-python/blob/master/USAGE.md#post-mailsend
      sgClient.sendMultiple(mailOptions, function (err) {
        if (err) {
          console.log("email failed", err);
          reject();
        }

        console.log("sent");
        resolve();
      });

    });

  }

});


/**
 * @swagger
 * path:
 *  /api/user/get-all:
 *    get:
 *      summary: Get all users except current logged in user.
 *      tags: [Users]
 *      produces:
 *       - application/json
 *      responses:
 *        200:
 *          description: List of users.
 *        500:
 *          description: Server error.
 */
router.get("/get-all", function (req, res) {

  // returns only email, profile name, and _id
  let include = {
    "_id": 1,
    "email": 1,
    "name": 1
  }

  User.find({
      _id: {
        $ne: req.user.id
      }
    }, include)
    .exec(function (error, minUsers) {
      if (!error) return res.json(minUsers);
      else return res.status("500").send("Unable to perform find");
    })

});


/**
 * @swagger
 * path:
 *  /api/user:
 *    post:
 *      summary: Create a new user. Returns existing user of same name if found.
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      responses:
 *        "200":
 *          description: Stored user entry.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 */
router.post('/', async (req, res) => {
  const u = parseUser(req.body);
  if (!u.email) {
    return res.status(403).send();
  }
  let user = await User.findOne({ email: String(u.email).toLowerCase() });
  if (user) {
    if (user.location === "N/A" && u.location){
      user.location = u.location;
      user = await user.save();
    }
    return res.json(user);
  }

  user = new User({
    name: u.name,
    email: u.email,
    location: u.location,
    picture: u.picture
  });
  user = await user.save();


  var status = new Status({
    status: 0,
    user: user
  });

  status.save(async function (err, savedStatus) {
    if (err) return res.status(500).send(err);

    // return res.json(savedStatus);
    return res.json(user);
  });

});


router.get('/test', function(req, res) {
  console.log('Test user route');
  return res.send('Test user route');
});

/**
 * @swagger
 * path:
 *  /api/user/delete:
 *    post:
 *      summary: Delete a user by email address.
 *      tags: [Status]
 *      parameters:
 *        - in: body
 *          name: email
 *          description: User's email
 *          schema:
 *            type: string
 *      produces:
 *       - application/string
 *      responses:
 *        200:
 *          description: User deleted successfully.
 *        500:
 *          description: Server error.
 */
router.post("/delete", function(req, res) {

  User.deleteOne({
    "email": req.body.email.toLowerCase()
  })
  .exec(function(err, user) {
    if (err) {
      return res.status(500).send();
    }
    return res.send("User deleted successfully");
  });
});

module.exports = router;
