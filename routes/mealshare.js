var db = require('../database');
var mail = require('../mail');

module.exports = function(app) {

    app.post('/mealshare/new', isLoggedIn, function(req, res) {

        db.Mealshare.create(req.user, req.body.name, req.body.description, req.body.max_guests, new Date(req.body.date + " " + req.body.time + " GMT-0600"), req.body.price,
            function(err, ms) {
                if (err) {
                    res.status(500)
                        .send("Error saving new mealshare");
                }
                mail.sendMealshareCreate(ms, req.user);
                res.status(200)
                    .send(ms);
        });
    });

    app.all('/mealshare/:action(attend|unattend|host|unhost|delete|edit)/:mealshareId', isLoggedIn, function(req, res, next) {
        var mealshareId = req.param("mealshareId");
        db.Mealshare.findById(mealshareId).populate('creator hosts guests').exec(function(err, mealshare) {
            if (err) {
                console.log(err);
            }
            req.mealshare = mealshare;
            next();
        })
    });

    app.put('/mealshare/attend/:mealshareId', isLoggedIn, function(req, res) {
        req.mealshare.addGuest(req.user, function(err, ms) {
            if (err) {
                console.log(err);
                res.status(500)
                    .send("something went wrong");
                return;
            }
            mail.sendMealshareAttend(req.mealshare, req.user);
            res.status(200)
                .send(ms);
        });
    });

    app.put('/mealshare/host/:mealshareId', isLoggedIn, function(req, res) {
        req.mealshare.addHost(req.user, function(err, ms) {
            if (err) {
                console.log(err);
                res.status(500)
                    .send("something went wrong");
            }
            res.status(200)
                .send(ms);
        });
    });

    app.put('/mealshare/unattend/:mealshareId', isLoggedIn, function(req, res) {
        req.mealshare.removeGuest(req.user, function(err, ms) {
            if (err) {
                console.log(err);
                res.status(500)
                    .send("something went wrong");
            }
            res.status(200)
                .send(ms);
        });
    });

    app.put('/mealshare/unhost/:mealshareId', isLoggedIn, function(req, res) {
        req.mealshare.removeHost(req.user, function(err, ms) {
            if (err) {
                console.log(err);
                res.status(500)
                    .send("something went wrong");
            }
            res.status(200)
                .send(ms);
        });
    });

    app.put('/mealshare/edit/:mealshareId', isLoggedIn, function(req, res) {
        var mealshare = req.mealshare;
        mealshare.name = req.body.name;
        mealshare.description = req.body.description;
        mealshare.price = req.body.price;

        var dateCheck = new Date(req.body.date + "/16 " + req.body.time + " GMT-0600");
        if (dateCheck == "Invalid Date") {
            res.status(400)
                .send("Invalid date");
            return;
        }

        if (dateCheck.getHours() > 12) {
            dateCheck.setHours(dateCheck.getHours() + 12);
        }
        mealshare.time = dateCheck;

        mealshare.max_guests = req.body.max_guests;
        mealshare.spots_left = mealshare.max_guests - mealshare.guests.length;

        if (mealshare.spots_left < 0) {
            res.status(400)
                .send("Not enough capacity for existing guests");
            return;
        }

        mealshare.save(function(err) {
            if (err) {
                res.status(500)
                    .send("Something went wrong");
                return;
            }

            if (mealshare.guests.length > 0 && req.body.guests_message != "") {
                mail.sendMealshareUpdate(mealshare, req.body.guests_message);
            }

            res.status(200)
                .send(req.body.guests_message);
        });
    });

    app.delete('/mealshare/delete/:mealshareId', isLoggedIn, function(req, res) {
        req.mealshare.delete(req.user, function(err, msId) {
            if (err) {
                console.log(err);
                res.status(500)
                    .send("delete failed");
            }
            // todo: delete email
            res.status(200)
                .send(msId);
        });
    });
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated() && req.user.verified) {
        return next();
    }

    if(req.user && !req.user.verified) {
        res.end('Please verify your account.');
        return;
    }

    res.redirect('/');
}


