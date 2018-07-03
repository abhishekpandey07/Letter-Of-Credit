const mongoose = require('mongoose')

var UserSchema = new mongoose.Schema({
    name :{
    	type : String,
	    required : true
	},
    _id: {
        type:Number,
        required: true,
    },
    role : {
    	type: String,
    	required: true
    },

    email: {
    	type: String,
    	unique: true,
    	required: true,
    	trim: true
	},
    
    /*username : {
    	type: String,
    	unique: true,
    	required: true,
    	trim: true
	},*/

    password : {
    	type: String,
    	required: true,
	},
    created: {
        type: Date,
        default: new Date(Date.now())
    },
    lastLogin: Date

});

const Users = mongoose.model('Users',UserSchema);

module.exports = Users 
