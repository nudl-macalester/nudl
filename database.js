// DB w/mongoose setup
var path = require('path');
var mongoose = require('mongoose');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

mongoose.connect('mongodb://localhost:27017/NUDL', function(err, db) {
	if (err) console.log("Failed to connect to mongodb: " + err)
	else {
		console.log("Connected to db")
	}
});

var User = require('./models/user');
var Mealshare = require('./models/mealshare');

module.exports = {
    User: User,
    Mealshare: Mealshare,
    db: db
};
