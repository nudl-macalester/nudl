var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
var database = require('./database');
var mail = require('./mail');

var url = "http://0.0.0.0:3000";

module.exports.setup = function(passport) {
// Passport setup

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        database.User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({ usernameField:'name', passwordField: 'password', passReqToCallback: true },

            function (req, username, password, done) {
                var email = req.body.email;

                database.User.create(username, password, email, function(err, user) {
                    if (err)
                        return done(err);

                    if (!user.verified)
                        mail.sendEmailVerification(user, user.verify_string);

                    return done(null, user);
                });
            })
    );

    passport.use('local-login', new LocalStrategy({ usernameField: 'email', passwordField: 'password' },
        
            function(username, password, done) {
                database.User.findOne({ email: username }, function (err, user) {
                    if (err) return done(err);
                    if (!user) return done(null, false, {message: 'email not found'});

                    user.comparePassword(password, function(err, isMatch) {
                        if (isMatch)
                            return done(null, user);

                        return done(null, false, { message: 'Incorrect password.' });
                    });
                });
            })
    );
};
