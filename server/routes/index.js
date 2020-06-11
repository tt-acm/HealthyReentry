const router = require('express').Router();


const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const AUTH_SCOPE = process.env.AUTH_SCOPE;
const DEFAULT_AUTH_CONN = (process.env.DEFAULT_AUTH_CONN)
                        ? {connection: process.env.DEFAULT_AUTH_CONN} : {};


router.get('/api/auth0-config', function(req, res) {
  const creds = {
    AUTH0_DOMAIN: AUTH0_DOMAIN,
    AUTH0_CLIENT_ID: AUTH0_CLIENT_ID,
    DEFAULT_AUTH_CONN: DEFAULT_AUTH_CONN,
    AUTH_SCOPE: AUTH_SCOPE
  };
  res.json(creds);
});


router.use("/api", require('./api'));


module.exports = router;