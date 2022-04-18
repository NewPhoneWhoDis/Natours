const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name!'],
        unique: true,
    },
    email: {
        type: String,
        required: [true, 'A user must have an email!'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email!']
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'A user must have a password!'],
        minlength: [8, 'A username must have more or equal then 8 characters'],
    },
    passwordConfirm: {
        type: String,
        required: true,
        // Only works on save and create
        validate: function (el) {
            return el === this.password
        },
        message: 'Passwords are not the same!'
    }
});

usersSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    // Hashes the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Deletes passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

const User = mongoose.model('User', usersSchema);

module.exports = User;