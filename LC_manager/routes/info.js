const express = require('express'),
      router = express.Router(),
      mongoose = require('mongoose'),
      bodyParser = require('body-parser'),
      methodOverride = require('method-override'),
      bankDB = mongoose.model('nativeBanks')
      LCDB = mongoose.model('LC')

objectID = mongoose.Types.ObjectId;

router.use(bodyParser.urlencoded({ extended: true }))

// no idea what this code does
router.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}))


router.route('/')
      .get(function(req,res){
        const curMonth = (new Date).getMonth()
        console.log('current month : '+ curMonth)
        try{
        LCDB.aggregate([
            /*{
              $addFields:{
                month: { $month : { $arrayElemAt : ["$payment.DT_amt", -1] }}
              }

            },*/
            /*{
              $redact : {
                $cond : {
                    if : { $eq : ["$status","Expired"] },
                    then: "$$PRUNE",
                    else: "$$KEEP"
                }
              }
            },*/
            {
              $lookup : {
                from:"nativebanks",
                localField: "issuer",
                foreignField: "_id",
                as: "issuingBank"
              }
            },
            {
              $lookup : {
                from: "suppliers",
                localField: "supplier",
                foreignField: "_id",
                as: "supplierd"
              }
            },
            /*{
              $project: {
                dueDetails : {$arrayElemAt : ["$payment.DT_amt", -1 ]},
                issuer : 1,
                supplier: 1,
                supBank: 1,
                LC_no: 1,
                supplierd: 1,
                issuingBank: 1,
              }
            },*/
            {
              $addFields: {
                dueDate : {$arrayElemAt : ["$payment.DT_amt", -1 ]}
              }
            },
            {
              $group: {
                _id : { month: {$month : "$dueDate.due_DT"}},
                total_Due : {$sum : "$dueDate.due_amt"},
                LCs : {
                  $push: { LC_no : "$LC_no", issuer: "$issuer.name", supplier: "$supplierd.name", supBank : "$supBank"
                           ,supplierBank: {
                            $filter : {
                              input : "$supplierd.banks[0]",
                              as : "bank",
                              cond : { "$eq" : [ {"$cmp" : ["$supBank","$$bank._id"]},0]}
                            }
                           }}
                }
              }
            },
            {
              $match : {
                "_id.month" : { $ne :  null }
              }
            }

        ]).exec(function(error,dueThisMonth){
          if(error){
            console.log(error)

          }else{
            console.log(JSON.stringify(dueThisMonth))
          }
        })
      }catch(error){
        console.log(error)
      } 
      })

router.route('/cycle').get(function(req,res){
  LCDB.aggregate([
      {
        $project: {
          dueDetails : "$payment.DT_amt"
        }
      },
      {
        $unwind: "$dueDetails"
      },
      {
        $group: {
          _id : {month : {$month: "$dueDetails.due_DT"}, year : {$year : "$dueDetails.due_DT"} },
          dueAmount : { $sum : "$dueDetails.due_amt"},

          count : { $sum : 1}
        }
      },
      {
        $match : {
          "_id.month" : { $ne : null}
        }
      },
      {
        $sort : {"_id.year" : 1 , "_id.month" : 1}
      }
    ]).exec(function(error, dist){
      if(error){
        console.log(error)
        res.end(error)
      }else{
        res.format({
          json: function(){
            res.json(JSON.stringify(dist))
          }
        })
      }
    })
  
})

router.route('/thisWeek').get(function(req,res){
  var today = new Date(Date.now())
  console.log(today)
  var sunday = new Date()
  sunday.setDate(today.getDate() - today.getDay())
  var nextSunday = new Date()
  nextSunday.setDate(sunday.getDate() + 7)

  console.log('today: ' + today)
  console.log('sunday: ' + sunday)
  console.log('nextSunday: ' + nextSunday)
  LCDB.aggregate([
    {
      $lookup : {
        from:"nativebanks",
        localField: "issuer",
        foreignField: "_id",
        as: "issuingBank"
      }
    },
    {
      $lookup : {
        from: "suppliers",
        localField: "supplier",
        foreignField: "_id",
        as: "supplierd"
      }
    },
    {
      $addFields : {
        dueDetails : {$arrayElemAt : ["$payment.DT_amt", -1 ]}
      }
    },
    {
      $match: {
         "dueDetails.due_DT": { $gte: sunday , $lt: nextSunday }
      }
    },
    {
      $group: {
        _id : "$issuingBank.name",
        amount : {$sum: "$dueDetails.due_amt"},
        LC : {$push : {supplier : "$supplierd.name", LC_no: "$LC_no", payment : "$dueDetails"}},
        count : {$sum : 1}
      }
    }
  ]).exec(function(error,LCs){
    if(error){
      console.log(error)
      
      res.end(error)
    }else{
      console.log(LCs)
      res.format({
        json: function(){
          res.json(JSON.stringify(LCs))
        }
      })
    }
  })
})

// Remember that the :month parameter must start from base 1 for aggregation.
router.route('/month').get(function(req,res){
  LCDB.aggregate([
    {
      $lookup : {
        from:"nativebanks",
        localField: "issuer",
        foreignField: "_id",
        as: "issuingBank"
      }
    },
    {
      $lookup : {
        from: "suppliers",
        localField: "supplier",
        foreignField: "_id",
        as: "supplierd"
      }
    },
    {
      $addFields : {
        dueDetails : {$arrayElemAt : ["$payment.DT_amt", -1 ]},
      }
    },
    {
      $sort : {"dueDetails.due_DT" : 1}
    },
    {
      $group: {
        _id : { issuer : "$issuingBank.name" ,month : {$month: "$dueDetails.due_DT"}, year : {$year : "$dueDetails.due_DT"} },
        amount : {$sum: "$dueDetails.due_amt"},
        LC : {$push : {supplier : "$supplierd.name", LC_no: "$LC_no", payment : "$dueDetails", issuer : "$issuingBank.name"}},
        count : {$sum : 1}
      }
    },
    {
      $match : {
        "_id.month" : { $ne : null}
      }
    },
    {
      $sort : {"_id.year" : 1,"_id.month":1}
    }
  ]).exec(function(error,LCs){
    if(error){
      console.log(error)
      
      res.end(error)
    }else{
      console.log(LCs)
      res.format({
        json: function(){
          res.json(JSON.stringify(LCs))
        }
      })
    }
  })
})

// TODO : Add a routine to get all the LCs expiring in 14 days.

module.exports = router;