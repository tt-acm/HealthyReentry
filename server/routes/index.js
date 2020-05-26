const router = require('express').Router();


const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;



//HTTPS redirect middleware
function ensureSecure(req, res, next) {
  //Heroku stores the origin protocol in a header variable. The app itself is isolated within the dyno and all request objects have an HTTP protocol.
  if (req.get('X-Forwarded-Proto') == 'https' || req.hostname == 'localhost') {
    //Serve Vue App by passing control to the next middleware
    next();
  } else if (req.get('X-Forwarded-Proto') != 'https' && req.get('X-Forwarded-Port') != '443') {
    //Redirect if not HTTP with original request URL
    res.redirect('https://' + req.hostname + req.url);
  }
}
//attach middleware to app
router.all('*', ensureSecure);


// these aren't really secrets
router.get('/api/auth0-secrets', function(req, res) {
  const creds = {
    AUTH0_DOMAIN: AUTH0_DOMAIN,
    AUTH0_CLIENT_ID: AUTH0_CLIENT_ID
  };
  res.json(creds);
});


router.use("/api", require('./api'));


module.exports = router;