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
var auth = require('./passportSetup');
var http = require('http');
var crypto = require('crypto');

// Express setup
var app = express();
var server = http.createServer(app);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'PlaneChatSuperSecret',
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

auth.setup(passport);

require('./routes/auth.js')(app);
require('./routes/mealshare.js')(app);


// routes


app.get('/home/', isLoggedIn, function(req, res) {
    var user = req.user;
    // var userId = "56a5803eb7f4d4922a771627"; // USEFUL FOR TESTING

    var mealsharesString = null;

    var homeDocPath = path.join(process.cwd(), '/public/home/index.html');

    db.Mealshare.getFrontEndMealsharesForUser(user, function(err, mealshares) {
        allMealsharesString = "var allMealshares = " + JSON.stringify(mealshares) + ";";

        fs.readFile(homeDocPath, 'utf8', 'r+', function(err, homeDoc) {
            if (err) {
                conosole.log(err);
                return;
            }
            mealsharesString = "var mealshares = " + JSON.stringify(mealshares) + ";";
            homeDoc = homeDoc.replace(/MEALSHARESHERE/g, mealsharesString);
            res.send(homeDoc);
        });

    });
});

app.use('/host/', isLoggedIn);

// route middleware to make sure
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

// Middleware for authentication:
app.use(express.static(path.join(process.cwd(), '/public')));

server.listen(3000, function() {
    console.log("Listening on port 3000");
});
