var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Mealshare;

var mealshareSchema = new Schema({
    name: String,
    description: String,
    creator: {type: Schema.Types.ObjectId, ref:'User'},
    hosts: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    guests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    time: Date,
    max_guests: Number
});

// INSTANCE METHODS

// mealshareSchema.methods.addGuest(userId, cb) {
// 	this.
// }

mealshareSchema.methods.userIsGuest = function (user) {
	var userId = user._id.toString();
	for (var i = 0; i < this.guests.length; i++) {
		if (this.guests[i]._id.toString() == userId) {
			return true;
		}
	}
	return false;
}

mealshareSchema.methods.userIsHost = function (user) {
	var userId = user._id.toString();
	for (var i = 0; i < this.hosts.length; i++) {
		if (this.hosts[i]._id.toString() == userId) {
			return true;
		}
	}
	return false;
}

// STATIC METHODS

// Frontend Mealshare object

function frontEndMealshare() {
	this.id;
    this.name;
    this.description;
    this.creator;
    this.time;
    this.location; //not implemented yet
    this.guests = [];
    this.hosts = [];
    this.maxCapacity;
    this.fewSpotsLeft = false;

    this.isCreator = false;
    this.isHost = false;
    this.isGuest = false;
}

// we don't want to give all users access to all fields, and we don't want userids in the lists, so we filter a little for the specific user
mealshareSchema.statics.getFrontEndMealsharesForUser = function(user, cb) {
	Mealshare.find({}).sort('time').populate('creator hosts guests').exec(function(err, mealshares) {
		if (err) {
			return cb(err);
		}
		var frontEndMealshares = [];

		for (var i = 0; i < mealshares.length; i++) {
            var mealshare = mealshares[i];
            var fEMS = new frontEndMealshare();

            // these five are public
            fEMS.id = mealshare._id;
            fEMS.name = mealshare.name;
            fEMS.description = mealshare.description;
            fEMS.creator = mealshare.creator.name;
            fEMS.time = mealshare.time;

            for (var j = 0; j < mealshare.hosts.length; j++) {
            	var hostName = mealshare.hosts[j].name;
            	fEMS.hosts.push(hostName);
            }

            fEMS.fewSpotsLeft = mealshare.max_guests - mealshare.guests.length <= 3; // if there are fewer than three spots left we mark the mealshare

            // only the creator should see the full guest list
            if (mealshare.creator._id.toString() == user._id.toString()) {
            	fEMS.isCreator = true;
            	fEMS.isHost = true;
            	fEMS.maxCapacity = mealshare.max_guests;

            	for (var j = 0; j < mealshare.guests.length; j++) {
            		var guestName = mealshare.guests[j].name;
            		fEMS.guests.push(guestName);
            	}
            }
            else if (mealshare.userIsGuest(user)) { // guests see nothing for now
            	fEMS.isGuest = true;
            }
            else if (mealshare.userIsHost(user)) { // hosts also see nothing for now
                fEMS.isHost = true;
            }
            frontEndMealshares.push(fEMS);
        }

        cb(null, frontEndMealshares);

	});
}

Mealshare = mongoose.model('Mealshare', mealshareSchema);

module.exports = {
    Mealshare: Mealshare
};