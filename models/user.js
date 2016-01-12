var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: String,
    password: String,
    email: String,
    verified: Boolean,
    created_mealshares: [{ type: Schema.Types.ObjectId, ref: 'Mealshare' }]
});

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
