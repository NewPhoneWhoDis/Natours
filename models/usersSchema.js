const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
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
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
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

usersSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) {
        return next();
    }

    // -1 sec because the creation of the token can sometimes happen faster than the creation of changeTimestamp 
    // Simply said the token is always created after the password has been changed
    this.passwordChangedAt = Date.now() - 1000;
    next();
})

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

usersSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', usersSchema);

module.exports = User;