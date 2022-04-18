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
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: true,
        // Only works on save and create
        validate: function (el) {
            return el === this.password
        },
        message: 'Passwords are not the same!'
    },
    passwordChangedAt: Date
});

usersSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    // Hashes the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Deletes passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

usersSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

usersSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        return JWTTimestamp < changedTimestamp;
    }

    return false;
}

const User = mongoose.model('User', usersSchema);

module.exports = User;