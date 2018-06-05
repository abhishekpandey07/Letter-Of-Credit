const mongoose = require('mongoose')
var supplierBankSchema  = new mongoose.Schema({
    name : { type : String,
	     required : true },
    branch : { type : String,
	     required : true },
    IFSC : { type : String,
	     required : true },
});

mongoose.model('supplierBanks', supplierBankSchema);
