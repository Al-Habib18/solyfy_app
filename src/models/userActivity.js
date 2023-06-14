/** @format */

const mongoose = require("mongoose");

const userActivitySchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        post_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ForumPost",
            required: true,
        },
        action: {
            type: String,
            enum: ["like", "comment", "recommend"],
            required: true,
        },
    },
    { timestamps: true }
);

const UserActivity = mongoose.model("UserActivity", userActivitySchema);
module.exports = UserActivity;
