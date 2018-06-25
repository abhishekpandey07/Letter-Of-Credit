const mongoose = require('mongoose')
const supplierBankSchema = require('./supplier')
const ObjectID = mongoose.Schema.Types.ObjectId;

const CycleSchema = new mongoose.Schema({
    due_DT: Date,
    due_amt: { type : mongoose.Schema.Types.Decimal128, default: 0},
    payed: {
        type: Boolean,
        default: false
    },
    LB_pay_ref: String,
    acc : {
        acc: {
            type: mongoose.Schema.Types.Decimal128,
            required: true,
            default: 0
        },
        GST: {
            type: mongoose.Schema.Types.Decimal128,
            required: true,
            default: 0
        },
        TID: {
            type: String,
            default: ''
        } //transactionID for the acceptance
    },
    pay : {
        bill_com: { type : mongoose.Schema.Types.Decimal128, default: 0},
        post: { type : mongoose.Schema.Types.Decimal128, default: 0},
        GST : { type : mongoose.Schema.Types.Decimal128, default: 0},
        TID: {
            type: String,
            default: ''
        } //transactionID for the payment
    },
    documents: {
        rec: {name: String, rec: { type: Boolean, default: false}}, // receipt
        acc: {name: String, rec: { type: Boolean, default: false}}, // acceptance
        boe: {name: String, rec: { type: Boolean, default: false}}, // bill of exchange
    }
});


var LC_Payment_Schema = new mongoose.Schema({
    cycles: {
        type: [CycleSchema],
        default: []
    },
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
        open : {
            type: mongoose.Schema.Types.Decimal128,
            required: true,
            default: 0
        },
        post : {
            type: mongoose.Schema.Types.Decimal128,
            required: true,
            default: 0
        },
        amend : {
            type: mongoose.Schema.Types.Decimal128,
            required: true,
            default: 0
        },
        GST : {
            type: mongoose.Schema.Types.Decimal128,
            required: true,
            default: 0
        },
        TID : {
            type: String,
            default: ''
        } //transactionID for the LC opening/extension
    }],
    LC_no : { type : String, required : true },
    FDR_no: { type : String, },
    FDR_DT: { type : Date },
    m_amt : { type : mongoose.Schema.Types.Decimal128 },
    m_cl_DT : { type : Date },
    amount : { type : mongoose.Schema.Types.Decimal128, required : true },
    payment: LC_Payment_Schema,
    status : {type: String, enum: ['Active', 'Expired', 'InValid', 'Extended']} //may add these later 'Completed', 'Closed']},
    //lock: {type: Boolean, deafault: false}

   
});

mongoose.model('LC', LCSchema);

