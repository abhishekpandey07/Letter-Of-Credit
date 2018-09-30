const mongoose = require('mongoose')
var projectSchema = new mongoose.Schema({
    WO_no: String,

    WO_DT: Date,

    name: {
        type: String,
        required: true
    },

    client: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    startDT: Date,

    stipEndDT: Date,

    expcEndDT: Date,

    value: {
        type: mongoose.Schema.Types.Decimal128,
        required: true
    },

    variation: mongoose.Schema.Types.Decimal128,

    finalBill: mongoose.Schema.Types.Decimal128,

    status: {
        type: String,
        enum: ['running', 'completed', 'arbitrated'],
    },

    managerName: String,

    managerContact: Number,

    // Add more details for arbitration later.

    arbLoc: String,

    arbId: String,

    suppliers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier'
    }]
});

mongoose.model('projects', projectSchema);