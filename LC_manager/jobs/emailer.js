var nodemailer = require('nodemailer');


var transporter = nodemailer.createTransport({
	name: 'localhost',
	secure:false
});

var mailOptions = {
    from: 'lcmanager@lchost.com',
    to: 'abhi02.1998@gmail.com',
    subject: 'Sending Email using Node.js server',
    text: "Hey! This is abhishek's computer. He is a legend! \n Regards, Node"
};

transporter.sendMail(mailOptions,function(error, info){
    if (error) {
	console.log(error);
    } else{
	console.log('Email Sent: '+ info.response)
    }
});