//created by Hatem Ragap
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const Joi = require('joi');

var userSchema = mongoose.Schema({
    user_name: {
        type: String,
        max: 30,
        min: 5
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        max: 50,
        min: 5
    },

    token: {type: String, default: ''},
    password: {
        type: String,
        required: true,
        min: 6,
    },
    img: {
        type: String,
        default: 'default-user-profile-image.png'

    },
    bio: {
        type: String,
        default: 'Hi iam using V Chat App'
    },


    created: {
        type: Number, default: Date.now
    },


});
userSchema.plugin(uniqueValidator);
var userSchemaModel = mongoose.model('users', userSchema);

module.exports = {
    userSchemaModel,
}
