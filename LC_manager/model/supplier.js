const mongoose = require('mongoose')

var supplierBankSchema  = new mongoose.Schema({
    name : { type : String,
	     required : true },
    branch : { type : String,
	     required : true },
    IFSC : { type : String,
	     required : true },
});

// schema for supplier entity
var supplierSchema = new mongoose.Schema({
    name : { type: String, required: true },
    city : { type: String, required: true },
    projects : [mongoose.Schema.Types.ObjectId],              // can supply to multiple projects
    banks : [supplierBankSchema],    // can have multiple bank accounts
    LCs : [{ type : mongoose.Schema.Types.ObjectId,
	     ref : "LC",
	     required : true }]
           // commenting out because can use populate to find fields.
	   //status: {type : String, enum: ["Active", "Expired"]}]   // can have multiple LCs 
    
});

mongoose.model('Supplier', supplierSchema);
