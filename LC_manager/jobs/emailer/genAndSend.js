const emailer = require('./emailer')
const Mailgen = require('mailgen')

var mailGenerator = new Mailgen({
    theme: 'salted',
    product: {
        name: 'MVOMNI Letter of Credit Manager',
        link: 'http://192.168.0.10:3000'
    }
})

const updateEmail = 'lcupdate@mvomni.com'

var genAndSendExpDayEmail= function(data){
  var email = {
      body: {
          name: "",
          intro: 'The Following LCs are due to expire today and will be marked as expired in the system at midnight.'+
                 ' Please logon to the portal and extend the relevant LCs if there are any.',
          table: {
              data: data,
              columns: {
                  // Optionally, customize the column widths
                  customWidth: {
                      'Issuer': '20%',
                      'LC no.': '20%',
                      'Supplier': '20%',
                      'Expiration Date': '10%',
                      'Amount': '15%',
                      'Unused': '15%',
                  },
                  // Optionally, change column text alignment
                  customAlignment: {
                      'Amount': 'right',
                      'Unused': 'right',
                  }
              }
          },

          action: {
              instructions: 'You can find more information about the LC payments and expirations in your dashboard:<br>' +
                            'Note: This will only work when you are connected to office network.',
              button: {
                  color: '#3869D4',
                  text: 'Go to portal',
                  link: 'http://192.168.0.10:3000/'
              }
          },
          //outro: ''
      }
  };

  // gen an HTML email with the provided contents
  var emailBody = mailGenerator.generate(email);

  // gen the plaintext version of the e-mail (for clients that do not support HTML)
  var emailText = mailGenerator.generatePlaintext(email);

  var options = {}
  options.to = 'lcupdate@mvomni.com'
  options.subject = 'LC Expiration Update'
  options.html = emailBody
  emailer.sendMail(options)        
  //require('fs').writeFileSync('preview.html', emailBody, 'utf8');
  //require('fs').writeFileSync('preview.txt', emailText, 'utf8');
}

var genAndSendPaymentEmail = function (data){
  var email = {
      body: {
          name: "",
          intro: 'The Following LCs were due today and have been marked as paid in the system.<br/>'+
                 'Please logon to the portal and update necessary details.',
          table: {
              data: data,
              columns: {
                  // Optionally, customize the column widths
                  customWidth: {
                      'Issuer': '5%',
                      'LC no.': '30%',
                      'Supplier': '35%',
                      'Due Date': '15%',
                      'Due Amount': '15%',
                  },
                  // Optionally, change column text alignment
                  customAlignment: {
                      'Due Amount': 'right'
                  }
              }
          },

          action: {
              instructions: 'You can find more information about the LC payments and expirations in your dashboard:<br>' +
                            'Note: This will only work when you are connected to office network.',
              button: {
                  color: '#3869D4',
                  text: 'Go to portal',
                  link: 'http://192.168.0.10:3000/'
              }
          },
          //outro: ''
      }
    };

    // gen an HTML email with the provided contents
    var emailBody = mailGenerator.generate(email);

    // gen the plaintext version of the e-mail (for clients that do not support HTML)
    var emailText = mailGenerator.generatePlaintext(email);

    var options = {}
    options.to = 'lcupdate@mvomni.com'
    options.subject = 'LC Payment Update'
    options.html = emailBody
    emailer.sendMail(options)        
    //require('fs').writeFileSync('preview.html', emailBody, 'utf8');
    //require('fs').writeFileSync('preview.txt', emailText, 'utf8');  
}

var genAndSendPayWeekEmail = function (data){
  var email = {
      body: {
          name: "",
          intro: 'The Following LCs are due to expire in the next 14 days.',
          table: {
              data: data,
              columns: {
                  // Optionally, customize the column widths
                  customWidth: {
                      'Issuer': '5%',
                      'LC no.': '30%',
                      'Supplier': '35%',
                      'Due Date': '15%',
                      'Due Amount': '15%',
                  },
                  // Optionally, change column text alignment
                  customAlignment: {
                      'Due Amount': 'right'
                  }
              }
          },

          action: {
              instructions: 'You can find more information about the LC payments and expirations in your dashboard:<br>' +
                            'Note: This will only work when you are connected to office network.',
              button: {
                  color: '#3869D4',
                  text: 'Go to portal',
                  link: 'http://192.168.0.10:3000/'
              }
          },
          //outro: ''
      }
    };

    // gen an HTML email with the provided contents
    var emailBody = mailGenerator.generate(email);

    // gen the plaintext version of the e-mail (for clients that do not support HTML)
    var emailText = mailGenerator.generatePlaintext(email);

    var options = {}
    options.to = 'lcupdate@mvomni.com'
    options.subject = 'LC Weekly Payment Update'
    options.html = emailBody
    emailer.sendMail(options)        
    //require('fs').writeFileSync('preview.html', emailBody, 'utf8');
    //require('fs').writeFileSync('preview.txt', emailText, 'utf8');  
}

var genAndSendExpDayEmail= function(data){
  var email = {
      body: {
          name: "",
          intro: 'The Following LCs are due to expire today and will be marked as expired in the system at midnight.'+
                 ' Please logon to the portal and extend the relevant LCs if there are any.',
          table: {
              data: data,
              columns: {
                  // Optionally, customize the column widths
                  customWidth: {
                      'Issuer': '20%',
                      'LC no.': '20%',
                      'Supplier': '20%',
                      'Expiration Date': '10%',
                      'Amount': '15%',
                      'Unused': '15%',
                  },
                  // Optionally, change column text alignment
                  customAlignment: {
                      'Amount': 'right',
                      'Unused': 'right',
                  }
              }
          },

          action: {
              instructions: 'You can find more information about the LC payments and expirations in your dashboard:<br>' +
                            'Note: This will only work when you are connected to office network.',
              button: {
                  color: '#3869D4',
                  text: 'Go to portal',
                  link: 'http://192.168.0.10:3000/'
              }
          },
          //outro: ''
      }
  };

  // gen an HTML email with the provided contents
  var emailBody = mailGenerator.generate(email);

  // gen the plaintext version of the e-mail (for clients that do not support HTML)
  var emailText = mailGenerator.generatePlaintext(email);

  var options = {}
  options.to = 'lcupdate@mvomni.com'
  options.subject = 'LC Expiration Update'
  options.html = emailBody
  emailer.sendMail(options)        
  //require('fs').writeFileSync('preview.html', emailBody, 'utf8');
  //require('fs').writeFileSync('preview.txt', emailText, 'utf8');
}

var genAndSendExpWeekEmail= function(data){
  var email = {
      body: {
          name: "",
          intro: 'The Following LCs are due to expire in the next 14 days.'+
                 ' Please logon to the portal and extend the relevant LCs if needed.',
          table: {
              data: data,
              columns: {
                  // Optionally, customize the column widths
                  customWidth: {
                      'Issuer': '20%',
                      'LC no.': '20%',
                      'Supplier': '20%',
                      'Expiration Date': '10%',
                      'Amount': '15%',
                      'Unused': '15%',
                  },
                  // Optionally, change column text alignment
                  customAlignment: {
                      'Amount': 'right',
                      'Unused': 'right',
                  }
              }
          },

          action: {
              instructions: 'You can find more information about the LC payments and expirations in your dashboard:<br>' +
                            'Note: This will only work when you are connected to office network.',
              button: {
                  color: '#3869D4',
                  text: 'Go to portal',
                  link: 'http://192.168.0.10:3000/'
              }
          },
          //outro: ''
      }
  };

  // gen an HTML email with the provided contents
  var emailBody = mailGenerator.generate(email);

  // gen the plaintext version of the e-mail (for clients that do not support HTML)
  var emailText = mailGenerator.generatePlaintext(email);

  var options = {}
  options.to = 'lcupdate@mvomni.com'
  options.subject = 'LC Weekly Expiration Update'
  options.html = emailBody
  emailer.sendMail(options)        
  //require('fs').writeFileSync('preview.html', emailBody, 'utf8');
  //require('fs').writeFileSync('preview.txt', emailText, 'utf8');
}

var genAndSendNewUserEmail = function(data){
  var email = {
      body: {
          name: data.name,
          intro: ['You have been successfully registered to LC Mangar Portal.','Use the following details to login'],
          dictionary:{
            email: data.email,
            password: data.password
          },
          action: {
              instructions: ['Note: You can change your password later.',
                              'However, it is highly recommended that you use a stong password.'],
              button: {
                  color: '#3869D4',
                  text: 'Go to portal',
                  link: 'http://192.168.0.10:3000/'
              }
          },
          //outro: ''
      }
  };

  // gen an HTML email with the provided contents
  var emailBody = mailGenerator.generate(email);

  // gen the plaintext version of the e-mail (for clients that do not support HTML)
  var emailText = mailGenerator.generatePlaintext(email);

  var options = {}
  options.to = data.email,
  options.subject = 'LC Weekly Expiration Update'
  options.html = emailBody
  emailer.sendMail(options)        
  //require('fs').writeFileSync('preview.html', emailBody, 'utf8');
  //require('fs').writeFileSync('preview.txt', emailText, 'utf8');
}

module.exports={
  genAndSendPaymentEmail,
  genAndSendExpDayEmail,
  genAndSendExpWeekEmail,
  genAndSendPayWeekEmail,
  genAndSendNewUserEmail
}
