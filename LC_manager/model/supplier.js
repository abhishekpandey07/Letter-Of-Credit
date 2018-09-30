const mongoose = require('mongoose')

var supplierBankSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    branch: {
        type: String,
        required: true
    },

    IFSC: {
        type: String,
        required: true
    },

    LCs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "LC",
        required: true
    }]

});

// schema for supplier entity
var supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "projects"
    }], // can supply to multiple projects
    banks: [supplierBankSchema], // can have multiple bank accounts
});

mongoose.model('Supplier', supplierSchema);

module.exports = supplierBankSchema