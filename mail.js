var nodemailer = require('nodemailer');

var generator = require('xoauth2').createXOAuth2Generator({
    user: 'nudl.macalester@gmail.com',
    clientId: '307181339517-hhm4stv3hp4pjm2jp9u8octmk6ee7kno.apps.googleusercontent.com',
    clientSecret: 'MLTgD8BnMyyEvMzh49pbr3QR',
    refreshToken: '1/lREMF2EKBKjDgXBBnWOczMbnQLiNCUeJWLA-GbVbm7I',
    accessToken: 'ya29.egLm7WbRSKqqJtmqWm-rotqrxvbTv3O_0c7_jF3S2bhwGMTAjmCUH-A7h7vU8TcPE8GX' // optional
});
var dateFormat=function(){var t=/d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,e=/\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,a=/[^-+\dA-Z]/g,m=function(t,e){for(t=String(t),e=e||2;t.length<e;)t="0"+t;return t};return function(d,n,r){var y=dateFormat;if(1!=arguments.length||"[object String]"!=Object.prototype.toString.call(d)||/\d/.test(d)||(n=d,d=void 0),d=d?new Date(d):new Date,isNaN(d))throw SyntaxError("invalid date");n=String(y.masks[n]||n||y.masks["default"]),"UTC:"==n.slice(0,4)&&(n=n.slice(4),r=!0);var s=r?"getUTC":"get",i=d[s+"Date"](),o=d[s+"Day"](),u=d[s+"Month"](),M=d[s+"FullYear"](),l=d[s+"Hours"](),T=d[s+"Minutes"](),h=d[s+"Seconds"](),c=d[s+"Milliseconds"](),g=r?0:d.getTimezoneOffset(),S={d:i,dd:m(i),ddd:y.i18n.dayNames[o],dddd:y.i18n.dayNames[o+7],m:u+1,mm:m(u+1),mmm:y.i18n.monthNames[u],mmmm:y.i18n.monthNames[u+12],yy:String(M).slice(2),yyyy:M,h:l%12||12,hh:m(l%12||12),H:l,HH:m(l),M:T,MM:m(T),s:h,ss:m(h),l:m(c,3),L:m(c>99?Math.round(c/10):c),t:12>l?"a":"p",tt:12>l?"am":"pm",T:12>l?"A":"P",TT:12>l?"AM":"PM",Z:r?"UTC":(String(d).match(e)||[""]).pop().replace(a,""),o:(g>0?"-":"+")+m(100*Math.floor(Math.abs(g)/60)+Math.abs(g)%60,4),S:["th","st","nd","rd"][i%10>3?0:(i%100-i%10!=10)*i%10]};return n.replace(t,function(t){return t in S?S[t]:t.slice(1,t.length-1)})}}();dateFormat.masks={"default":"ddd mmm dd yyyy HH:MM:ss",shortDate:"m/d/yy",mediumDate:"mmm d, yyyy",longDate:"mmmm d, yyyy",fullDate:"dddd, mmmm d, yyyy",shortTime:"h:MM TT",mediumTime:"h:MM:ss TT",longTime:"h:MM:ss TT Z",isoDate:"yyyy-mm-dd",isoTime:"HH:MM:ss",isoDateTime:"yyyy-mm-dd'T'HH:MM:ss",isoUtcDateTime:"UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"},dateFormat.i18n={dayNames:["Sun","Mon","Tue","Wed","Thu","Fri","Sat","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],monthNames:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","January","February","March","April","May","June","July","August","September","October","November","December"]},Date.prototype.format=function(t,e){return dateFormat(this,t,e)};
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
        body: 'Hi there! <br><br> The mealshare ' + mealshare.name +' has been updated! Here\'s a message from ' + mealshare.creator.name + ': <br><br>' + message + ' <br><br>Enjoy your meal together!'
    });
}

module.exports.sendMealshareAttend = function(mealshare, user) {
    var guestsNames = "";
    for (var i = 0; i < mealshare.guests.length; i++) {
        guestsNames += mealshare.guests[i].name + "<br>";
    }

    sendEmail({
        to: user.email,
        subject: "Attending Mealshare: " + mealshare.name,
        body: 'Hi ' + user.name + '! <br><br>  You have reserved a spot at the mealshare ' + mealshare.name + '<br><br>Other guests include:<br><br>' + guestsNames + '<br><br>Time: ' + dateFormat(mealshare.time, 'dddd, mm:dd') + ' PM<br><br> If for some reason you cannot attend, please find a friend to replace you and \"unattend\" your RSVP on nudl.co. We will hold you accountable for your spot at the table if you are RSVP’d for the event 6 hours in advance of the start time. <br><br>Bon Appétit, <br>The NÜDL Team<br><br>Eat together. Eat smarter.<br>nudl.co'
    });
}

module.exports.sendMealshareCreate = function(mealshare, user) {
    sendEmail({
        to: user.email,
        subject: "May the forks be with you!",
        body: 'Hi ' + user.name + ', <br><br>Thank you for signing up to host the Nüdl ' + mealshare.name + '.<br><br>Here are 3 things you should know:<br><br>1. Please read the checklist before your dinner: https://goo.gl/G2RQMf <br><br> 2.  NÜDL Photographer Emma Foti ‘18 might be in touch with you aboutvisiting your Mealshare. She’s creating a Macalester Cookbook: http://nudlcookbook.tumblr.com/<br><br> 3. Please share our philosophy with your friends and tell them about your NÜDL experience: http://nudl.co/about <br><br> You can get in touch with us at nudl.macalester@gmail.com. <br><br> Bon appétit,<br>The NÜDL team<br><br>Eat together. Eat smarter. <br>www.nudl.co'
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
