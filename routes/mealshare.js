var db = require('../database');

module.exports = function(app) {

    app.post('/mealshare/new', isLoggedIn, function(req, res) {

        db.Mealshare.create(req.user, req.body.name, req.body.description, req.body.max_guests, new Date(req.body.date + " " + req.body.time),
            function(err, ms) {
                if (err) {
                    res.status(500)
                        .send("Error saving new mealshare");
                }
                res.status(200)
                    .send(ms);
        });
    });

    app.all('/mealshare/:action(attend|unattend|host|unhost|delete)/:mealshareId', isLoggedIn, function(req, res, next) {
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

    app.delete('/mealshare/delete/:mealshareId', isLoggedIn, function(req, res) {
        console.log(req.mealshare.creator);
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


