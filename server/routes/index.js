const router = require('express').Router();
var passport = require('../configs/passport');
var qs = require("querystring");
const User = require('../models/User');
const Status = require('../models/Status');

/**
 * @api {get} users/login User Login
 * @apiName User Login
 * @apiDescription Log in a user
 * @apiGroup attachDefault
 */
router.get("/login", function(req, res, next) {
  // console.log("CALLING LOGIN", req.query, req.body, req.params);
  // middleware in the use case that an app is only open to TT users
  // if (!process.env.CORE_SSO_TT_ONLY) return next();
  // if (req.user && !req.user.sso.idTT) {
  //   // log out the user locally if they are not TT
  //   req.logout();
  //   req.session.save(() => {
  //     next();
  //   });
  // } else {
  //   next();
  // }
  next();
}, function(req, res) {
  var returnTo = req.session.returnTo;
  var redirectPath = process.env.LOCAL_BUILD? process.env.VUE_APP_LOCALFRONTEND_URL : "https://" + req.headers.host;

  function finish() {
    return res.redirect(returnTo || redirectPath);
  }

  function logout(rejectErr) {
    if (req.user) req.logout();
    reject(rejectErr || "User not a match. Logged out.");
  }

  function login(user) {
    req.logIn(user, function(err) {
      console.log("errs", err);
      if (err) logout();
      finish();
    });
  }

  // if already logged in, go from whence we came
  if (req.user && !req.query.token) {
    // login(req.user);
    // return res.redirect("back");
    return res.redirect('/menu');
  }
  // if valid token or other authentication, log in here
  if (req.query.token) {
    passport.custom.checkSsoToken(req.query.token).then(async function(ssoUser) {
      console.log("returnTo", returnTo);
      if (!ssoUser.email) {
        return logout();
      }
      //find logged in users
      let user = await User.findOne({
        email: String(ssoUser.email).toLowerCase()
      });

      if (user) {
        if (user.location === "N/A" && ssoUser.profile.location) { //TODO check schema and fields
          user.location = ssoUser.profile.location;
          user = await user.save();
        }
        login(user);
      } else {
        user = new User({
          name: ssoUser.profile.name,
          email: ssoUser.email,
          location: ssoUser.profile.location,
          picture: ssoUser.profile.picture
        });
        user = await user.save();

        var status = new Status({
          status: 0,
          user: user
        });

        status.save(async function(err, savedStatus) {
          if (err) return res.status(500).send(err);
          login(user);
        });
      }



    }).catch(function(err) {
      req.flash("errors", err);
      res.status("403");
      // return res.redirect("back");
    });
  } else {
    // console.log("empty req", req.query.returnTo, req.originalUrl);
    if (req.query.returnTo) {
      // set returnTo and redirect to login internal
      req.session.returnTo = req.query.returnTo;
      return res.redirect(req.originalUrl.split("?")[0]);
    } else {
      // redirect to login external
      var returnPath = qs.escape("https://" + req.headers.host + req.originalUrl);
      // console.log("returnPath", returnPath);
      var redirectPath = process.env.CORE_SSO_URL + "/user/authenticate/" + returnPath;
      if (process.env.CORE_SSO_TT_ONLY) redirectPath += "?tt-only=true";
      return res.redirect(redirectPath);
    }
  }
});
/**
 * @api {get} users/logout User Logout
 * @apiName User Logout
 * @apiDescription Logs a user out both from this session and the SSO
 * @apiGroup attachDefault
 */
router.get("/logout", function(req, res) {
  // console.log("req.headers.host", req.headers.host);
  var redirectPath = process.env.LOCAL_BUILD? process.env.VUE_APP_LOCALFRONTEND_URL : "https://" + req.headers.host;
  var returnPath = qs.escape(redirectPath);
  req.logout();
  res.redirect(process.env.CORE_SSO_URL + "/user/logout/" + returnPath);
});

router.use("/api", require('./api'));


module.exports = router;
