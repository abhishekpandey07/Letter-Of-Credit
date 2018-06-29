const mongoose = require('mongoose'),
    cron = require('node-schedule')
    lc = require('../model/lc')
    LCDB = mongoose.model('LC')
    bankMethods = require('../routes/helpers/nativeBanks')
    fetch = require('node-fetch')
    EJSON = require('mongodb-extended-json')
    Mailgen = require('mailgen')
    emailer = require('./emailer/emailer.js')

var mailGenerator = new Mailgen({
    theme: 'salted',
    product: {
        // Appears in header & footer of e-mails
        name: 'MVOMNI Letter of Credit Manager',
        link: 'http://192.168.0.10:3000'
        // Optional logo
        // logo: 'https://mailgen.js/img/logo.png'
    }
});

var data = []
function onPaymentUpdate(callback) {

  const MapFunction = function() {
    var today = new Date(new Date(Date.now()).setHours(24,0,0,0))
    for(var idx = 0 ; idx < this.payment.cycles.length; idx ++){
      var payments = []
      if(this.payment.cycles[idx].payed != true && this.payment.cycles[idx].due_DT <= today){
        var amount = this.payment.cycles[idx].due_amt;
        payments.push(idx)
      }
      payments.length > 0 ? emit(this._id,payments) : {}
    }
  }

  const ReduceFunction = function(k,vals){  
    return({k,vals})
  }

  

  LCDB.mapReduce({map:MapFunction,reduce:ReduceFunction}, function(error,results){
    if(error)
      console.log(error)
    else {
      results.results.map((prop,key)=>{
        console.log(prop)
        LCDB.findById(prop._id._id)
        .populate('supplier',['name'])
        .exec(function(error,LC){
          if(error){
            console.log(error)
            return
          } else{
              const vals = Array.isArray(prop.value)? prop.value:prop.value.vals
              const total = vals.reduce((total,prop,key)=>{
                LC.payment.cycles[prop].payed = true;
                var due_amt = parseFloat(LC.payment.cycles[prop].due_amt)
                var bill_com = Math.round(due_amt*0.003)
                var GST = Math.round(bill_com*0.18)
                var postage= 89
                console.log(LC.payment.cycles[prop])
                LC.payment.cycles[prop].pay.bill_com = bill_com
                LC.payment.cycles[prop].pay.GST = GST
                LC.payment.cycles[prop].pay.post = postage
                data.push({
                  'LC No.': LC.LC_no,
                  'Supplier': LC.supplier.name,
                  'Due Date': String(LC.payment.cycles[prop].due_DT).slice(0,10),
                  'Due Amount': parseFloat(LC.payment.cycles[prop].due_amt),
                  'Type': LC.payment.cycles[prop].pay.mode
                })
                total += due_amt
                return total
            },0)
            LC.save(function(error,LCID){
              if(error){
                console.log(error)
                console.log('LC could not be saved.')
                return
              } else {
                bankMethods.onPayment(LC.issuer,total,function(error,bank){
                  if(error){
                    console.log(error)
                    return
                  }
                  else{
                    console.log('Bank LC Limit updated! New Unutilized amount: Rs. ' + (parseFloat(bank.LC_limit)-parseFloat(bank.LC_used)) )
                  }
                })
              }
            });

            console.log(data)
            var email = {
                body: {
                    name: "LC Payment Update",
                    intro: 'The Following LCs were due today and have been marked as paid in the system.<br/>'+
                           'Please logon to the portal and update necessary details.',
                    table: {
                        data: data,
                        columns: {
                            // Optionally, customize the column widths
                            customWidth: {
                                'LC no.': '25%',
                                'Supplier': '30%',
                                'Due Date': '15%',
                                'Due Amount': '15%',
                                'Type': '15%'
                            },
                            // Optionally, change column text alignment
                            customAlignment: {
                                'Due Amount': 'right'
                            }
                        }
                    },

                    action: {
                        instructions: 'You can check the status of your order and more in your dashboard:<br>' +
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

            // Generate an HTML email with the provided contents
            var emailBody = mailGenerator.generate(email);

            // Generate the plaintext version of the e-mail (for clients that do not support HTML)
            var emailText = mailGenerator.generatePlaintext(email);

            var options = {}
            options.to = 'abhi02.1998@gmail.com'
            options.subject = 'LC Payment Update'
            options.html = emailBody
            emailer.sendMail(options)        
            require('fs').writeFileSync('preview.html', emailBody, 'utf8');
            require('fs').writeFileSync('preview.txt', emailText, 'utf8');
            callback()            
          }
        })
      })
    }
  })
}

var callExpiryApi = async () => {
    const url = 'http://localhost:3001/info/LC/expiring'
    var response = await fetch(url)
    const body = await response.json()
    if(response.status !== 200){
      console.log(response.status)
      return null
    }
    
    return EJSON.parse(body)   
  }

const onExpirationUpdate= function (callback) {
  var today = new Date (Date.now())
  today = new Date(today.setHours(0,0,0,0))
  var today7 = new Date()
  today7.setDate( today.getDate() + 5 )
  console.log(today7)
  
  const filter = function(obj){
    console.log(obj)
    var expDT = new Date(obj.expDT) // why ? because the result is from aggregation.
    var ret = (expDT <= today7)
    console.log(ret)

    return ret
  }

  callExpiryApi()
  .then((body) => {
    console.log(typeof(body))
    console.log(body)
    var LCExpiring = body.filter(filter)
    console.log(LCExpiring)
    callback()
  })
  .catch((error)=>console.log(error))
}


// using map and reduce now

const getJobSchedules = function(){
  var jobs = {}
  var rule = new cron.RecurrenceRule();
  rule.hour = 18;
  rule.minute = 5;
  rule.second = 30;
  jobs['paymentUpdate'] = cron.scheduleJob(rule,function(){
    console.log('job started.')
    onPaymentUpdate(function(){
      console.log('execution finished!')
    })
  })

  var expRule = new cron.RecurrenceRule();
  expRule.hour = 7;
  expRule.minute = 0;
  jobs['onExpirationUpdate'] = cron.scheduleJob(expRule,function(){
    onExpirationUpdate(function(){
    console.log('finished')
  })})
  return jobs
}



module.exports = {
  getJobSchedules
}