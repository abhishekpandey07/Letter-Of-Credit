const mongoose = require('mongoose')
var nativeBankSchema = new mongoose.Schema({
    name : { type : String,
	     required : true },
    
    branch : { type : String,
	       required : true },

    IFSC : { type : String }, // can put required = true after verifying.
    
    LC_limit : { type : mongoose.Schema.Types.Decimal128,
		 required : true },
    
    LC_used : { type : mongoose.Schema.Types.Decimal128,
		required : true },
    
    LCs : [{
	type : mongoose.Schema.Types.ObjectId,
	ref : 'LC',
    }] // array of letter of credits
});

mongoose.model('nativeBanks', nativeBankSchema);
