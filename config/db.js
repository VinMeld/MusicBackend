const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`.green.inverse.bold); 
    } catch (err) {
        console.error(err.message.red);
        process.exit(1);
    }
}
module.exports = connectDB