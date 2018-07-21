const mongoose = require('mongoose'),
    cron = require('node-schedule')
    lc = require('../model/lc')
    LCDB = mongoose.model('LC')
    bankMethods = require('../routes/helpers/nativeBanks')
    fetch = require('node-fetch')
    EJSON = require('mongodb-extended-json')
    Mailgen = require('mailgen')
    genAndSend = require('./emailer/genAndSend.js')
    formatter = require('../utils/common.js')

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

var callPaymentApi = async () => {
    const url = 'http://localhost:3001/info/payment/14'
    var response = await fetch(url)
    const body = await response.json()
    if(response.status !== 200){
      console.log(response.status)
      return null
    }
    
    return EJSON.parse(body)   
  }

function onPaymentUpdate(callback) {

  const MapFunction = function() {
    var today = new Date(new Date(Date.now()).setHours(24,0,0,0))
    for(var idx = 0 ; idx < this.payment.cycles.length; idx ++){
      var payments = []
      if(this.payment.cycles[idx].payed != true &&
         this.payment.cycles[idx].due_DT <= today &&
         this.status != 'Closed'){
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
        .populate('issuer',['name'])
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
                  'Issuer': LC.issuer.name,
                  'LC No.': LC.LC_no,
                  'Supplier': LC.supplier.name,
                  'Due Date': String(LC.payment.cycles[prop].due_DT).slice(0,10),
                  'Due Amount': formatter.formatAmount(parseFloat(LC.payment.cycles[prop].due_amt)),
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
          }
        })
      })
      // only send if something to send.
      data.length > 0 ? genAndSend.genAndSendPaymentEmail(data) : {}
      callback()
    }
  })
}

var total = 0
const weekPaymentUpdate = function (callback) {
  callPaymentApi()
  .then((body) => {
    total = 0
    if(body.length > 0){
      var emailData = body.reduce((acc,prop,key)=>{
        acc.push({
          'Issuer': prop.issuingBank[0].name,
          'LC no.': prop.LC_no,
          'Supplier': prop.supplierd[0].name,
          'Due Date': String(prop.payment.cycles.due_DT).slice(0,10),
          'Due Amount': formatter.formatAmount(parseFloat(prop.payment.cycles.due_amt)),
        })
        total += parseFloat(prop.payment.cycles.due_amt)
        return acc
      },[])
      emailData.push({
        'Due Date': 'Total',
        'Due Amount': formatter.formatAmount(total)
      })
      //genAndSend.genAndSendPayWeekEmail(emailData)
      console.log(emailData)
    }
    callback()
  })
  .catch((error)=>console.log(error))
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


const filterExpirationData = function(obj){
    var today = new Date (Date.now())
    today = new Date(today.setHours(24,0,0,0))
    console.log(obj)
    var expDT = new Date(obj.expDT) // why ? because the result is from aggregation.
    var ret = (expDT <= today)
    console.log(ret)

    return ret
  }

const dayExpirationUpdate= function (callback) {
  //var today7 = new Date()
  //today7.setDate( today.getDate())
  //console.log(today7)

  callExpiryApi()
  .then((body) => {
    var LCExpiring = body.filter(filterExpirationData)
    if(LCExpiring.length > 0){
      var emailData = LCExpiring.reduce((acc,prop,key)=>{
        acc.push({
          'Issuer': prop.issuer[0],
          'LC no.': prop.LC_no,
          'Supplier': prop.supplier[0],
          'Expiration Date': String(prop.expDT).slice(0,10),
          'Amount': formatter.formatAmount(parseFloat(prop.amount)),
          'Unused': formatter.formatAmount(parseFloat(prop.unUtilized)),
        })
        return acc
      },[])
      genAndSend.genAndSendExpDayEmail(emailData)
    }
    callback()
  })
  .catch((error)=>console.log(error))
}

const weekExpirationUpdate = function (callback) {
  callExpiryApi()
  .then((body) => {
    
    if(body.length > 0){
      var emailData = body.reduce((acc,prop,key)=>{
        acc.push({
          'Issuer': prop.issuer[0],
          'LC no.': prop.LC_no,
          'Supplier': prop.supplier[0],
          'Expiration Date': String(prop.expDT).slice(0,10),
          'Amount': formatter.formatAmount(parseFloat(prop.amount)),
          'Unused': formatter.formatAmount(parseFloat(prop.unUtilized)),
        })
        return acc
      },[])
      genAndSend.genAndSendExpWeekEmail(emailData)
    }
    callback()
  })
  .catch((error)=>console.log(error))
}

/* Should the Letter of Credits be automatically expiring ?*/
const LCExpiryAction = function(callback) {
  callExpiryApi()
  .then((body) => {
    var LCExpiring = body.filter(filterExpirationData);
    LC.Expiring.map((prop,key) => {
      LCDB.find({_id:prop._id},function(error,LC){
        if(error){
          console.log('Error retreiving LC')  
        } else {
          LC.status = 'Expired';
          LC.save(function(error,LCID){
            console.log('LC with ID : ' + prop._id + ' was successfully marked as expired')
          })
        }
      })
      console.log(LC.length + ' Letters of credit were marked as expired.')
      callback()
    })
  })
  .catch((error) => {console.log(error)})
}


// using map and reduce now

const getJobSchedules = function(){
  var jobs = {}
  var rule = new cron.RecurrenceRule();
  // everyday at 9 am. NO->(15th second)
  rule.hour = 0;
  rule.minute = 48;
  rule.second = 45;

  jobs['paymentUpdate'] = cron.scheduleJob(rule,function(){
    console.log('Sending Payment Update Emails.')
    onPaymentUpdate(function(){
      console.log('execution finished!')
    })
  })

  var dayExpRule = new cron.RecurrenceRule();
  
  // everyday at 9 a.m.
  dayExpRule.hour = 9;
  dayExpRule.minute = 0;
  dayExpRule.second = 0;
  
  jobs['dayExpirationUpdate'] = cron.scheduleJob(dayExpRule,function(){
    console.log(' Sending day Expiration Emails.')
    dayExpirationUpdate(function(){
    console.log('finished')
  })})

  var LCExpiryActionRule = new cron.RecurrenceRule();
  LCExpiryActionRule.hour=23;
  LCExpiryActionRule.minute=59;
  LCExpiryActionRule.second=0;

  jobs['LCExpiryAction'] = cron.scheduleJob(LCExpiryActionRule,function(){
    console.log(' Sending day Expiration Emails.')
    LCExpiryAction(function(){
    console.log('finished')
  })})


  var weekExpRule = new cron.RecurrenceRule();

  weekExpRule.dayOfWeek = 1 //monday
  weekExpRule.hour = 9;
  weekExpRule.minute = 0;  // 9 a.m.
  weekExpRule.second = 0;

  jobs['weekExpirationUpdate'] = cron.scheduleJob(weekExpRule,function(){
    console.log('Sending Weekly Expiration Update Emails.')
    weekExpirationUpdate(function(){
      console.log('finished')
    })
  })

  weekPayRule = new cron.RecurrenceRule();
  weekPayRule.dayOfWeek = 1 //monday
  weekPayRule.hour = 9;
  weekPayRule.minute = 0;  // 9 a.m.
  weekPayRule.second = 0;

  jobs['weekPaymentUpdate'] = cron.scheduleJob(weekPayRule,function(){
    console.log('Sending Weekly Payment Update Emails.')
    weekPaymentUpdate(function(){
      console.log('finished')
    })
  })

  return jobs
}



module.exports = {
  getJobSchedules
}
