var nodemailer = require('nodemailer');

var generator = require('xoauth2').createXOAuth2Generator({
    user: 'nudl.macalester@gmail.com',
    clientId: '307181339517-hhm4stv3hp4pjm2jp9u8octmk6ee7kno.apps.googleusercontent.com',
    clientSecret: 'MLTgD8BnMyyEvMzh49pbr3QR',
    refreshToken: '1/lREMF2EKBKjDgXBBnWOczMbnQLiNCUeJWLA-GbVbm7I',
    accessToken: 'ya29.egLm7WbRSKqqJtmqWm-rotqrxvbTv3O_0c7_jF3S2bhwGMTAjmCUH-A7h7vU8TcPE8GX' // optional
});

// listen for token updates
// you probably want to store these to a db
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

// Must change for production
var url = "http://0.0.0.0:3000";

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
        body: 'Hi there! <br><br> The mealshare ' + mealshare.name +' has been updated! Here\'s a message from ' + mealshare.creator.name + ': <br><br>' + message + 'Cheers!'
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
