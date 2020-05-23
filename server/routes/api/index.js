const router = require('express').Router();

const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const User = require('../../models/User');


const AUTH0_JWKS_URI = process.env.AUTH0_JWKS_URI;
const AUTH0_TOKEN_ISSUER = process.env.AUTH0_TOKEN_ISSUER;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;


const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: AUTH0_JWKS_URI
  }),
  audience: AUTH0_CLIENT_ID,
  issuer: AUTH0_TOKEN_ISSUER,
  algorithms: ["RS256"]
});


const errHandler = async function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    return res.status(403).json({
      success: false,
      message: err.message || 'Failed to authenticate token.'
    });
  }
  next();
};



const addUserToReq = async function(req, res, next) {
  let userEmail = req.headers.email;
  let user = await User.findOne({email: userEmail});
  if (user) {
    req.user = user;
  }
  next();
}




// public routes
router.get('/test', function(req, res) {
  return res.send('Test route');
});


// protected routes
router.use('/user', [checkJwt, errHandler, addUserToReq], require('./user'));
router.use('/admin', [checkJwt, errHandler, addUserToReq], require('./admin'));
router.use('/encounters', [checkJwt, errHandler, addUserToReq], require('./encounters'));
router.use('/status', [checkJwt, errHandler, addUserToReq], require('./status'));




module.exports = router;
