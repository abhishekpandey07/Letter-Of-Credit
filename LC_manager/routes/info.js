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
              $addFields: {
                dueDate : {$arrayElemAt : ["$payment.cycles", -1 ]}
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
      
      })

router.route('/cycle').get(function(req,res){
  LCDB.aggregate([
      {
        $project: {
          dueDetails : "$payment.cycles"
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
        dueDetails : {$arrayElemAt : ["$payment.cycles", -1 ]}
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
      $unwind : "$payment.cycles"
    },
    {
      $sort : {"payment.cycles.due_DT": 1}
    },
    {
      $group: {
        _id : { issuer : "$issuingBank.name" ,month : {$month: "$payment.cycles.due_DT"}, year : {$year : "$payment.cycles.due_DT"} },
        amount : {$sum: "$payment.cycles.due_amt"},
        LC : {$push : {supplier : "$supplierd.name", LC_no: "$LC_no", payment : "$payment.cycles", issuer : "$issuingBank.name"}},
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

router.route('/payment/14').get(function(req,res){
  const today = new Date((new Date(Date.now())).setHours(0,0,0,0))
  const next14 = new Date
  next14.setDate(today.getDate() + 14)
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
      $unwind : "$payment.cycles"
    },
    {
      $sort : {"payment.cycles.due_DT": 1}
    },
    {
      $match : {
        $and: [{"payment.cycles.due_DT" : {$gte : today , $lte : next14}}]
      }
    },    
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
router.route('/LC/expiring').get(function (req,res) {
  const today = new Date((new Date(Date.now())).setHours(0,0,0,0))
  const next14 = new Date
  next14.setDate(today.getDate() + 14)
  LCDB.aggregate([
    {
      $lookup : {
        from:"nativebanks",
        localField: "issuer",
        foreignField: "_id",
        as: "issuerData"
      }
    },
    {
      $lookup : {
        from: "suppliers",
        localField: "supplier",
        foreignField: "_id",
        as: "supplierData"
      }
    },
    {
      $lookup : {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "projectData" 
      } 
    },
    {
      $addFields:{
        date: {$arrayElemAt : ["$dates", -1 ]}
      }
    },
    {
      $sort : {"date.expDT": 1}
    },
    {
      $match : {
        $and: [{"date.expDT" : {$gte : today , $lte : next14}},
                {"status" : {$ne : "Expired"}}
              ]
      }
    },
    {
      $project : {
        expDT: "$date.expDT",
        amount : 1,
        unUtilized: { $subtract : ["$amount","$payment.total_due"]},
        supplier: "$supplierData.name",
        issuer : "$issuerData.name",
        project : "$projectData.name",
        LC_no : 1
      }
    }
  ]).exec(function (error,info) {
    if(error){
      console.log(error)
      res.status = 500
      res.end(error)
    } else{
      res.format({
        json:function () {
          res.json(JSON.stringify(info))
        }
      })
    }
  })
})


// TODO : Add a routine to get all the LCs expiring in 14 days.
router.route('/30days').get(function (req,res) {
  const today = new Date(Date.now())
  const next14 = new Date
  next14.setDate(today.getDate() + 30)
  LCDB.aggregate([
    {
      $lookup : {
        from:"nativebanks",
        localField: "issuer",
        foreignField: "_id",
        as: "issuerData"
      }
    },
    {
      $lookup : {
        from: "suppliers",
        localField: "supplier",
        foreignField: "_id",
        as: "supplierData"
      }
    },
    {
      $lookup : {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "projectData" 
      } 
    },
    {
      $unwind : "$payment.cycles"
    },
    /*{
      $addFields:{
        dueDetails: {$arrayElemAt : ["$payment.cycles", -1 ]}
      }
    },*/
    {
      $match : {
        "payment.cycles.due_DT" : {$gte : today , $lte : next14}
      }
    },
    {
      $sort : {"payment.cycles.due_DT": 1}
    },
    {
      $project : {
        dueDT: "$payment.cycles.due_DT",
        amount : "$payment.cycles.due_amt",
        supplier: "$supplierData.name",
        LC_no : 1,
        issuer : "$issuerData.name",
        project : "$projectData.name",
      }
    }
  ]).exec(function (error,info) {
    if(error){
      console.log(error)
      res.status = 500
      res.end(error)
    } else{
      res.format({
        json:function () {
          res.json(JSON.stringify(info))
        }
      })
    }
  })
})

module.exports = router;