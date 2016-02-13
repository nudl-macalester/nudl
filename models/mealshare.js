var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Mealshare;

var mealshareSchema = new Schema({
    name: String,
    description: String,
    price: Number,
    creator: {type: Schema.Types.ObjectId, ref:'User'},
    hosts: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    guests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    time: Date,
    max_guests: Number,
    spots_left: Number
});

// INSTANCE METHODS

mealshareSchema.methods.userIsGuest = function (user) {
	var userId = user._id.toString();
	for (var i = 0; i < this.guests.length; i++) {
		var guest = this.guests[i];
		if (guest._id && guest._id.toString() == userId) {
			return i;
		} else if (guest.toString() == userId) {
			return i;
		}
	}
	return -1;
}

mealshareSchema.methods.userIsHost = function (user) {
	var userId = user._id.toString();
	for (var i = 0; i < this.hosts.length; i++) {
		var host = this.hosts[i];
		if (host._id && host._id.toString() == userId) {
			return i;
		} else if (host.toString() == userId) {
			return i;
		}
	}
	return -1;
}

mealshareSchema.methods.addGuest = function(user, cb) {
	var self = this;
	if (self.userIsGuest(user) != -1) {
		cb("user is already guest");
		return;
	} else if (self.spots_left == 0) {
		cb("mealshare is full");
		return;
	}
	self.guests.push(user);
	self.spots_left--;
	self.save(function(err) {
		if (err) {
			cb(err);
		}
		var fEMS = new frontEndMealshare(self);
		fEMS.isGuest = true;
		cb(null, fEMS);
	});
}

mealshareSchema.methods.addHost = function(user, cb) {
	var self = this;
	if (self.userIsHost(user) != -1) {
		cb("user is already host");
		return;
	}
	self.hosts.push(user);
	self.save(function(err) {
		if (err) {
			cb(err);
		}
		var fEMS = new frontEndMealshare(self);
		fEMS.isHost = true;
		cb(null, fEMS);
	});
}

mealshareSchema.methods.removeGuest = function(user, cb) {
	var self = this;
	var guestIndex = self.userIsGuest(user);
	if (guestIndex == -1) {
		cb("user is not guest");
		return;
	}
	self.guests.splice(guestIndex, 1);
	self.spots_left++;
	self.save(function(err) {
		if (err) {
			cb(err);
		}
		var fEMS = new frontEndMealshare(self);
		cb(null, fEMS);
	});
}

mealshareSchema.methods.removeHost = function(user, cb) {
	var self = this;
	var hostIndex = self.userIsHost(user);
	if (hostIndex == -1) {
		cb("user is not host");
		return;
	}
	self.hosts.splice(hostIndex, 1);
	self.save(function(err) {
		if (err) {
			cb(err);
		}
		var fEMS = new frontEndMealshare(self);
		cb(null, fEMS);
	});
}

mealshareSchema.methods.delete = function(user, cb) {
	var self = this;
	if (self.creator._id.toString() == user._id.toString() || user.isAdmin()) {
		self.remove(function(err) {
			cb(err, self._id);
		});
	} 
}

// STATIC METHODS

// Frontend Mealshare object

function frontEndMealshare(ms) {
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

mealshareSchema.statics.create = function(user, name, description, maxCap, dateTime, price, cb) {
	var nMS = new Mealshare();

    nMS.creator = user;
    nMS.name = name;
    nMS.description = description;
    nMS.hosts.push(user);
    nMS.max_guests = maxCap;
    nMS.spots_left = maxCap;
    nMS.time = dateTime;
    nMS.price = price;
    // nMS.hosts = req.body.hosts;
    // nMS.guests = req.body.guests;

    if (dateTime < new Date()) {
    	return cb("cannot create a mealshare before current time");
    }
    
    nMS.save(function(err) {
        if (err) {
        	cb(err);
        	return;
        }
        user.created_mealshares.push(nMS._id);
        user.save();

        var fEMS = new frontEndMealshare(nMS);
        fEMS.isCreator = true;

        cb(null, fEMS);
    });
}

generateFrontEndMealsharesForUser = function(mealshares, user) {
	var frontEndMealshares = [];

	for (var i = 0; i < mealshares.length; i++) {
        var mealshare = mealshares[i];
        var fEMS = new frontEndMealshare(mealshare);

        // public stuff
        for (var j = 0; j < mealshare.hosts.length; j++) {
        	var hostName = mealshare.hosts[j].name;
        	fEMS.hosts.push(hostName);
        }

        fEMS.index = i;

        // creator and guest should see the full guest list
        if (mealshare.creator._id.toString() == user._id.toString()) {
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
        else if (mealshare.userIsHost(user) != -1) { // hosts also see nothing for now
            fEMS.isHost = true;
        }
        frontEndMealshares.push(fEMS);
    }

    return frontEndMealshares;
}

// we don't want to give all users access to all fields, and we don't want userids in the lists, so we filter a little for the specific user
// gets mealshares that are upcoming and on-going (considered within an hour)
mealshareSchema.statics.getFrontEndMealsharesForUser = function(user, cb) {
	var oneHourAgo = new Date();
	oneHourAgo.setHours(oneHourAgo.getHours() - 1);
	Mealshare.find({time: { $gt: oneHourAgo } }).sort('time').populate('creator hosts guests').exec(function(err, mealshares) {
		if (err) {
			return cb(err);
		}
		var frontEndMealshares = generateFrontEndMealsharesForUser(mealshares, user);

        cb(null, frontEndMealshares);

	});
}

mealshareSchema.statics.getMealsharesCreatedByUser = function(user, cb) {
	Mealshare.find({time: {$gt: Date.now() }, creator: user}).sort('time').populate('creator hosts guests').exec(function(err, mealshares) {
		if (err) {
			return cb(err);
		}
		var frontEndMealshares = generateFrontEndMealsharesForUser(mealshares, user);
		cb(null, frontEndMealshares);
	});
}

mealshareSchema.statics.getUpcomingMealshares = function(user, cb) {
	Mealshare.find({time: { $gt: Date.now() } }).sort('time').populate('creator hosts guests').exec(function(err, mealshares) {
		if (err) {
			return cb(err);
		}
		var frontEndMealshares = generateFrontEndMealsharesForUser(mealshares, user);

        cb(null, frontEndMealshares);
	});
}

mealshareSchema.statics.getAllMealshares = function(cb) {
	Mealshare.find({}).sort('time').populate('creator hosts guests').exec(function(err, mealshares) {
		if (err) {
			return cb(err);
		}

        cb(null, mealshares);
	});
}

Mealshare = mongoose.model('Mealshare', mealshareSchema);

module.exports = {
    Mealshare: Mealshare
};