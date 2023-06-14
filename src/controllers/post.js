/** @format */

const Post = require("../models/post");
const User = require("../models/user");
const cloudinary = require("cloudinary");
const config = require("../config");

const createPost = async (req, res, next) => {
    try {
        // configuration
        cloudinary.config({
            cloud_name: config.cloudinary.could_name,
            api_key: config.cloudinary.key,
            api_secret: config.cloudinary.secret,
        });

        let file = req.files.media;
        let photoUrl = null;
        let result = null;
        if (file) {
            // Upload file to cloudinary and get the URL
            result = await cloudinary.uploader.upload(file.tempFilePath, {
                folder: "posts",
            });
        }

        photoUrl = result.secret_url;

        const user = await User.findById(req.user.id);

        // Create the post with or without the photo
        await Post.create({
            title: req.body.title,
            user: req.user.id,
            userInfo: user.userInfo,
            photo: photoUrl,
        });

        const post = await Post.find()
            .populate("userInfo")
            .sort({ createAt: -1 });

        return res.status(201).json(post);
    } catch (err) {
        next(err);
    }
};

const getUserPosts = async (req, res, next) => {
    try {
        const posts = await Post.findOne({ user: req.params.id }).populate(
            "userInfo"
        );

        return res.status(200).json(posts);
    } catch (err) {
        next(err);
    }
};

const getTimelinePosts = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.user.id);
        const posts = await Post.find()
            .populate("userInfo")
            .sort({ createdAt: -1 });
        const currentUserPosts = await Post.find({ user: req.user.id })
            .populate("userInfo")
            .sort({ createdAt: -1 });

        const friendsPosts = posts.filter((post) =>
            currentUserPosts.connections.some(
                (some) => some._id.toString() === post.user.toString()
            )
        );

        let timelinePosts = [...currentUserPosts, ...friendsPosts].sort(
            (a, b) => b.createdAt - a.createdAt
        );

        // use a Set to keep track of post IDS
        const postIds = new Set();
        timelinePosts = timelinePosts.filter((post) => {
            if (!postIds.has(post._id.toString())) {
                postIds.add(post._id.toString());
                return true;
            }
            return false;
        });

        if (timelinePosts.length > 40) {
            timelinePosts = timelinePosts.slice(0, 40);
        } else if (timelinePosts.length < 10) {
            let otherPost = posts
                .filter((post) => !timelinePosts.includes(post))
                .slice(0, 30);
            timelinePosts = [...otherPost, ...timelinePosts].sort(
                (a, b) => b.createAt - a.createAt
            );
        }

        return res.status(200).json(timelinePosts);
    } catch (er) {
        next(er);
    }
};

const getOnePost = async (req, res, next) => {
    try {
        const { id } = req.params;
        let post = await Post.findById(id).populate("userInfo");
        if (!post) {
            return res.status(404).json({ msg: "post not found" });
        }
        return res.status(200).json(post);
    } catch (e) {
        next(e);
    }
};

const updatePost = async (req, res, next) => {
    try {
        const { id } = req.params;

        const post = await Post.findById(id);

        if (post.user.toString() === req.user.id.toString()) {
            const updatePost = await Post.findByIdAndUpdate(
                id,
                { $set: req.body },
                { new: true }
            );
        }
    } catch (err) {
        next(err);
    }
};

const deletePost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ msg: "No such post" });
        } else if (post.user.toString() !== req.user.id.toString()) {
            return res
                .status(403)
                .json({ msg: "you can delete only your msg" });
        } else {
            await Post.findByIdAndDelete(id);
            return res.status(200).json({ msg: "Post deleted successfully" });
        }
    } catch (err) {
        next(err);
    }
};

const toggleLikePost = async (req, res, next) => {
    try {
        const currentUserId = req.params.id;
        const post = await Post.findById(req.params.id);

        if (post.likes.includes(currentUserId)) {
            post.likes = post.likes.filter((id) => id !== currentUserId);
            post.liked = false;
            await post.save();
            return res
                .status(200)
                .json({ post: post, msg: "successflly unlike the post" });
        }
        post.likes.push(currentUserId);
        post.liked = true;
        await post.save();
        return res
            .status(200)
            .json({ post: post, msg: "successflly liked the post" });
    } catch (e) {
        next(e);
    }
};

module.exports = {
    createPost,
    getUserPosts,
    getTimelinePosts,
    getOnePost,
    updatePost,
    deletePost,
    toggleLikePost,
};
