const router = require('express').Router();

const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const swaggerAPIDocSetup = require('../../configs/apidoc');

const User = require('../../models/User');


const errHandler = async function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    return res.status(403).json({
      success: false,
      message: err.message || 'Failed to authenticate token.'
    });
  }
  next();
};

// public routes
router.get('/test', function(req, res) {
  return res.send('Test route');
});

router.get('/session', function(req, res) {
  if (req.user) {
    res.send({
      // user: req.user.sanitize()
      user: req.user
    });
  } else {
    res.status(401).send('No authenticated user.');
  }
});


// protected routes
router.use('/user', [errHandler], require('./user'));
router.use('/admin', [errHandler], require('./admin'));
router.use('/encounters', [errHandler], require('./encounters'));
router.use('/status', [errHandler], require('./status'));




swaggerAPIDocSetup.setup(router);




module.exports = router;
