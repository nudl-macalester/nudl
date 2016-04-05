var Mealshare = require('../models/mealshare');
var User = require('../models/user');
var Emailer = require('../mail');
var EmailScheduler = require('../mailScheduler');

var exports = module.exports = {};

exports.createMealshare = function(user, name, description, maxCap, dateTime, price, cb) {
    if (dateTime < new Date()) {
    	return cb("cannot create a mealshare before current time");
    } else if (maxCap < 1) {
    	return cb("cannot create mealshare with fewer than one guest");
    }

    Mealshare.create(user, name, description, maxCap, dateTime, price, function(err, mealshare) {
    	if (err) {
    		return cb(err);
    	}
    	user.created_mealshares.push(mealshare);
    	user.save();

    	var fEMS = new FrontEndMealshare(mealshare);
    	Emailer.sendMealshareCreate(mealshare, user);

        EmailScheduler.scheduleGuestReminder(mealshare);

    	cb(null, fEMS);
    });
}

exports.getMealshare = function(mealshareId, cb) {
    Mealshare.getMealshare(mealshareId, function(err, mealshare) {
    	if (err) {
    		console.log(err);
    		return cb(err);
    	} else if (!mealshare) {
    		return cb("could not find mealshare with id: " + mealshareId);
    	}
    	cb(null, mealshare);
    });
}

exports.updateMealshare = function(user, mealshare, name, description, maxCap, date, time, price, message, cb) {
	if (!mealshare.userIsCreator(user)) {
		console.log("user not creator, cannot edit mealshare");
		return cb("this user cannot edit mealshare");
	} else if (!mealshare.userIsCreator(user) && !user.isAdmin()) {
		console.log("user neither creator nor admin, cannot edit mealshare");
		return cb("this user cannot edit mealshare");
	}

	var dateTime= new Date(date + "/16 " + time + " GMT-0500");
    if (dateTime == "Invalid Date") {
    	return cb("Invalid Date");
    }

    if (dateTime.getHours() <= 12) {
        dateTime.setHours(dateTime.getHours() + 12);
    }

    if (maxCap - mealshare.guests.length < 0) {
    	return cb("not enough capacity for existing guests");
    }

	mealshare.update(name, description, maxCap, dateTime, price, function(err, ms) {
		if (err) {
			console.log(err);
			return cb(err);
		}
		if (ms.guests.length > 0 && message !== "") {
			Emailer.sendMealshareUpdate(ms, message);
		}
		var fEMS = new FrontEndMealshare(ms);
		cb(null, fEMS);
	});
}

exports.addGuestToMealshare = function(mealshare, user, cb) {
	mealshare.addGuest(user, function(err, ms) {
		if (err) {
			console.log(err);
			return cb(err);
		}
		var fEMS = new FrontEndMealshare(ms);
		fEMS.isGuest = true;
		Emailer.sendMealshareAttend(mealshare, user);

		cb(null, fEMS);
	});
}

exports.removeGuestFromMealshare = function(mealshare, user, cb) {
	mealshare.removeGuest(user, function(err, ms) {
		if (err) {
			console.log(err);
			return cb(err);
		}
		var fEMS = new FrontEndMealshare(ms);
		cb(null, fEMS);
	});
}

exports.addHostToMealshare = function(mealshare, user, cb) {
	mealshare.addHost(req.user, function(err, ms) {
		if (err) {
			console.log(err);
			return cb(err);
		}
		var fEMS = new FrontEndMealshare(ms);
		fEMS.isHost = true;
		cb(null, fEMS); 
	});
}

exports.removeHostFromMealshare = function(mealshare, user, cb) {
	mealshare.removeHost(user, function(err, ms) {
		if (err) {
			console.log(err);
			return cb(err);
		}
		var fEMS = new FrontEndMealshare(ms);
		cb(null, fEMS);
	});
}

// we don't want to give all users access to all fields, and we don't want userids in the lists, so we filter a little for the specific user
// gets mealshares that are upcoming and on-going (considered within an hour)
exports.getFrontEndMealsharesForUser = function(user, cb) {
	Mealshare.getUpcoming(function(err, mealshares) {
		if (err) {
			console.log(err);
			return cb(err);
		}
		var fEMS = generateFrontEndMealsharesForUser(mealshares, user);

        cb(null, fEMS);
	});
}

exports.deleteMealshare = function(mealshare, user, cb) {
	if (!mealshare.userIsCreator(user)) {
		console.log("this user is not creator, and can't delete mealshare");
		return cb("this user cannot delete mealshare");
	} else if (!mealshare.userIsCreator(user) && !user.isAdmin()) {
		console.log("this user is neither creator nor admin, and can't delete mealshare");
		return cb("this user cannot delete mealshare");
	}

	mealshare.remove(function(err) {
		mealshare.creator.removeCreatedMealshare(mealshare, function(err) {
			if (err) {
				console.log(err);
				return cb(err);
			}

            EmailScheduler.deleteScheduledGuestReminder(mealshare);

			// todo: email guests
			cb(null, mealshare._id);
		});
	});
}

generateFrontEndMealsharesForUser = function(mealshares, user) {
	var frontEndMealshares = [];

	for (var i = 0; i < mealshares.length; i++) { // use mapping
        var mealshare = mealshares[i];
        var fEMS = new FrontEndMealshare(mealshare);

        // public stuff
        for (var j = 0; j < mealshare.hosts.length; j++) {
        	var hostName = mealshare.hosts[j].name;
        	fEMS.hosts.push(hostName);
        }

        fEMS.index = i;

        // creator and guest should see the full guest list
        if (mealshare.userIsCreator(user)) {
        	fEMS.isCreator = true;
        	fEMS.isHost = true;
        	fEMS.maxCapacity = mealshare.max_guests;
        	fEMS.spotsLeft = mealshare.spots_left;

        	for (var j = 0; j < mealshare.guests.length; j++) {
        		var guestName = mealshare.guests[j].name;
        		fEMS.guests.push(guestName);
        	}
        }
        else if (mealshare.userIsGuest(user) != -1) {
        	fEMS.isGuest = true;
        	for (var j = 0; j < mealshare.guests.length; j++) {
        		var guestName = mealshare.guests[j].name;
        		fEMS.guests.push(guestName);
        	}
        }
        else if (mealshare.userIsHost(user) != -1) {
            fEMS.isHost = true;
        }
        frontEndMealshares.push(fEMS);
    }

    return frontEndMealshares;
}

// Frontend Mealshare object for user visibility

function FrontEndMealshare(ms) {
	this.id = ms._id;
    this.name = ms.name;
    this.description = ms.description;
    this.creator = ms.creator.name;
    this.time = ms.time;
    this.location; //not implemented yet
    this.guests = [];
    this.hosts = [];
    this.maxCapacity;
    this.spotsLeft;
    this.isFull = ms.spots_left == 0;
    this.fewSpotsLeft = ms.spots_left <= 3 && ms.spots_left > 0;
    this.price = ms.price;
    this.happeningNow = ms.time <= Date.now();

    this.index;

    this.isCreator = false;
    this.isHost = false;
    this.isGuest = false;
}


// we have to set up reminders when the server restarts, since the scheduled jobs get deleted 

(function() {
    Mealshare.getUpcoming(function(err, mealshares) {
        mealshares.forEach(function(mealshare) {
            EmailScheduler.scheduleGuestReminder(mealshare);
        });
    });
})();

