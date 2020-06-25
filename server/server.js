require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
var passport = require('./configs/passport');
const path = require('path');
const fs = require('fs');
const https = require('https');

const DIR = 'dist';
const PORT = process.env.PORT || 8080;

const mongoURI = process.env.MONGO_URL;
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

const app = express();



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
app.use('*', ensureSecure);



app.use(express.static(DIR));

app.use(cookieParser());

app.use(session({
        secret: process.env.SESSION_SECRET,
        store:  new MongoDBStore({
          uri: mongoURI,
          collection: 'sessions',
        }),
        resave: true,
        saveUninitialized: true
    }));

// Initialize passport and also allow it to read
// the request session information.
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json({
  limit: '500mb'
}));

app.use(bodyParser.urlencoded({
  limit: '500mb',
  extended: true
}));

app.use("/", require('./routes'));

const base = path.join(__dirname, '../');
const indexFilePath = path.join(base, '/dist/index.html');
app.use('/*', (req, res) => res.sendFile(indexFilePath));

if(process.env.NODE_ENV === "development") {

  https.createServer({
    key: fs.readFileSync('./testingCertificates/ttlocalcert.key'),
    cert: fs.readFileSync('./testingCertificates/ttlocalcert.crt'),
    ca: fs.readFileSync('./testingCertificates/ttlocalcert.crt')
  }, app).listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  });
  
} else {
  
  app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  });
  
}