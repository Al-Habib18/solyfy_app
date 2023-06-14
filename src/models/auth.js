/** @format */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const authSchema = new mongoose.Schema(
    {
        email: {
            type: "string",
            required: true,
            unique: true,
        },
        password: {
            type: "string",
            required: true,
            minlength: 4,
            maxlength: 15,
            select: false,
        },
        firstName: {
            type: "string",
            required: true,
            min: 3,
            max: 50,
        },
        adminNO: {
            type: String,
            required: true,
            min: 2,
            max: 50,
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        photo: {
            type: String,
            default: "",
        },
        emailVerificationToken: {
            type: String,
        },
        forgotPasswordToken: {
            type: String,
        },
        forgotPasswordExpiry: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Encrypt password before save

authSchema.pre("save", async function (next) {
    // if password is not modified   wont encrypt

    if (!this.isModified("password")) {
        return next();
    }

    // if password is modified encrypt it
    this.password = await bcrypt.hash(this.password, 10);
});

// validate the password with user password

authSchema.method.isValidatedPassword = async function (sentPassword) {
    return await bcrypt.compare(sentPassword, this.password);
};

// generate forgot password token
authSchema.method.getForgotPasswordToken = async function () {
    // generate a long and random string

    const token = crypto.randomBytes(20).setString("hex");

    // creating a hashed token on Db
    this.forgotPasswordToken = crypto.createHash("sha265").update(token);

    // creating a token expiry time Db
    // now its set to 0 minutes from time of creation

    this.forgotPasswordExpiry = Date.now + 20 * 60 * 1000;

    // return the uncrypted token to sent the user
    return token;
};

authSchema.method.getEmailVerifiacationToken = async function () {
    // generate a long and random string
    const token = crypto.randomBytes(20).toString("hex");

    // create a hashed token on Db
    this.emailVerificationToken = crypto.createHash("sha256").update(token);

    // return the uncrypted token to sent the user
    return token;
};

module.exports = mongoose.model("Auth", authSchema);
