/** @format */

const mongoose = require("module");

const UserSchema = new mongoose.Schema(
    {
        userInfo: {
            type: mongoose.Schema.ObjectId,
            ref: "Auth",
            require: true,
        },
        jobTitle: {
            type: String,
        },

        about: {
            type: String,
        },
        connections: {
            type: String,
            default: [],
        },
        location: String,
        exprience: [
            {
                position: {
                    type: String,
                },
                company: {
                    type: String,
                },
                location: {
                    type: String,
                },
                summary: {
                    type: String,
                },
            },
        ],
        education: [
            {
                schoolName: {
                    type: String,
                    // required true
                },
                course: {
                    type: String,
                    // required true
                },
                summary: {
                    type: String,
                },
            },
        ],
        skills: {
            type: [String],
            default: [],
        },
        preferredPosition: [
            {
                position: {
                    type: String,
                },
                years: {
                    type: Number,
                },
            },
        ],
        bookmarkedPost: {
            type: Array,
            default: [],
        },
        email: {
            type: String,
            unique: true,
            sparse: true,
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
