const mongoose = require('mongoose')
const supplierBankSchema = require('./supplier')
var ObjectID = mongoose.Schema.Types.ObjectId;

var LC_Payment_Schema = new mongoose.Schema({
    DT_amt: [{
	due_DT : { type : Date },
	due_amt : { type : mongoose.Schema.Types.Decimal128, default: 0},
	payed_amt : { type : mongoose.Schema.Types.Decimal128, default: 0},
    LB_pay_ref: {type: String},
    rec: {name: String, rec: { type: Boolean, default: false}}, // material receipt
    acc: {name: String, rec: { type: Boolean, default: false}}, // bank acceptance
    }],
    total_due: { type : mongoose.Schema.Types.Decimal128,  default: 0 },
    total_payed: { type : mongoose.Schema.Types.Decimal128, default: 0 }
});

var LCSchema = new mongoose.Schema({
    issuer: { type: ObjectID,
	      ref: 'nativeBanks',
	      required : true },
    supplier : { type : ObjectID, // can use projection to get name
		 ref : 'Supplier',
		 required : true },
    project : { type : ObjectID, 
         ref : 'projects',
         required : true },
    supBank : { type : ObjectID},
                 
    dates: [{
    	openDT :{ type : Date, required : true, default : Date.now},
    	expDT : { type : Date, required : true, },
        bc: {name: String, rec: { type: Boolean, default: false}}, // bank charges document
        app: {name: String, rec: { type: Boolean, default: false}}, // application document
    }],
    LC_no : { type : String, required : true },
    FDR_no: { type : String, },
    FDR_DT: { type : Date },
    m_amt : { type : mongoose.Schema.Types.Decimal128 },
    m_cl_DT : { type : Date },
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
    status : {type: String, enum: ['Active', 'Expired', 'InValid', 'Extended']} //may add these later 'Completed', 'Closed']},
    //lock: {type: Boolean, deafault: false}

   
});

mongoose.model('LC', LCSchema);

