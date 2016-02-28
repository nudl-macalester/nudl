
module.exports.getReminderTemplate = function(user, mealshare) {
	var reminderBody = "Hi there" +
		user.name +
		"<br>" +
		"remember your mealshare:";
	return reminderBody;
}


