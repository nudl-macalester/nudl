var db = require('../database');
var mail = require('../mail');
var mealshareController = require('../controllers/mealshare');

module.exports = function(app) {

    app.post('/mealshare/new', isLoggedIn, function(req, res) {
        var mealshare = {
            user: req.user,
            name: req.body.name,
            description: req.body.description,
            max_guests: req.body.max_guests,
            price: req.body.price,
            date: new Date(req.body.date + " " + req.body.time + " GMT-0600"),
            location: req.body.location,
            dietary_restrictions: req.body.dietary_restrictions,
            allergens: req.body.allergens,
            contact_info: req.body.contact_info
        }

        mealshareController.createMealshare(mealshare, function(err, ms) {
            if (err) {
                return res.status(500).send("Error saving new mealshare");
            }
            res.status(200).send(ms);
        });
    });

    app.all('/mealshare/:action(attend|unattend|host|unhost|delete|edit)/:mealshareId', isLoggedIn, function(req, res, next) {
        var mealshareId = req.param("mealshareId");
        mealshareController.getMealshare(mealshareId, function(err, mealshare) {
            if (err) {
                return res.status(500)
                        .send("could not retrieve mealshare");
            }
            req.mealshare = mealshare;
            next();
        });
    });

    app.put('/mealshare/attend/:mealshareId', isLoggedIn, function(req, res) {
        mealshareController.addGuestToMealshare(req.mealshare, req.user, function(err, ms) {
            if (err) {
                return res.status(500)
                        .send("something went wrong");
            }
            res.status(200)
                .send(ms);
        });
    });

    app.put('/mealshare/host/:mealshareId', isLoggedIn, function(req, res) {
        mealshareController.addHostToMealshare(req.mealshare, req.user, function(err, ms) {
            if (err) {
                return res.status(500)
                        .send("something went wrong");
            }
            res.status(200)
                .send(ms);
        });
    });

    app.put('/mealshare/unattend/:mealshareId', isLoggedIn, function(req, res) {
        mealshareController.removeGuestFromMealshare(req.mealshare, req.user, function(err, ms) {
            if (err) {
                return res.status(500)
                        .send("something went wrong");
            }
            res.status(200)
                .send(ms);
        });
    });

    app.put('/mealshare/unhost/:mealshareId', isLoggedIn, function(req, res) {
        mealshareController.removeHostFromMealshare(req.mealshare, req.user, function(err, ms) {
            if (err) {
                return res.status(500)
                        .send("something went wrong");
            }
            res.status(200)
                .send(ms);
        });
    });

    app.put('/mealshare/edit/:mealshareId', isLoggedIn, function(req, res) {
        mealshareController.updateMealshare(
            req.user,
            req.mealshare,
            req.body.name,
            req.body.description,
            req.body.max_guests,
            req.body.date,
            req.body.time,
            req.body.price,
            req.body.guests_message,
            function(err, ms) {
                if (err) {
                    return res.status(500)
                                .send("something went wrong");
                }
                res.status(200)
                    .send(ms);
            });
    });

    app.delete('/mealshare/delete/:mealshareId', isLoggedIn, function(req, res) {
        mealshareController.deleteMealshare(req.mealshare, req.user, function(err, msId) {
            if (err) {
                return res.status(500)
                        .send("delete failed");
            }
            // todo: delete email
            res.status(200)
                .send(msId);
        });
    });

} // end module.exports

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


