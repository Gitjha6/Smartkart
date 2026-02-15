const mongoose = require('mongoose');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Shop = require('./models/Shop');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb://localhost:27017/smartkart');
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // 1. List all Shops
        const shops = await Shop.find({});
        console.log('\n--- SHOPS ---');
        shops.forEach(shop => {
            console.log(`Shop ID: ${shop._id}, Name: ${shop.name}, Owner: ${shop.owner}`);
        });

        // 2. List all Products and their Shop ID
        const products = await Product.find({});
        console.log('\n--- PRODUCTS ---');
        products.forEach(p => {
            console.log(`Product: ${p.name}, ID: ${p._id}, Shop: ${p.shop}`);
        });

        // 3. List all Orders and their Items
        const orders = await Order.find({});
        console.log('\n--- ORDERS ---');
        orders.forEach(o => {
            console.log(`Order ID: ${o._id}, User: ${o.user}`);
            o.orderItems.forEach(item => {
                console.log(`  - Item: ${item.name}, Shop: ${item.shop} (Type: ${typeof item.shop})`);
            });
        });

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
