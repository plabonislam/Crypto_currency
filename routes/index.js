var express = require('express');
var router = express.Router();

// Homepage
router.get('/', function(req, res){
    res.redirect('/users/home');
});

// router.get('/', ensureAuthenticated, function(req, res){
//     res.redirect('/users/home');
// });

function ensureAuthenticated(req, res, next){
    req.flash('user',req.session.user);
    if(req.isAuthenticated()){
      if(!req.flash('success_msg')){
        req.flash('success_msg', '');
      }
      else{
          req.flash('success_msg', 'You are logged in!!');
      }
        next();
    }else{
        req.flash('error_msg', 'You are not logged in!!');
        res.redirect('/users/login');
    }
}

module.exports = router;
