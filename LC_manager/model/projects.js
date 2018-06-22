const mongoose = require('mongoose')

var projectSchema = new mongoose.Schema({
    name : { type : String,
	     required : true },

	client : { type : String,
	     required : true },
    
    location : { type : String,
		 required : true },
    
    managerName : String,

    managerContact : Number,

    value : { type : mongoose.Schema.Types.Decimal128,
	      required : true },

    suppliers : [{ type : mongoose.Schema.Types.ObjectId,
    			   ref: 'Supplier' }]
    });

mongoose.model('projects',projectSchema);
