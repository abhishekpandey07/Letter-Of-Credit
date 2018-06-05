const mongoose = require('mongoose')
var ObjectID = mongoose.Schema.Types.ObjectId;

var LC_Payment_Schema = new mongoose.Schema({
    DT_amt: [{
	due_DT : { type : Date, required : true },
	due_amt : { type : mongoose.Schema.Types.Decimal128, required : true },
	payed_amt : { type : mongoose.Schema.Types.Decimal128, required : true, default: 0 }
    }],
    total_due: { type : mongoose.Schema.Types.Decimal128, required : true, default: 0 },
    total_payed: { type : mongoose.Schema.Types.Decimal128, required : true, default: 0 }
});

var LCSchema = new mongoose.Schema({
    issuer: { type: ObjectID,
	      ref: 'nativeBanks',
	      required : true },
    supplier : { type : ObjectID, // can use projection to get name
		 ref : 'Supplier',
		 required : true },
    dates: [{
	openDT :{ type : Date, required : true, default : Date.now},
	expDT : { type : Date, required : true, }
    }],
    LC_no : { type : String, required : true },
    FDR_no: { type : String, required : true },
    FDR_DT: { type : Date, default : Date.now },
    m_amt : { type : mongoose.Schema.Types.Decimal128, required : true },
    m_cl_DT : { type : String },
    amount : { type : mongoose.Schema.Types.Decimal128, required : true },
    payment: LC_Payment_Schema,
    ex_cha : { charges : { opening : mongoose.Schema.Types.Decimal128,                // miscellaneous charges
			  amendment : mongoose.Schema.Types.Decimal128,
			  bill_of_ex_acc : mongoose.Schema.Types.Decimal128,
			  postal : mongoose.Schema.Types.Decimal128,
			  GST : mongoose.Schema.Types.Decimal128,
			  disbursement : mongoose.Schema.Types.Decimal128
			},
	       total : mongoose.Schema.Types.Decimal128
	     },
    status : {type: String, enum: ['Active', 'Expired', 'InValid', 'Extended']},
    documents : [ String ] // storing addresses to uploaded documents
   
});

mongoose.model('LC', LCSchema);

