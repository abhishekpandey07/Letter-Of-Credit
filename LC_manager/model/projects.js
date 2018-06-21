const mongoose = require('mongoose')

var projectSchema = new mongoose.Schema({
    name : { type : String,
	     required : true },
    
    location : { type : String,
		 required : true },
    
    manager : { type : String },
        
    value : { type : mongoose.Schema.Types.Decimal128,
	      required : true },

    suppliers : [{ type : mongoose.Schema.Types.ObjectId,
    			   ref: 'Supplier' }]
});

mongoose.model('projects',projectSchema);
