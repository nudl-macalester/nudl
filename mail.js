var nodemailer = require('nodemailer');

// Create a "transporter" to actually send the mail
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'nudl.test@gmail.com',
        pass: 'GroovyFood'
    }
});

module.exports.send = function(obj) {
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
