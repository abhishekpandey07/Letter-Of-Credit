const mongoose = require('mongoose')

var UserSchema = new mongoose.Schema({
    name :{
    	type : String,
	    required : true
	},
    
    _id :{
    	type : Number,
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
    
    username : {
    	type: String,
    	unique: true,
    	required: true,
    	trim: true
	},

    password : {
    	type: String,
    	required: true,
	},

});

const Users = mongoose.model('Users',UserSchema);

module.exports = Users 
