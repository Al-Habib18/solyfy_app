/** @format */

const mongoose = require("mongoose");

const connect = async (uri) => {
    await mongoose
        .connect(uri, {
            // & must add in order to not get any error message
            useUnifiedTopology: true,
            useNewUrlParser: true,
        })
        .then(console.log("Database connection established"))
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
    return true;
};

const disconnect = async () => {
    await mongoose.disconnect();
};
