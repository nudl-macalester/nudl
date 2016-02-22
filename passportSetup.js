var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
var User = require('./models/user')
var mail = require('./mail');

// var url = "http://0.0.0.0:3000"; //dev
var url = "http://nudl.co/"; //prod

module.exports.setup = function(passport) {
// Passport setup

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({ usernameField:'name', passwordField: 'password', passReqToCallback: true },

            function (req, username, password, done) {
                var email = req.body.email;

                var macEmailPat = /.+@macalester.edu/g;
                if (!macEmailPat.test(email)) {
                    return done("Not Macalester email");
                }

                User.create(username, password, email, function(err, user) {
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
                User.findOne({ email: username }, function (err, user) {
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
