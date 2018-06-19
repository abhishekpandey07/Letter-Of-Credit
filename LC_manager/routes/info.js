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

module.exports = router;