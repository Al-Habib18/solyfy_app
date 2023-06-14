/** @format */

const dotenv = require("dotenv");

dotenv.config();

module.exports = Object.freeze({
    version: "0.0.0",
    openApiPath: "../openapi.yaml",
    env: process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === "production",
    port: process.env.PORT,
    auth: {
        jwtSecret: process.env.JWT_SECRET,
        jwtExpirationInterval: process.env.JWT_EXPIRATION_INTER_MINUTES,
    },

    mongo: {
        uri: process.env.MONG_URI,
    },
    email: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        from: process.env.EMAIL_FROM,
        service: process.env.EMAIL_SERVICE,
        username: process.env.EMAIL_USERNAME,
        parent: process.env.EMAIL_PASSWORD,
    },

    cloudinary: {
        key: process.env.CLOUDINARY_KEY,
        secret: process.env.CLOUDINARY_SECRET,
        could_name: process.env.CLOUDINARY_COULD_NAME,
        url: process.env.CLOUDINARY_URL,
    },
});
