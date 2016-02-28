var nodemailer = require('nodemailer');
var utils = require('./utils');
var emailTemplates = require('./emailTemplates');

var generator = require('xoauth2').createXOAuth2Generator({
    user: 'nudl.macalester@gmail.com',
    clientId: '307181339517-hhm4stv3hp4pjm2jp9u8octmk6ee7kno.apps.googleusercontent.com',
    clientSecret: 'MLTgD8BnMyyEvMzh49pbr3QR',
    refreshToken: '1/lREMF2EKBKjDgXBBnWOczMbnQLiNCUeJWLA-GbVbm7I',
    accessToken: 'ya29.egLm7WbRSKqqJtmqWm-rotqrxvbTv3O_0c7_jF3S2bhwGMTAjmCUH-A7h7vU8TcPE8GX' // optional
});

generator.on('token', function(token){
    console.log('New token for %s: %s', token.user, token.accessToken);
});

// Create a "transporter" to actually send the mail
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        xoauth2: generator
    }
});

var url = "http://nudl.co";

// client id:    307181339517-hhm4stv3hp4pjm2jp9u8octmk6ee7kno.apps.googleusercontent.com
// client secret:   MLTgD8BnMyyEvMzh49pbr3QR
// refresh token:    1/lREMF2EKBKjDgXBBnWOczMbnQLiNCUeJWLA-GbVbm7I
// access token:     ya29.egLm7WbRSKqqJtmqWm-rotqrxvbTv3O_0c7_jF3S2bhwGMTAjmCUH-A7h7vU8TcPE8GX



sendEmail = function(obj) {
    var from = 'from' in obj ? obj.from : 'no-reply@nudl.co';
    var to = obj.to;
    var subject = 'subject' in obj ? obj.subject : 'NUDL message';
    var body = obj.body;

    var mailopts = {
        from: from,
        to: to,
        subject: subject,
        html: body
    };

    transporter.sendMail(mailopts, function(err, info) {
        if(err) {
            console.log(err);
        }
    });
};

module.exports.sendMealshareUpdate = function(mealshare, message) {
    var guestsEmailsString = "";
    for (var i = 0; i < mealshare.guests.length - 1; i++) {
        guestsEmailsString += mealshare.guests[i].email + ",";
    }

    guestsEmailsString += mealshare.guests[mealshare.guests.length - 1].email;
    sendEmail({
        to: guestsEmailsString,
        subject: "Mealshare Update",
        body: 'Hi there! <br><br> The mealshare ' + mealshare.name +' has been updated! Here\'s a message from ' + mealshare.creator.name + ': <br><br>' + message + ' <br><br>Enjoy your meal together!'
    });
}

module.exports.sendMealshareAttend = function(mealshare, user) {
    var guestsNames = "";
    for (var i = 0; i < mealshare.guests.length; i++) {
        guestsNames += mealshare.guests[i].name + "<br>";
    }

    mealshare.time.setHours(mealshare.time.getHours() - 1); // quickfix for Macalester time, server is in New York (EST) currently
    var dateTimeString = utils.formatDate(mealshare.time, 'dddd, h:MM TT');

    sendEmail({
        to: user.email,
        subject: "Attending Mealshare: " + mealshare.name,
        body: 'Hi ' + user.name + '! <br><br>  You have reserved a spot at the mealshare ' + mealshare.name + '<br><br>Other guests include:<br><br>' + guestsNames + '<br><br>Time: ' + dateTimeString + ' <br><br> If for some reason you cannot attend, please find a friend to replace you and \"unattend\" your RSVP on nudl.co. We will hold you accountable for your spot at the table if you are RSVP’d for the event 6 hours in advance of the start time. <br><br>Bon Appétit, <br>The NÜDL Team<br><br>Eat together. Eat smarter.<br>nudl.co'
    });
}

module.exports.sendMealshareCreate = function(mealshare, user) {
    sendEmail({
        to: user.email,
        subject: "May the forks be with you!",
        body: emailTemplates.getCreateTemplate(mealshare, user)
        //body: 'Hi ' + user.name + ', <br><br>Thank you for signing up to host the Nüdl ' + mealshare.name + '.<br><br>Here are 3 things you should know:<br><br>1. Please read the checklist before your dinner: https://goo.gl/G2RQMf <br><br> 2.  NÜDL Photographer Emma Foti ‘18 might be in touch with you aboutvisiting your Mealshare. She’s creating a Macalester Cookbook: http://nudlcookbook.tumblr.com/<br><br> 3. Please share our philosophy with your friends and tell them about your NÜDL experience: http://nudl.co/about <br><br> You can get in touch with us at nudl.macalester@gmail.com. <br><br> Bon appétit,<br>The NÜDL team<br><br>Eat together. Eat smarter. <br>www.nudl.co'
    });
}

module.exports.sendMealshareGuestReminder = function(mealshare) {
    var guestsEmailsString = "";
    for (var i = 0; i < mealshare.guests.length - 1; i++) {
        guestsEmailsString += mealshare.guests[i].email + ",";
    }

    guestsEmailsString += mealshare.guests[mealshare.guests.length - 1].email;

    mealshare.time.setHours(mealshare.time.getHours() - 1); // quickfix for Macalester time, server is in New York (EST) currently
    var dateTimeString = utils.formatDate(mealshare.time, 'dddd, h:MM TT');

    sendEmail({
        to: guestsEmailsString,
        subject: "Reminder: " + mealshare.name,
        body: "You’ve reserved a spot at: " + mealshare.name + "<br><br>Time: " + dateTimeString + "<br><br>If for some reason you cannot attend, please find a friend to replace you and “undo” your RSVP on nudl.co. We will hold you accountable for your spot at the table if you are RSVP’d for the event 6 hours in advance of the start time. <br><br>Bon Appétit,<br>The NÜDL Team<br><br>Eat together. Eat smarter. <br>www.nudl.co"
    });
}

module.exports.sendEmailVerification = function(user) {
    sendEmail({
        to: user.email,
        subject: "Welcome to NUDL",
        body:'Hi!<br/><br/>Please follow the link below to verify your account on NUDL:<br/><a href="' + url + '/verify?token=' + user.verify_string + '">Verify Account</a><br/><br/>Cheers,<br/>The NUDL Team'
    });
}

module.exports.sendEmailReset = function(user) {
    sendEmail({
        to: user.email,
        subject: "Forgot NUDL password",
        body:'Hi!<br/><br/>Please follow the link below to reset your account password:<br/><a href="' + url + '/reset?token=' + user.password_reset + '">Reset Password</a><br/><br/>Cheers,<br/>The NUDL Team'
    });
}

module.exports.sendEmailResetConfirm = function (user) {
    sendEmail({
        to: user.email,
        subject: "NUDL password reset",
        body:'Hi!<br/><br/>Your password has been reset.<br/><br/>Cheers,<br/>The NUDL Team'
    });
}
