var LocalStrategy = require('passport-local').Strategy;
var CustomStrategy = require('passport-custom');
var cookieParser = require('cookie-parser');
var bcrypt = require('bcrypt-nodejs');
var database = require('./database');
var mail = require('./mail');

// var url = "http://0.0.0.0:3000"; //dev
var url = "http://nudl.co/"; //prod
var COOKIE_NAME = "nudl-remembers-you";
var COOKIE_VALID_DAYS = 90;

module.exports.setupStrategies = function(passport) {
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

                var macEmailPat = /.+@macalester.edu/g;
                if (!macEmailPat.test(email)) {
                    return done("Not Macalester email");
                }

                database.User.create(username, password, email, function(err, user) {
                    if (err)
                        return done(err);

                    if (!user.verified)
                        mail.sendEmailVerification(user, user.verify_string);

                    return done(null, user);
                });
            })
    );

    passport.use('local-login', new LocalStrategy({ usernameField: 'email', passwordField: 'password', passReqToCallback: true},
        
            function(req, username, password, done) {
                database.User.findOne({ email: username }, function (err, user) {
                    if (err) return done(err);
                    if (!user) return done("user doesn't exist", false);

                    user.comparePassword(password, function(err, isMatch) {
                        if (isMatch)
                            return done(null, user);
                        return done("incorrect password", false);
                    });
                });
            })
    );

    passport.use('cookie-login', new CustomStrategy(

            function(req, done) {
                var cookie = req.cookies[COOKIE_NAME];
                database.User.findOne({ _id: cookie._id }, function(err, user) {
                    if (err) return done(err);
                    if (!user) return done("user doesn't exist");

                    user.compareCookieToken(cookie.tk, function(err, isMatch) {
                        if (isMatch)
                            return done(null, user);

                        return done("incorrect login credentials. Do not change the cookie parameters");
                    });
                });

        })
    );
};

module.exports.createCookie = function(req, res, cb) {
    req.user.generateRememberToken(function(err, token) {
        if (err) {
            return cb(err);
        }

        var cookieExpireDate = new Date();
        cookieExpireDate.setDate(cookieExpireDate.getDate() + COOKIE_VALID_DAYS);
        res.cookie(COOKIE_NAME, {_id: req.user._id, expire: cookieExpireDate, tk: token});
        cb();
    });
}

module.exports.removeCookie = function(res, cb) {
    res.clearCookie(COOKIE_NAME);
    cb();
}

module.exports.requestHasCookie = function(req) {
    return req.cookies[COOKIE_NAME];
}
