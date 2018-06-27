const mongoose = require('mongoose'),
    cron = require('node-schedule')
    lc = require('../model/lc')
    LCDB = mongoose.model('LC')
    bankMethods = require('../routes/helpers/nativeBanks')
    fetch = require('node-fetch')
    EJSON = require('mongodb-extended-json')

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
        LCDB.findById(prop._id._id, function(error,LC){
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

              LC.payment.cycles[prop].pay.bill_com = bill_com
              LC.payment.cycles[prop].pay.GST = GST
              LC.payment.cycles[prop].pay.post = postage

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
                    callback()
                  }
                })
              }
            });            
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
  rule.hour = 7;
  rule.minute = 0;
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