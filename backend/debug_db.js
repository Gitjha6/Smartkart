const mongoose = require('mongoose');
const User = require('./models/User');
const Shop = require('./models/Shop');
const dotenv = require('dotenv');

dotenv.config();

const debugDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Find the Mock Google User
        const user = await User.findOne({ email: 'google_user@test.com' });
        if (!user) {
            console.log('User not found!');
            return;
        }

        console.log('User found:', user.name);
        console.log('User ID:', user._id);
        console.log('User Role:', user.role);
        console.log('User ShopDetails:', user.shopDetails);

        // Find Shop by Owner
        const shop = await Shop.findOne({ owner: user._id });
        if (!shop) {
            console.log('Shop not found for this user!');
        } else {
            console.log('Shop found:', shop.name);
            console.log('Shop ID:', shop._id);
            console.log('Shop Owner:', shop.owner);
        }

        if (shop && !user.shopDetails) {
            console.log('MISMATCH: Shop exists but User.shopDetails is missing.');
        } else if (shop && user.shopDetails && shop._id.toString() !== user.shopDetails.toString()) {
            console.log('MISMATCH: Shop IDs do not match.');
            console.log(`User has: ${user.shopDetails}, Actual Shop is: ${shop._id}`);
        } else {
            console.log('Link seems correct (or both missing).');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

debugDB();
