var nodemailer = require('nodemailer');

var sendMail = function(options){

    var transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        auth: {
            user: 'lcmanager@mvomni.com',
            pass: 'Daz37888'
        }
    });


    var mailOptions = {
        from: 'lcmanager@mvomni.com',
        to: options.to,
        subject: options.subject,
        //text: options.text,
        html: options.html
    }

    transporter.sendMail(mailOptions,function(error, info){
        if (error) {
        console.log(error);
        } else{
        console.log('Email Sent: '+ info.response)
        }
    });

}
module.exports = {
    sendMail
}