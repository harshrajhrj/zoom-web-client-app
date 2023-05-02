const mongoose = require('mongoose');
require('dotenv/config');

module.exports = async function connection() {

    try {
        const connectionParams = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
        await mongoose.connect(process.env.CONNECTION, connectionParams);
        console.log('Connected to DB!!');
    } catch (err) {
        console.log(err.message);
    }
}