const mongoose = require('mongoose');

const shopSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    pincode: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    // Location stored as [longitude, latitude] for geospatial queries
    location: {
        type: {
            type: String, // Don't do { location: { type: String } }
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    rating: {
        type: Number,
        required: true,
        default: 0,
    },
    numReviews: {
        type: Number,
        required: true,
        default: 0,
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }]
}, {
    timestamps: true,
});

shopSchema.index({ location: '2dsphere' }); // Create 2dsphere index for location queries

const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;
