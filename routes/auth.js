var passport = require('passport');
require('../passportSetup');
var crypto = require('crypto');
var db = require('../database');
var mail = require('../mail');

module.exports = function(app) {
    app.post('/signin', passport.authenticate('local-login',
        {
            successRedirect: '/home/',
            failureRedirect: '/',
            failureFlash: true
        }
    ));

    app.post('/signup', passport.authenticate('local-signup',
        {
            successRedirect: '/home/',
            failureRedirect: '/',
            failureFlash: true
        }
    ));

    app.get('/signout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/verify', function(req, res) {
        var tok = req.param('token');
        db.User.verify(tok, function(err, user) {
            if (err) {
                res.status(500)
                    .send("verification failed");
                return;
            }
            res.status(200)
                .send("user verified");
        });
    });

    app.post('/forgot', function(req, res) {
        var userEmail = req.body.email;
        db.User.createPasswordReset(userEmail, function(err, user) {
            if (err) {
                res.status(500)
                    .send("password reset failed");
                return;
            }
            mail.sendEmailReset(user);
            res.status(200)
                .send("password reset email sent!");
        });
    });

    app.post('/reset', function(req, res) {
        var nPassword = req.body.password;
        var tok = req.param("token");
        db.User.resetPassword(tok, nPassword, function(err, user) {
            if (err) {
                res.status(500)
                    .send("password reset failed");
                return;
            }
            mail.sendEmailResetConfirm(user);
            res.status(200)
                .redirect("/");
        });
    });
}