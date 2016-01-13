var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: String,
    password: String,
    email: String,
    verified: Boolean,
    created_mealshares: [{ type: Schema.Types.ObjectId, ref: 'Mealshare' }],
    password_reset: String,
    reset_expire: Date
});

userSchema.pre('save', function(next) {
    var user = this;
    var SALT_FACTOR = 5;

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

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

var User = mongoose.model('User', userSchema);

//==========================================================================
var Verif;

var verifSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User' },
    expirationDate: Date,
    createdAt: {
        type: Date,
        expires: '7d',
        default: Date.now
    }
});

verifSchema.statics.generateForUser = function(user, callback) {
    var verif = new Verif();
    
    var now = new Date();
    now.setDate(now.getDate() + 7);

    verif.expirationDate = now;
    verif.user = user._id;

    verif.save(function(err) {
        if(err)
            return callback(err);

        callback(null, verif);
    });
};

verifSchema.statics.attemptVerification = function(id, callback) {
    var oerr = null;

    Verif.findById(id)
        .populate('user')
        .exec(function(err, verif) {
            if(err)
                return callback(err, "An error occurred", verif);
            
            var now = new Date();
            if(now > verif.expirationDate)
                return callback(null, "The verification time is over.", verif);

            return callback(null, null, verif);
        });
};

Verif = mongoose.model('Verif', verifSchema);

module.exports = {
    User: User,
    Verif: Verif
};
