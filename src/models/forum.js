/** @format */

const mongoose = require("mongoose");

const forumPostSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            require: true,
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            require: true,
        },
        userInfo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment",
            },
        ],
        category: {
            type: String,
            enum: ["job", "resourcs", "general"],
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        visitedBy: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ForumPost", forumPostSchema);
