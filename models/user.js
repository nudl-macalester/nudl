var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Schema = mongoose.Schema;

var RANDOM_LENGTH = 20;
var SALT_FACTOR = 5;

var User;

var userSchema = new Schema({
    name: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    email: {type: String, required: true, unique: true},

    verified: Boolean,
    verify_string: String,
    expires: Date,

    password_reset: String,
    reset_expire: Date,

    created_mealshares: [{ type: Schema.Types.ObjectId, ref: 'Mealshare' }],

    persistent_token: String
});

userSchema.pre('save', function(next) {
    var user = this;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

// INSTANCE METHODS

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err)
            return cb(err);
        cb(null, isMatch);
    });
};

userSchema.methods.compareCookieToken = function(token, cb) {
    bcrypt.compare(token, this.persistent_token, function(err, isMatch) {
        cb(err, isMatch);
    });
}

userSchema.methods.generateVerification = function() {
    this.verified = false;
    this.verify_string = crypto.randomBytes(RANDOM_LENGTH).toString('hex');
    this.expires = Date.now() + 4 * 3600000; // set auto deletion of user after 4 hours of non-validation
}

userSchema.methods.isAdmin = function() {
    var adminUserNames = /(Alex Dangel|Caitlin Toner|Pradyut Bansal|Emma|Devin|Eivind Bakke)/;
    return adminUserNames.test(this.name);
}

userSchema.methods.generateRememberToken = function(cb){
    var user = this;
    var token = crypto.randomBytes(RANDOM_LENGTH).toString('hex');

    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
        if (err) return cb(err);

        bcrypt.hash(token, salt, null, function(err, hash) {
            if (err) return cb(err);

            user.persistent_token = hash;
            user.save();
            cb(null, token);
        });
    });
}

// STATIC METHODS

userSchema.statics.verify = function(tok, cb) {
    User.findOne({ verify_string: tok, expires: { $gt: Date.now() } }, function(err, user) {
        if (err) {
            cb(err);
            return;
        }
        if (!user) {
            cb("No user found");
            return;
        }
        user.verified = true;
        user.expires = null;
        user.verify_string = null;
        user.save(function(err){
            cb(err, user);
        });
    });
}

userSchema.statics.createPasswordReset = function(userEmail, cb) {
    User.findOne({ email: userEmail }, function(err, user) {
        if (err) {
            cb (err);
            return;
        }
        if (!user) {
            cb("No user found");
            return;
        }
        user.password_reset = crypto.randomBytes(RANDOM_LENGTH).toString('hex');
        user.reset_expire = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
            cb(err, user);
        });
    });
}

userSchema.statics.resetPassword = function(token, nPassword, cb) {
    User.findOne({ password_reset: token, reset_expire: { $gt: Date.now() }}, function(err, user) {
        if (err) {
            cb (err);
            return;
        }
        if (!user) {
            cb("No user found");
            return;
        }
        user.password = nPassword;
        user.password_reset = null;
        user.reset_expire = null;
        user.save(function(err) {
            cb(err, user);
        });
    });
}

// to be used when creating new users
userSchema.statics.create = function(username, password, email, cb) {
    var nUser = new User();

    nUser.name = username;
    nUser.password = password; // password hashing is taken care of at save, if password is altered
    nUser.email = email;

    nUser.generateVerification();

    nUser.save(function(err) {
        if (err) {
            if (err.code == 11000) {
                return cb("User exists");
            }
            return cb(err);
        }
        cb(err, nUser);
    });
}

userSchema.statics.getAllUsers = function(cb) {
    User.find({}).select({name: 1, email: 1, _id: 0}).exec(function(err, users) {
        return cb(err, users);
    });
}

User = mongoose.model('User', userSchema);

module.exports = {
    User: User
};
