const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const util = require('util');

var UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    _id: {
        type: Number,
        required: true,
    },
    role: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        default: new Date(Date.now())
    },
    lastLogin: Date,
    locked: {
        type: Boolean,
        required: true,
        default: false
    }
});

UserSchema.methods.verifyPassword = async function(password){
    try{
      const same = await bcrypt.compare(password,this.password)
      return same
    } catch(error) {
      throw new Error('password could not be verified');
    }
};

const Users = mongoose.model('Users', UserSchema);

module.exports = Users