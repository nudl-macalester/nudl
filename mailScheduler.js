var Scheduler = require('node-schedule');
var Emailer = require('./mail');

var SCHEDULING_PREFIXES = {
    GUEST_REMINDER: 'gr',
    HOST_REMINDER: 'hr',
    GUEST_EVAL: 'ge',
    HOST_EVAL: 'he'
}

var REMINDER_TIME_EST = 8;

module.exports.scheduleGuestReminder = function(mealshare) {
	// if a reminder is scheduled already, we return
	if (Scheduler.scheduledJobs[SCHEDULING_PREFIXES.GUEST_REMINDER + mealshare._id]) {
		console.log("already scheduled job");
		return;
	}

	console.log("scheduling job");
	Scheduler.scheduleJob(SCHEDULING_PREFIXES.GUEST_REMINDER + mealshare._id, mealshare.time.setHours(REMINDER_TIME_EST), function() {
		emailGuestsReminder(mealshare._id);
	});

}

emailGuestsReminder = function(mealshareId) {
    Mealshare.getMealshare(mealshareId, function(err, mealshare) {
        if (mealshare) {
           Emailer.sendMealshareGuestReminder(mealshare);
        }
    });
}

module.exports.deleteScheduledGuestReminder = function(mealshare) {
	var scheduledJob = Scheduler.scheduledJobs[SCHEDULING_PREFIXES.GUEST_REMINDER + mealshare._id];

	if (scheduledJob) { // if there is no scheduled job, then there is no reminder in the first place, and we are ok. (might happen because of reset of server...)
		scheduledJob.cancel();
	}
	return true;
}
