// DB w/mongoose setup
var path = require('path');
var mongoose = require('mongoose');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

mongoose.connect('mongodb://@localhost:27017/NUDL');

var user = require('./models/user');
var mealshare = require('./models/mealshare');

module.exports = {
    User: user.User,
    Verif: user.Verif,
    Mealshare: mealshare.Mealshare,
    db: db
};
