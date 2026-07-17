require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const initdata = require('./data.js');
const Listing = require("../models/listing.js");

// Use Atlas in production, local in dev
const MONGO_URL = process.env.MONGODB_ATLAS_URL || 'mongodb://127.0.0.1:27017/wanderlust';

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("connected to db:", MONGO_URL.includes('atlas') ? 'MongoDB Atlas' : 'Local');
};

const initdb = async () => {
    await Listing.deleteMany({});
    // Use a valid placeholder owner ID (can be replaced with a real user ID)
    initdata.data = initdata.data.map((obj) => ({ ...obj, owner: new mongoose.Types.ObjectId() }));
    await Listing.insertMany(initdata.data);
    console.log(`Seeded ${initdata.data.length} listings successfully.`);
    await mongoose.disconnect();
    console.log("Disconnected from DB.");
};

main()
    .then(() => initdb())
    .catch((err) => {
        console.error("Error:", err);
        process.exit(1);
    });