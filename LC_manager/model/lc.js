const mongoose = require('mongoose')
const ObjectID = mongoose.Schema.Types.ObjectId;
const CycleSchema = new mongoose.Schema({
    due_DT: {
        type: Date
    },
    payed_DT: {
        type: Date
    },
    due_amt: {
        type: mongoose.Schema.Types.Decimal128,
        default: 0
    },
    payed: {
        type: Boolean,
        default: false
    },
    LB_pay_ref: String,
    acc: {
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
    pay: {
        bill_com: {
            type: mongoose.Schema.Types.Decimal128,
            default: 0
        },
        post: {
            type: mongoose.Schema.Types.Decimal128,
            default: 0
        },
        GST: {
            type: mongoose.Schema.Types.Decimal128,
            default: 0
        },
        mode: {
            type: String,
            enum: ['Not Payed', 'Not Updated', 'Regular', 'Devolved'],
            default: 'Not Payed'
        },
        TID: {
            type: String,
            default: ''
        } //transactionID for the payment
    },
    documents: {
        rec: {
            name: String,
            rec: {
                type: Boolean,
                default: false
            }
        }, // receipt
        acc: {
            name: String,
            rec: {
                type: Boolean,
                default: false
            }
        }, // acceptance
        boe: {
            name: String,
            rec: {
                type: Boolean,
                default: false
            }
        }, // bill of exchange
    }
});


var LC_Payment_Schema = new mongoose.Schema({
    cycles: {
        type: [CycleSchema],
        default: []
    },
    total_due: {
        type: mongoose.Schema.Types.Decimal128,
        default: 0
    },
    total_payed: {
        type: mongoose.Schema.Types.Decimal128,
        default: 0
    }
});

var LCSchema = new mongoose.Schema({
    issuer: {
        type: ObjectID,
        ref: 'banks',
        required: true
    },
    supplier: {
        type: ObjectID, // can use projection to get name
        ref: 'Supplier',
        required: true
    },
    project: {
        type: ObjectID,
        ref: 'projects',
        required: true
    },
    supBank: {
        type: ObjectID
    },

    dates: [{
        openDT: {
            type: Date,
            required: true,
            default: Date.now
        },
        expDT: {
            type: Date,
            required: true,
        },
        bc: {
            name: String,
            rec: {
                type: Boolean,
                default: false
            }
        }, // bank charges document
        app: {
            name: String,
            rec: {
                type: Boolean,
                default: false
            }
        }, // application document
        open: {
            type: mongoose.Schema.Types.Decimal128,
            required: true,
            default: 0
        },
        post: {
            type: mongoose.Schema.Types.Decimal128,
            required: true,
            default: 0
        },
        amend: {
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
        } //transactionID for the LC opening/extension
    }],
    LC_no: {
        type: String,
        required: true
    },
    FDR_no: {
        type: String,
    },
    FDR_DT: {
        type: Date
    },
    m_amt: {
        type: mongoose.Schema.Types.Decimal128,
        default: 0
    },
    m_cl_DT: {
        type: Date
    },
    m_cl_amt: {
        type: mongoose.Schema.Types.Decimal128,
        default: 0
    },
    amount: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
        min: 0
    },
    payment: LC_Payment_Schema,
    closeDT: Date,
    status: {
        type: String,
        enum: ['Active', 'Expired', 'InValid', 'Extended', 'Closed']
    }

});

mongoose.model('LC', LCSchema);