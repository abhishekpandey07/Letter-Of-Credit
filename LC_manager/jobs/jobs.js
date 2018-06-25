const mongoose = require('mongoose'),
	  cron = require('node-schedule')
	  LCDB = require('../model/lc')


function lcUpdate() {
	const today = new Date(Date.now().setHours(24,0,0,0))
	console.log(today)
	LCDB.aggregate([
	    {
	      $unwind: "$payment.cycles"
	    },
	    {
	    	$mathch: {
	    		$and : [{'payment.cycles.due_DT' : [{'$lte' : today}]},
	    		        {'payment.cycles.payed' : true }]
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

	])
}

function scheduleJobs(){
	var rule2 = new cron.RecurrenceRule();
	rule2.dayOfWeek = [5,6,0];
	rule2.hour = 3;
	rule2.minute = 10;
	cron.scheduleJob(rule2, function(){
}