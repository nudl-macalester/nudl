var db = require('../database');
var mealshareController = require('../controllers/mealshare');

module.exports = function(app) {
    app.post('/api/mealshare/new', isLoggedIn, function(req, res) {
        mealshare = JSON.parse(req.body)
        mealshare.date = new Date(mealshare.date)
        mealshare.user = req.user

        mealshareController.createMealshare(mealshare, function(err, ms) {
            if (err) {
                return res.status(500).send("Error saving new mealshare");
            }
            res.status(200).send(ms);
        });
    });

}