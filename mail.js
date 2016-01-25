var nodemailer = require('nodemailer');

// Create a "transporter" to actually send the mail
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'nudl.test@gmail.com',
        pass: 'GroovyFood'
    }
});

// Must change for production
var url = "http://0.0.0.0:3000";


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
