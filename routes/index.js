var express = require('express');
var router = express.Router();  
var db = require('../database/commondata');
/* GET home page. */
  router.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
  });
  
  router.route('/login').get(function(req, res) {
     res.render('login', { title: 'User loggin' });
  })
  .post(function(req, res) {
       
     var collection = db.get('users');
     collection.find({}, function(err, docs) {
        if (err)  throw err;
        for (var i = 0; i < docs.length; i++)
          if (docs[i].username == req.body.username && docs[i].password == req.body.password) {
              req.session.user = docs[i];
              //console.log(req.session.user);
              res.redirect('summary');
              return;
          }
        req.session.error = "illegal username or password";
        res.redirect('/login');
     });
    
  });
 
  router.get('/logout', function(req, res) {
  	 req.session.user = null;
     res.redirect('/login');
 });
 
  router.get('/summary', function(req, res) {
    
  	  authentication(req, res);
      var collection = db.get('events');
      collection.find({}, function(err,docs_event){
        if (err) throw err;
        var collec = db.get('users');
        collec.find({}, function(err, docs_user) {
          if (err)  throw err;
          res.render('summary', {title: 'Summary', 'events': docs_event, 'users': docs_user});
        });        
   });    
 });

  router.route('/register').get(function(req, res) {
      res.render('register', {title: 'Register'});
})
.post(function(req, res) {
      var collection = db.get('users');
      collection.insert({'username': req.body.username, 'password': req.body.password,
      'eventIds': [], 'balance': 0}, function(err) {
          if (err)  throw err;
      });
      res.redirect('/login');
});

  router.get('/userprofile', function(req, res) {
    var user = req.session.user;
    if (user == undefined || user == null)
      res.redirect('/login');
    var collection = db.get('events');
    var events = new Array();
    for (var i = 0; i < user.eventIds.length; i++)
      collection.findById(user.eventIds[i], function (err, docs) {
        if (err) {
          throw err;
          return;
        }
        events.push(docs);
        //very fucking simple aync to sync        
        if(events.length == user.eventIds.length) {
          var collec = db.get('users');
          collec.find({}, function(err, docs_user) {
              if (err) throw err;
              res.render('profile', {title: 'User profile', 'users': docs_user, 'events': events});
          })
          
        }
    });
   
});
  router.route('/create').get(function(req, res) {
    authentication(req, res);
    res.render('create', {title: 'Create Events'});
  })
  .post(function(req, res) {
      var collection = db.get('events');
      var memberlist = parse(req.body.members);
      console.log()
      var moneylist = parse(req.body.moneys);
      collection.find({'name': req.body.eventname}, function(err, docs) {
          if (err)  throw err;
          if (docs.length != 0) {
              
              req.session.error = "same shit already exists";
              res.redirect('/create');
          }
          else {

              collection.insert({'name': req.body.eventname, 'members': memberlist, 'moneys': moneylist}, 
              function(err, docs) {
                  if (err)  throw err;
              });
              collection.findOne({'name': req.body.eventname}, function(err, docs) {
                  if (err)  throw err;
                  var collection = db.get('users');
                  var id = docs._id;
                  for (var i = 0; i < memberlist.length; i++) {
                
                      collection.findOne({'username': memberlist[i]}, function(err, docs) {
                          if (err)  throw err;
                          if (docs['eventIds'] == undefined)
                              docs['eventIds'] = new Array();
                          docs['eventIds'].push(id);
                          collection.findAndModify({ _id: docs._id}, {$set: docs});  
                      });
                  }
                  res.redirect('/summary');
              });
            }
      });
  });

  function authentication(req, res) {
     if (!req.session.user) {
         return res.redirect('/login');
     }
 }
  function parse(str) {

      var list = new Array();
      var i = 0, prev = 0;
      while (i < str.length) {
          if (str.charAt(i) == ' ') {
              if (prev != i)
                list.push(str.substr(prev, i - prev));
              prev = i + 1;
            }
          i++;
      }
      if (i != prev)
          list.push(str.substr(prev, i - prev));

      return list;
  }
 module.exports = router;
