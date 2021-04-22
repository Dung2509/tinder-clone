var express = require('express');
var router = express.Router();
var fs = require('fs');
var dbconnet = 'mongodb+srv://ndd2509:250998Tn@cluster0.8ecca.mongodb.net/User?retryWrites=true&w=majority';

const mongoose = require('mongoose');
mongoose.connect(dbconnet, {useNewUrlParser: true, useUnifiedTopology: true});

const multer = require('multer');

const storage = multer.diskStorage({
  //destination for files
  destination: function (request, file, callback) {
    callback(null,'./public/uploads')
  },

  filename: function (request, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 1024 * 1024 * 3,
  },
});

router.use(express.static('uploads/'));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function () {
  console.log('connected')
});

var User = new mongoose.Schema({
  name: String,
  birthday: String,
  email: String,
  number_phone: String,
  introduce: String,
  // sex: String,
  // interests: Array,
  // image:String,
})

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');




});
router.get('/users', function (req, res, next) {
  var userConnect = db.model('User', User);

  userConnect.find({}, function (error, User) {
    var type = 'index';
    try {
      type = req.query.type;
    } catch (e) {
    }
    if (error) {
      res.render('app', {title: 'Express : ' + error});
      return
    }
    if (type == 'json') {
      res.send(User)
    } else {
      res.render('app', {title: 'Express', User: User});
    }

  })
});

router.post('/users',upload.single('image'),async function (req, res, next) {
  var userConnect = db.model('User', User);
  userConnect({
    name: req.body.name,
    birthday: req.body.birthday,
    email: req.body.email,
    number_phone: req.body.number_phone,
    introduce: req.body.introduce,
    gender: req.body.gender,
    // interests: req.body.interests,
    // image: req.file.filename,

  }).save(function (error) {
    if (error) {
      res.render('app')
    } else {
      res.render('app')
    }
  })
  var userConnectFind = db.model('User', User);
  userConnectFind.find().then(function (User) {
    res.render('app', {User: User})
  })
});

router.get('/getUsers', function (req, res, next) {
  var userConnectFind = db.model('User', User);
  userConnectFind.find().then(function (User) {
    res.render('app', {User: User})
  })
});


router.post('/deleteUsers/:id',function (req,res) {

  db.model('User',User).deleteOne({ _id: req.params.id}, function (err) {
    if (err) {
      console.log('Lỗi')
    }

    res.redirect('../getUsers');

  });
})

router.post('/update', function(req, res, next) {
  var id = req.body.id;
  var userConnect = db.model('User', User);

  userConnect.findById(id, function(err, User) {
    if (err) {
      console.error('error, no entry found');
    }

    User.name = req.body.name;
    User.birthday = req.body.birthday;
    User.email = req.body.email;
    User.number_phone = req.body.number_phone;
    User.introduce = req.body.introduce;
    // User.sex = req.body.sex;
    // User.interests = req.body.interests;

    User.save();
  })
  res.redirect('../getUsers');
});


module.exports = router;
