'use strict';

var passport = require("passport");
var jwt = require("jsonwebtoken");
var needle = require("needle");

// Serialize and deserialize are required functions for passport module to function
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  var User = require("mongoose").model("User");

  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.custom = passport.custom || {};

passport.custom.checkSsoToken = function(token) {

  return new Promise(function(resolve, reject) {
    var verified = jwt.verify(token, process.env.CORE_SSO_JWT_SECRET);

    if (verified.id) {
      needle.post(process.env.CORE_SSO_URL + "/api/users/authenticate/token/", {
          applicationPassword: process.env.CORE_SSO_API_SECRET,
          token: token
        },
        function(err, response) {
          if (!err && response.body && response.body.success) resolve(response.body.user);
          else reject(err);
        });
    } else {
      reject("Invalid token received.");
    }

  });
};

module.exports = passport;
