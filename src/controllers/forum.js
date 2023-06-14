/** @format */
const ForumPost = require("../models/forum");
const User = require("../models/user");
const UserActivity = require("../models/userActivity");

const getWeightRecommendation = require("../lib/forum-post-recommendation");
const forum = require("../models/forum");
const { response } = require("express");

const createFourmPost = async (req, res, next) => {
    try {
        const { title, description, category } = req.body;
        const creator = req.user.id;

        const user = await User.findById(req.user.id);
        const userInfo = user.userInfo;
        const forumPost = await ForumPost.create({
            title,
            userInfo,
            description,
            category,
        });
        const forumPosts = await ForumPost.findById({ category })
            .sort({ createdAt: -1 })
            .populate("userInfo");
        res.status(201).json(forumPosts);
    } catch (err) {
        next(err);
    }
};
const editForumPost = async (req, res, next) => {
    const { forumPostId } = req.params;
    const { title, description } = req.body;

    try {
        const forumPost = await ForumPost.findByIdAndUpdate(
            forumPostId,
            { title, description },
            { new: true }
        );
        res.json(forumPost);
    } catch (err) {
        next(err);
    }
};
const likeForumPost = async (req, res, next) => {
    const { forumPostId } = req.params;
    const userId = req.user.id;
    try {
        const forumPost = await ForumPost.findById(forumPostId);
        if (!forumPost) {
            return res.status(404).json({ msg: "Forum post not found" });
        }

        let updatedForumPost = "";
        const alreadyLiked = forumPost.likes.includes(userId);

        if (alreadyLiked) {
            await UserActivity.findOneAndDelete({ user_id: req.user.id });
            updatedForumPost = await ForumPost.findByIdAndUpdate(
                forumPostId,
                { $pull: { likes: userId } },
                { new: true }
            );
        } else {
            const userActivity = await UserActivity.create({
                user_id: req.user.id,
                post_id: forumPostId._id,
                action: likeForumPost,
                timestamp: new Date(),
            });

            updatedForumPost = await ForumPost.findByIdAndUpdate(
                forumPostId,
                { $pull: { likes: userId } },
                { new: true }
            );
        }
        res.json(updatedForumPost);
    } catch (err) {
        next(err);
    }
};
const getForumPostsByCategory = async (req, res, next) => {
    const { category } = req.params;
    const { page = 1 } = req.query;
    const limit = 20;
    const skip = (page - 1) * limit;
    try {
        const forumPosts = await ForumPost.find({ category })
            .populate("userInfo")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    } catch (err) {
        next(err);
    }
};
const getFilteredForumPosts = async (req, res, next) => {
    const { filter, category } = req.params;
    const { page = 1 } = req.query;
    const limit = 20;
    const skip = (page - 1) * limit;
    let sort = "";

    switch (filter) {
        case "trnding":
            const pastFewHours = new Date(Date.now() - 3 * 60 * 60 * 1000); // last  3 hours
            sort = { likes: -1, createdAt: -1 };
            const trendingForumPost = await ForumPost.find({ createdAt: -1 })
                .populate("userInfo")
                .sort(sort)
                .skip(skip)
                .limit(limit);
        case "most-liked":
            const mostLikedForumPosts = await ForumPost.find({ category })
                .populate("userInfo")
                .sort(sort)
                .limit(limit);
            res.status(200).json(mostLikedForumPosts);
            break;
        case "latest":
            sort = { createdAt: -1 };
            const latestForumPosts = await ForumPosts.find({ category })
                .populate()
                .sort(sort)
                .skip(skip)
                .limit(limit);
            res.status(200).json(latestForumPosts);
            break;
        default:
            response.status(400).json({ error: "Invalid Filter" });
    }
};
const getForumPostById = async (req, res, next) => {
    const { forumPostId } = req.params;

    try {
        const ipAddress = req.ip;
        const forumPost = await ForumPost.findById(forumPostId).populate(
            "userInfo"
        );

        if (!forumPost.visitedBy.includes(ipAddress)) {
            await ForumPost.findByIdAndUpdate(forumPostId, {
                $inc: { views: 1 },
                $push: { visitedBy: ipAddress },
            });
        }
        res.status(200).json(forumPost);
    } catch (err) {
        next(err);
    }
};

const getAllForumPosts = async (req, res, next) => {
    const { category, sortBy, searchTem } = req.query;
    if (category && !sortBy && !searchTem) {
        try {
            const recommendationPosts = await getWeightRecommendation(
                req.user.id,
                category
            );

            if (recommendationPosts.length < 5) {
                const mostViewPosts = await ForumPost.find({ category })
                    .populate({
                        path: "userInfo",
                    })
                    .sort({ viewCount: -1 });
                res.status(200).json(mostViewPosts);
            } else {
                res.status(200).json(recommendationPosts);
            }
        } catch (e) {
            next(e);
        }
    } else {
        try {
            let filter = {};
            if (category) {
                filter.category = category;
            }

            let sortOption = { createdAt: -1 };
            if (sortBy === "mostLiked") {
                sortOption = { likes: -1 };
            } else if (sortBy === "mostViewed") {
                sortOption = { views: -1 };
            } else if (sortBy === "newPosts") {
                sortOption = { createdAt: -1 };
            }

            let searchFilter = {};
            if (searchTem) {
                searchFilter = {
                    $or: [
                        { title: { $regex: searchTerm, $options: "i" } },
                        { description: { $regex: searchTem, $options: "i" } },
                    ],
                };
            }

            const forumPosts = await ForumPost.find({
                ...filter,
                ...searchFilter,
            })
                .populate({
                    path: "userInfo",
                })
                .sort(sortOption);
            res.status(200).json(forumPosts);
        } catch (e) {
            next(e);
        }
    }
};

module.exports = {
    createFourmPost,
    editForumPost,
    likeForumPost,

    getFilteredForumPosts,
    getForumPostsByCategory,
    getAllForumPosts,
    getForumPostById,
};
