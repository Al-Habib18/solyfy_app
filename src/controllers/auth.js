/** @format */

const httpStatus = require("http.status");
const { addMinutes } = require("data-fns");
const Auth = require("../models/auth");
const User = require("../models/user");
const Errors = require("../errors/common");
const config = require("../.config");
const sendMail = require("../lib/email");
const jwt = require("jwt-simple");
const crypto = require("crypto");
const { response } = require("express");
const cloudinary = require("cloudinary").v2;

const register = async (req, res, next) => {
    try {
        const isExisting = await Auth.findOne({ email: req.body.email });
        if (isExisting) {
            throw new Error("Already such an email");
        }

        // Configuration
        cloudinary.config({
            cloud_name: config.cloudinary.cloud_name,
            api_key: config.cloudinary.key,
            api_secret: config.cloudinary.secret,
        });

        let file = req.files.media;
        const result = await cloudinary.uploader(file.tempFilePath, {
            foleder: "users",
        });

        const newAuth = await Auth.create({
            ...req.body,
            photo: result.secure_url,
        });

        const newUser = await (
            await User.create({ userInfo: newAuth._id, email: newAuth.email })
        ).populate("userInfo");

        return res.status(201).json({
            status: true,
            messege: "success",
            user: newUser,
        });
    } catch (err) {
        next(err);
    }
};

const logInWithEmailAndPassword = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // data validation from frontend
        if (!email || !password) {
            return next(new Errors.ApiError());
        }

        // check if user exist in db if yes fetch them
        const user = await Auth.findOne({ email }).select("+password");

        if (!user) {
            return res.status(400).json("invalid credentials");
        }

        // validating the password if they match with one from db
        const isPasswordCorrect = await user.isValidatedPassword(password);

        if (!isPasswordCorrect) {
            return res.status(400).json("invalid credentials");
        }

        const currentUser = await User.findOne({ userInfo: user._id }).populate(
            "userInfo"
        );

        // sending a token afer validation
        const token = createAccessToken(currentUser);
        const options = {
            expires: token.expiresIn,
            httpOnly: true,
        };

        res.status(201).cookie("token", token.token, options).json({
            status: true,
            messege: "success",
            token: token,
            user: currentUser,
        });
    } catch (err) {
        next(err);
    }
};
const emailVerification = async (req, res, next) => {
    try {
        const token = req.params.token;
        const encryptedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // get user with same cnrypted token
        const user = await Auth.findOne({
            emailVerificationToken: encryptedToken,
        });

        if (!user) {
            return next(new Errors.ApiError());
        }

        // save the emailVerified to Db and delete the token
        user.emailVerificationToken = undefined;
        user.emailVerified = true;

        await user.save({ validateBeforeSave: false });

        const newToken = createAccessToken(user);
        const options = {
            expires: token.expiresIn,
            httpOnly: true,
        };

        res.status(201).cookie("token", newToken.token, options).json({
            status: true,
            message: "success",
            token: newToken,
            user: user,
        });
    } catch (err) {
        next(err);
    }
};

const logout = (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: " logout success",
    });
};
const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    //& data validtion from frontend

    if (!email) {
        return next(new Errors.ApiError());
    }
    //&  check if user exists in the DB

    const user = await Auth.findOne({ email });

    if (!user) {
        return next(new Errors.UserNotFoundError());
    }

    //& Create a token and save it in the database
    const forgotToken = await user.getForgetPasswordToken();
    await user.save({ validateBeforeSave: false });

    //& Send the user a reset pasword to their email

    const url = `${req.protocol}://${req.get(
        "host"
    )}/api/v1/password/reset/${forgotToken}`;
    const message = `Copy paste this link in our Url and hit enter \n\n ${url}`;

    try {
        await sendMail({
            to: user.email,
            subject: "Password reset",
            html: message,
        });

        res.status(httpStatus.OK).json({
            success: true,
            message: "Email sent Successfully",
            info: "Check your email and follow the steps to recover your account ",
        });
    } catch (error) {
        //& if the email wasnt sent we delete the  token from db

        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        await user.save({ validateBeforeSave: false });

        //& send an error response

        return next(new Errors.ApiError());
    }
};

const passwordReset = async (req, res, next) => {
    try {
        //& get reset pasword token and encrypt it to match the Db one
        const token = req.params.token;
        const encryptedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        //& geet user with same encrypted token and not expired

        const user = await Auth.findOne({
            forgotPasswordToken: encryptedToken,
            forgotPasswordExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return next(new Errors.ApiError());
        }

        //& save the new password to Db and  delete the tokens
        user.password = req.body.password;

        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;

        await user.save({ validateBeforeSave: false });

        //& send user a new token
        //& sending a token after user creation
        const newToken = createAccessToken(user);
        const options = {
            expires: token.expiresIn,
            httpOnly: true,
        };

        //& remember not to send the password
        //  user.password = undefined

        res.status(httpStatus.CREATED)
            .cookie("token", newToken.token, options)
            .json({
                status: true,
                message: "success",
                token: newToken,
                user: user,
            });
    } catch (error) {
        return next(new Errors.ApiError());
    }
};

const passwordUpdate = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;

        //& data validtion from frontend
        if (!oldPassword) {
            return next(new Errors.ApiError());
        }

        //& get old password from Db and validate if it is same to the one sent
        const user = await Auth.findById(req.user.id).select("+password");

        const isCorrectOldPassword = await user.isValidatedPassword(
            oldPassword
        );

        if (!isCorrectOldPassword) {
            return next(new Errors.ApiError());
        }

        //& Update the password and send them a new login token

        user.password = newPassword;

        await user.save();

        res.status(httpStatus.CREATED).json({
            status: true,
            message: "success",
            user: user,
        });
    } catch (error) {
        return next(new Errors.ApiError());
    }
};

const updateUser = async (req, res, next) => {
    try {
        await Auth.findByIdAndUpdate(
            req.params.userId,
            { $set: req.body },
            { new: false }
        );
        const updatedUser = await User.findOne({
            email: req.body.email,
        }).populate("userInfo");

        res.status(200).json(updatedUser);
    } catch (err) {
        next(err);
    }
};

const createAccessToken = (user) => {
    return {
        tokenType: "Bearer",
        expiresIn: addMinutes(Date.now(), config.auth.jwtExpirationInterval),
        token: createJwt(user._id),
    };
};
const createJwt = (encoder) => {
    const payload = {
        exp: getUnixTime(
            addYears(Date.now(), config.auth.jwtExpirationInterval)
        ),
        iat: getUnixTime(Date.now()),
        id: encoder,
    };
    return jwt.encode(payload, config.auth.jwtSecret);
};

module.exports = {
    register,
    logInWithEmailAndPassword,
    emailVerification,
    logout,
    forgotPassword,
    passwordReset,
    passwordUpdate,
    updateUser,
};
