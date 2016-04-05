var express = require('express');
var path = require('path');
var passport = require('passport');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var db = require('./database.js');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var logger = require('morgan');
var fs = require('fs');
var mail = require('./mail');
var passportUtils = require('./passportUtils');
var http = require('http');
var crypto = require('crypto');
var jade = require('jade');

// Express setup
var app = express();
var server = http.createServer(app);

app.use(logger('dev'));
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'NudlSecret',
    resave: false,
    saveUninitialized: false//,
    // store: new MongoStore({
    //     mongooseConnection: db,
    //     ttl: 14 * 24 * 60 * 60,
    //     touchAfter: 24 * 3600
    // })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(flash());
//app.use(app.router);

passportUtils.setupStrategies(passport);

require('./routes/auth.js')(app);
require('./routes/mealshare.js')(app);

var mealshareController = require('./controllers/mealshare');

// routes


app.get('/home/', isLoggedIn, function(req, res) {
    var mealsharesString = null;

    var homeDocPath = path.join(process.cwd(), '/public/home/index.html');

    mealshareController.getFrontEndMealsharesForUser(req.user, function(err, mealshares) {
        if (err) {
            return res.status(500)
                    .send("something went wrong");
        }
        mealsharesString = "var mealshares = " + JSON.stringify(mealshares) + ";";

        fs.readFile(homeDocPath, 'utf8', 'r+', function(err, homeDoc) {
            if (err) {
                conosole.log(err);
                return;
            }
            homeDoc = homeDoc.replace(/MEALSHARESHERE/g, mealsharesString);
            res.send(homeDoc);
        });

    });
});

app.get('/host/', isLoggedIn, function(req, res) {
    var user = req.user;

    var mealsharesString = null;

    var hostDocPath = path.join(process.cwd(), 'public/host/index.html');

    mealshareController.getFrontEndMealsharesForUser(user, function(err, mealshares) {
        mealsharesString = "var mealshares = " + JSON.stringify(mealshares) + ";";

        fs.readFile(hostDocPath, 'utf8', 'r+', function(err, hostDoc) {
            if (err) {
                console.log(err);
                return;
            }
            hostDoc = hostDoc.replace(/MEALSHARESHERE/g, mealsharesString);
            res.send(hostDoc);
        });
    });
});

app.get('/admin', isLoggedIn, isAdmin, function(req, res) {
    var adminDocPath = path.join(process.cwd(), 'public/admin/index');

    db.Mealshare.getAllMealshares(function(err, mealshares) {

        db.User.getAllUsers(function(err, users) {
            var nNextWeekMealshares = 0;
            var nPastWeekMealshares = 0;
            var nPastWeekGuests = 0;
            
            var weekAgo = new Date();
            var currentDate = weekAgo.getDate();
            weekAgo.setDate(currentDate - 7);
            var weekFromToday = new Date();
            weekFromToday.setDate(currentDate + 7);
            var today = Date.now();

            for (var i = 0; i < mealshares.length; i++) {
                var mealshare = mealshares[i];
                if (mealshare.time >= weekAgo && mealshare.time <= today) {
                    nPastWeekMealshares++;
                    nPastWeekGuests += mealshare.guests.length;
                } else if (mealshare.time >= today && mealshare.time <= weekFromToday) {
                    nNextWeekMealshares++;
                }
            }
            // console.log(nNextWeekMealshares);

            res.render(adminDocPath, {
                adminUser: req.user.name,
                mealshares: mealshares,
                users: users,
                nextWeekMSs: nNextWeekMealshares,
                pastWeekMSs: nPastWeekMealshares,
                pastWeekGuests: nPastWeekGuests
            });
        });
    });
});

app.get('/admin/mealshare/get/:mealshareId', isLoggedIn, isAdmin, function(req, res) {
    var mealshareId = req.param("mealshareId");
    db.Mealshare.findById(mealshareId).populate('creator hosts guests').exec(function(err, mealshare) {
        if (err) {
            console.log(err);
            return res.status(500);
        }
        res.send(mealshare);
    });
});

// route middleware to make sure
function isLoggedIn(req, res, next) {
    if (req.url === '/') { // if valid cookie, redirect to /home/, otherwise continue to /
        // if (passportUtils.requestHasCookie(req)) {
        //     return passport.authenticate('cookie-login', {failureRedirect: '/signout', successRedirect: '/home/', failureFlash: true})(req, res, next);
        // }
        return next();
    }

    if (req.user && !req.user.verified) {
        return res.end('Please verify your account.');
    } else if (req.isAuthenticated() && req.user.verified) {
        return next();
    }

    // else if (passportUtils.requestHasCookie(req)) {
    //     return passport.authenticate('cookie-login', {failureRedirect: '/signout', failureFlash: true})(req, res, next);
    // }

    res.redirect('/');
}

function isAdmin(req, res, next) {
    if (req.user.isAdmin()) {
        return next();
    }
    res.redirect('/');
}

// The regex defines all routes that are allowed without logging in. All other routes are protected
app.all(/^(?!(\/css|\/js|\/img|\/font\-awesome)).*$/, isLoggedIn);

app.use(express.static(path.join(process.cwd(), '/public/')));

server.listen(8080, function() {
    console.log("Listening on port 8080");
});
