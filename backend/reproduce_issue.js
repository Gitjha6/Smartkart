const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB Connected');

        // Find the Mock Google User
        const user = await User.findOne({ email: 'google_user@test.com' });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        console.log(`Found User: ${user.name}`);

        // Trigger save to test pre-save hook
        console.log('Attempting to save user...');
        user.name = user.name; // Dummy change
        await user.save();

        console.log('✅ User saved successfully! Error resolved.');
        process.exit();
    } catch (err) {
        console.error('❌ Save failed:', err);
        process.exit(1);
    }
};

runTest();
