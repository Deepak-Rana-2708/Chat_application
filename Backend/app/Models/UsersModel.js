const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    authProvider: {
        type: String,
        enum: ['local', 'google']
    },
    googleId: {
        type: String,
        default: null
    },
    customerId: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'deactive'],
        default: 'active'
    },
    otp: {
        type: String,
    },
    otpExpiry: {
        type: Number,
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;