
module.exports.getReminderTemplate = function(user, mealshare) {
	var reminderBody = 
		"<table width=\"100%\" cellspacing=\"10\" cellpadding=\"0\">
			<table class=\"main\" width = \"580\" cellspacing= \"10\" cellpadding=\"0\" border=\"1\">
				<tr>
					<td>Hi there " + user.name + "</td>
				</tr>
				<tr>
					<td>remember your Mealshare: " + mealshare.name + " </td>
				</tr>
			</table>
		</table>"
	return reminderBody;
}

module.exports.getUpdateTemplate = function(mealshare, message) {
    return'Hi there! <br><br> The Mealshare ' + mealshare.name +
        ' has been updated! Here\'s a message from ' + mealshare.creator.name + 
        ': <br><br>' + message + ' <br><br>Enjoy your meal together!';
}

module.exports.getAttendTemplate = function(mealshare, user) {
	return 'Hi ' + user.name + '! <br><br>  You have reserved a spot 
		at the Mealshare ' + mealshare.name + '<br><br>Other guests include:<br><br>' 
		+ guestsNames + '<br><br>Time: ' + dateTimeString + ' <br><br> If for some 
		reason you cannot attend, please find a friend to replace you and \"unattend\" 
		our RSVP on nudl.co. We will hold you accountable for your spot at the table 
		if you are RSVP’d for the event 6 hours in advance of the start time. 
		<br><br>Bon Appétit, <br>The NÜDL Team<br><br>Eat together. Eat smarter.
		<br>nudl.co';
}

module.exports.getCreateTemplate = function(mealshare, user) {
	return 
		"<table width=\"100%\" cellspacing=\"10\" cellpadding=\"0\">
			<table class=\"main\" width = \"580\" cellspacing= \"10\" cellpadding=\"0\" border=\"1\">
				<tr>
					<td>Hi " + user.name + ", </td>
				</tr>
				<tr>
					<td>Thank you for signing up to host the NÜDL"+ mealshare.name + " </td>
				</tr>
				<tr>
				Here are 3 things you should know:
				</tr>
				<tr>
				1. Please read the checklist before your dinner: https://goo.gl/G2RQMf
				</tr>
				<tr>
				2.  NÜDL Photographer Emma Foti ‘18 might be in touch with you about visiting your Mealshare. 
				She’s creating a Macalester Cookbook: http://nudlcookbook.tumblr.com/
	  			</tr>
	  			<tr>
	  			3. Please share our philosophy with your friends and tell them about your NÜDL experience: http://nudl.co/about 
	  			</tr>
				<tr>
				You can get in touch with us at nudl.macalester@gmail.com. 
				</tr>
				Bon appétit,
				</tr>
				<tr>
				The NÜDL team
				</tr>
			</table>
			<table class=\"footer\" width = \"580\" cellspacing= \"10\" cellpadding=\"0\" border=\"1\">
				<tr>
				Eat together. Eat smarter. 
				</tr>
				
				<tr>
				www.nudl.co
				</tr>

		</table>";
}



	'Hi ' + user.name + ', <br><br>Thank you for signing up to host the NÜDL '
	 + mealshare.name + '.<br><br>
}

module.exports.getGuestReminderTemplate = function(mealshare, user) {
	return "You’ve reserved a spot at: " + mealshare.name + "<br><br>Time: " + dateTimeString + 
	"<br><br>If for some reason you cannot attend, please find a friend to replace you and “undo” 
	our RSVP on nudl.co. We will hold you accountable for your spot at the table if you are RSVP’d 
	for the event 6 hours in advance of the start time. <br><br>Bon Appétit,<br>The NÜDL Team
	<br><br>Eat together. Eat smarter. <br>www.nudl.co";
}

module.exports.getEmailVerificationTemplate = function(user) {
	return 'Hi!<br/><br/>Please follow the link below to verify your account on NUDL:<br/><a 
	href="' + url + '/verify?token=' + user.verify_string + '">Verify Account</a><br/><br/>Cheers,
	<br/>The NÜDL Team';
}

module.exports.getEmailResetTemplate = function(user) {
	return 'Hi!<br/><br/>Please follow the link below to reset your account password:<br/><a 
	href="' + url + '/reset?token=' + user.password_reset + '">Reset Password</a><br/><br/>Cheers,
	r/>The NÜDL Team';
}

module.exports.getEmailResetConfirmTemplate = function(user) {
	return 'Hi!<br/><br/>Your password has been reset.<br/><br/>Cheers,<br/>The NÜDL Team';
}

