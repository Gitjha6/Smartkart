const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: false, // For Google Login users
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false,
    },
    role: {
        type: String,
        enum: ['customer', 'shopkeeper', 'admin'],
        default: 'customer',
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    shopDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
    },
}, {
    timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
module.exports = User;
