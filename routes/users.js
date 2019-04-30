var express = require('express');
var router = express.Router();
var User = require('../models/user'); // Model import where "user.js" is a mongoose Model
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var dateTime = require('node-datetime');
var User = require('../models/user');
var CoinDetails = require('../models/coinDetails');
// ............
global.fetch = require('node-fetch');
const cc = require('cryptocompare');
var pass = "smmh3749";
var nodemailer = require("nodemailer");
/*
    Here we are configuring our SMTP Server details.
    STMP is mail server which is responsible for sending and recieving email.
*/
var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    secure: false,
    port: 25,
    auth: {
        user: "mozzie8ai@gmail.com",
        pass: pass
    },
    tls: {
      rejectUnauthorized: false
    }
});
var rand, mailOptions, host, link, global_email;
/*------------------SMTP Over-----------------------------*/

var coins = ['BTC', 'ETH', 'XRP', 'BCH',
'EOS', 'LTC', 'ADA', 'XLM', 'MIOTA', 'TRX', 'NEO', 'USDT', 'XMR', 'DASH', 'XEM', 'VEN', 'ETC', 'BNB', 'QTUM', 'BCN', 'OMG', 'ZEC', 'ICX', 'LSK', 'ONT', 'ZIL', 'AE', 'BTG', 'DCR', 'ZRX', 'BTM', 'STEEM', 'XVG', 'NANO',
'BTS', 'SC', 'PPT', 'RHOC', 'WAN', 'MKR', 'BTCP', 'GNT', 'BCD', 'STRAT', 'REP', 'WAVES', 'DOGE', 'XIN', 'WICC', 'IOST'
];

router.get('/aboutUs', function(req, res, next){
  res.render('AboutPage');
});

router.get('/chartshow/:name', ensureAuthenticated, function(req, res){
// router.get('/chartshow/:name', function(req, res){
  var coin_name = req.params.name;
  var file_name = coin_name + '.json';
  res.render('KabjabChartForProject', {FILE_NAME: file_name, NAME: coin_name})
});

// Register
router.get('/register', function(req, res){
    res.render('register');
});

// HomePage
router.get('/home', function (req, res) {
    var username = "";
    if(req.session.username){
      console.log("user is logged in ..");
      username = req.session.username;
    }

  cc.priceFull(coins, ['USD', 'EUR'])
  .then(prices => {

    cc.coinList()
    .then(coinList => {

    var keyNames = Object.keys(prices);
    var price_store = [];
    var coinnames = [];

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');

  for (var i=0; i<keyNames.length; i++){
    var val = keyNames[i];
    try {
        // console.log(coinList.Data[val]['FullName']);
        // price_store.push(prices[val]['USD']['PRICE'];);

        price_value = prices[val]['USD']['PRICE'];
        price_value += '';

        var y;

        y = price_value.split('.');

        var y1,y2;

        y1 = y[0];
        y2 = y.length > 1 ? '.' + y[1] : '';

        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(y1)) {
         y1 = y1.replace(rgx, '$1' + ',' + '$2');
        }

        price_value = y1 + y2;
        price_store.push(price_value);
        coinnames.push(coinList.Data[val]['FullName']);
      }
      catch(err) {
          // console.log(val);
          coinnames.push(val);
      }
      var newcoindetails = new CoinDetails({
          coinname: val,
          price: price_value,
          datetime: formatted
      });
      CoinDetails.createCoinDetails(newcoindetails, function(err, user){  // etai user Model er "module.exports.createUser" line er code ta , jeta baire theke access korte parci ..
          if(err) throw err;
          // console.log(user);
      });

  }
    // console.log('price_store ------------------> ');
    // console.log(price_store);
      res.render('index', {username: username, coinlist: keyNames, prices: prices, coinnames: coinnames});
    })
    .catch(console.error);

  }).catch(console.error);

});

function ensureAuthenticated(req, res, next){
    req.flash('user',req.session.user);
    if(req.isAuthenticated()){
      next();
    }else{
        req.flash('error_msg', 'You are not logged in!!');
        res.redirect('/users/login');
    }
}

// Login
router.get('/login', function(req, res, next){
    req.flash('error_msg', '');
    res.render('login');
});

router.get('/verify/:id', function(req,res){
  console.log("check the global_email:");
  console.log(global_email);
  if(req.params.id == rand){
    User.updateOne({email: global_email}, {$set:{"approved": true}}, function(er, result){
      if(err) throw err;
      else{
        req.flash('success_msg', "Email is verified!!");
        console.log("verified the email");
      }
    });
  }
  res.redirect('/users/login');
});

// Register User
router.post('/register', function(req, res){
    var name = req.body.name;
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var password2 = req.body.password2;
    host = req.get('host');
    console.log(host);
    // Validation    "req.checkBody(name, msg).fun()""
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match!!').equals(req.body.password);

    ERRORS="";
    var errors = req.validationErrors();
    if(errors){
        console.log('error occurs');
        res.render('register', {error_msg: 'Empty field is not required!'});
    }else {
      console.log('enter');

      User.find({
        email: email  // ############## EMAIL unique rakhci ..
      },function(err, results) {
          if (err) return console.error(err);
          console.log(results);
          if (results.length > 0) {
            req.flash('error_msg', 'Email is not unique, try with another one!');
            res.redirect('/users/register');
          }else{
            // To store data(or, create a new user)
              var newUser = new User({
                  name: name,
                  email: email,
                  username: username,
                  password: password,
                  approved: false
              });
              User.createUser(newUser, function(err, user){  // etai user Model er "module.exports.createUser" line er code ta , jeta baire theke access korte parci ..
                  if(err) throw err;
                  // console.log(user);
              });

              rand = Math.floor((Math.random() * 100) + 54);
              link = "http://"+host+"/users/verify/id="+rand;

              console.log(link);
              global_email = email;
              mailOptions={
                  from: '"MMH-MKBS"<mehadi541@gmail.com>',
                  to : email,
                  subject : "Please confirm your Email account",
                  html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
              }

              console.log(mailOptions);

              smtpTransport.sendMail(mailOptions, function(error, response){
               if(error){
                      console.log(error);
                  res.end("error");
               }else{
                      console.log("Message sent: " + response.message);
                  res.end("sent");
                   }
              });

              req.flash('success_msg', 'Email verification code is sent!!');
              res.redirect('/users/login');
              // console.log('PASSED');
          }
      });
    }
        // console.log("name: "+name + " username: "+username+" email "+email+" password "+password + " password2 "+password2);
});

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: false
  },
  function(username, password, done) {
      //   console.log("Ok ashtece ..");
      //   var query = {email: username};
      //   console.log(query);
      // User.findOne(query, function (err, user) {
      //       if (err) throw err;
      //       console.log(user);
      //       if(user.approved == false){
      //         return done(null, false, { message: 'Still you are not approved!!' });
      //       }
          User.getUserByEmail(username, function (err, user) {
              if (err) throw err;
              if (!user) {
                return done(null, false, { message: 'Unknown User' });
              }
              User.comparePassword(password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                  return done(null, user);
                } else {
                  return done(null, false, { message: 'Invalid password' });
                }
              });
          });
      // });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserByID(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local',{session: true, successFlash: 'Logged in!', successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);
  // passport.authenticate('local', {successRedirect: '/users/home', failureRedirect: '/users/login', failureFlash: true}),
  // function(req, res) {
  //   res.redirect('/users/home');
  // });

router.get('/logout', function(req, res){
    req.logout();
    req.flash('success_msg', 'Successfully logged out!!');
    res.redirect('/users/login');
});

module.exports = router;
