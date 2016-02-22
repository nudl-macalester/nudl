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
    spots_left: Number,

    //scheduled job names -- emails
});

// INSTANCE METHODS

mealshareSchema.methods.userIsCreator = function(user) {
	return this.creator._id.toString() == user._id.toString();
}

mealshareSchema.methods.userIsGuest = function(user) {
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

mealshareSchema.methods.userIsHost = function(user) {
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
		return cb("user is already guest");
	} else if (self.userIsHost(user) != -1) {
		return cb("user is already host");
	} else if (self.spots_left == 0) {
		return cb("mealshare is full");
	}
	self.guests.push(user);
	self.spots_left--;
	self.save(function(err) {
		cb(err, self);
	});
}

mealshareSchema.methods.addHost = function(user, cb) {
	var self = this;
	if (self.userIsHost(user) != -1) {
		return cb("user is already host");
	} else if (self.userIsGuest(user) != -1) {
		return cb("user is already guest");
	}
	self.hosts.push(user);
	self.save(function(err) {
		cb(err, self);
	});
}

mealshareSchema.methods.removeGuest = function(user, cb) {
	var self = this;
	var guestIndex = self.userIsGuest(user);
	if (guestIndex == -1) {
		return cb("user is not guest");
	}
	self.guests.splice(guestIndex, 1);
	self.spots_left++;
	self.save(function(err) {
		cb(err, self);
	});
}

mealshareSchema.methods.removeHost = function(user, cb) {
	var self = this;
	var hostIndex = self.userIsHost(user);
	if (hostIndex == -1) {
		return cb("user is not host");
	}
	self.hosts.splice(hostIndex, 1);
	self.save(function(err) {
		cb(err, self);
	});
}

mealshareSchema.methods.update = function(name, description, maxCap, dateTime, price, cb) {
	var self = this;
	self.name = name;
	self.description = description;
	self.max_guests = maxCap;
	self.spots_left = maxCap - self.guests.length;
	self.time = dateTime;
	self.price = price;

	self.save(function(err) {
		cb(err, self);
	});
}

// STATIC METHODS

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
    // nMS.hosts = req.body.hosts; // creators can't yet add hosts and guests at create
    // nMS.guests = req.body.guests;
    
    nMS.save(function(err) {
    	return cb(err, nMS);
    });
}

mealshareSchema.statics.getMealsharesCreatedByUser = function(user, cb) {
	Mealshare.find({ creator: user }).sort('time').populate('creator hosts guests').exec(function(err, mealshares) {
		return cb(err, mealshares);
	});
}

mealshareSchema.statics.getUpcoming = function(cb) {
	var oneHourAgo = new Date();
	oneHourAgo.setHours(oneHourAgo.getHours() - 1);

	Mealshare.find({time: { $gt: oneHourAgo } }).sort('time').populate('creator hosts guests').exec(function(err, mealshares) {
		return cb(err, mealshares);
	});
}

mealshareSchema.statics.getAllMealshares = function(cb) {
	Mealshare.find({}).sort('time').populate('creator hosts guests').exec(function(err, mealshares) {
        return cb(err, mealshares);
	});
}

mealshareSchema.statics.getMealshare = function(id, cb) {
    Mealshare.findById(id).populate('creator hosts guests').exec(function(err, mealshare) {
		return cb(err, mealshare);
	});
}

Mealshare = mongoose.model('Mealshare', mealshareSchema);

module.exports = Mealshare;