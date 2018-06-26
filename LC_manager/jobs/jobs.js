const mongoose = require('mongoose'),
    cron = require('node-schedule')
    lc = require('../model/lc')
    LCDB = mongoose.model('LC')
    bankMethods = require('../routes/helpers/nativeBanks')



function lcupdate() {

const MapFunction = function() {
  var today = new Date(new Date(Date.now()).setHours(24,0,0,0))
  for(var idx = 0 ; idx < this.payment.cycles.length; idx ++){
    var payments = []
    if(this.payment.cycles[idx].payed != true && this.payment.cycles[idx].due_DT < today){
      var amount = this.payment.cycles[idx].due_amt;
      payments.push(idx)
    }
    payments.length > 0 ? emit(this._id,payments) : {}
  }
}

const ReduceFunction = function(k,vals){  
  return({k,vals})
}

  
  /*var today = new Date(new Date(Date.now()).setHours(24,0,0,0))  

  LCs = LCDB.aggregate([
    {
      $unwind : '$payment.cycles'
    },
    {
      $match : {
        $and : [{'payment.cycles.due_DT' : {$lte : today}}, {'payment.cycles.payed' : false}]
      }
    },
    {
      $project:{
        _id: 1,
        'issuingBank._id' : 1,
        LC_no : 1,
        payment : '$payment.cycles.due_amt'
      }
      
    }
  ]).exec(function (error,LCs){
    if(error){
      console.log(error)
    } else{
      // routine to update LC payed.
      // Need to free utilized from bank.
      console.log(LCs)
      LCs.map((LC,key)=>{
        LCDB.findById(LC._id, function(error,LoadedLC) => {

        }) 
      })
      

    }
    return
  })*/

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
              total += parseFloat(LC.payment.cycles[prop].due_amt)
              return total
            },0)
            conosle.log
            bankMethods.onPayment(LC.issuer,total,function(error,bank){
              if(error){
                console.log(error)
                return
              }
              else{

                console.log('Bank LC Limit updated! New Unutilized amount: Rs. ' + (parseFloat(bank.amount)-parseFloat(bank.LC_used)) )
              }
            })
          }
        })
      })
    }
  })
}

/*function scheduleJobs(){
  var rule2 = new cron.RecurrenceRule();
  rule2.dayOfWeek = [5,6,0];
  rule2.hour = 3;
  rule2.minute = 10;
  cron.scheduleJob(rule2, function(){
}*/


// using map and reduce now




module.exports = {
  lcupdate
}