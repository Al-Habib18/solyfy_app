/** @format */

const User = require("../models/user");
const Post = require("../models/post");

const httpStatus = require("http-status");

const getUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).populate("userInfo");

        // find all connections associated with the user
        const connections = await Promise.all(
            user.connections.map((con) =>
                User.findById(con._id).populate("userInfo")
            )
        );

        const posts = await Post.findById({ user: id }).populate("userInfo");

        let connectionNO = connections.length;
        let postNO = posts.length;

        return res.status(httpStatus.OK).json({
            posts,
            postNO,
            connectionNO,
            connections,
            user,
        });
    } catch (err) {
        next(err);
    }
};

const getUserConnection = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        const connections = await Promise.all(
            user.connections.map((id) => User.findById(id).populate(user))
        );

        const formattedConnections = connections.map(
            ({
                _id,
                firstName,
                lastName,
                occupation,
                location,
                picturePath,
            }) => {
                return {
                    _id,
                    firstName,
                    lastName,
                    occupation,
                    location,
                    picturePath,
                };
            }
        );

        res.status(httpStatusCode.OK).json(formattedConnections);
    } catch (err) {
        next(err);
    }
};

const getSuggestedConnection = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.params.id).populate(
            "userInfo"
        );
        const user = await User.find().populate("userInfo");

        // Get a list of all the IDS of users that the current user is connected with
        const connectedUserIds = currentUser.connections.map((connection) => {
            connection._id.toString();
        });

        // filter out users the current user is already connecter with or is  the current user
        let suggestedUser = users.filter((user) => {
            !connectedUserIds.includes(user._id.toString()) &&
                user.email !== currentUser.email;
        });

        // Sort suggested users by the number of connections they have in commnon  with the current user
        suggestedUser.sort((a, b) => {
            const aConnections = a.connections.filter((connection) => {
                connectedUserIds.includes(connection._id.toString());
            });

            const bConnections = b.connections.filter((connection) => {
                connectedUserIds.includes(connection._id.toString());
            });
            return bConnections.length - aConnections.length;
        });

        // Limit the number of suggested users to 5
        suggestedUser = suggestedUser.slice(0, 5);
        return res.status(200).json(suggestedUser);
    } catch (err) {
        next(err);
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.user.id).populate(
            "userInfo"
        );

        const users = await User.find().populate("userInfo");

        // get a list of all the IDS of users that the current user is connected with
        let suggestedUsers = users.filter((user) => {
            !connectedUserIds.includes(user._id.toString()) &&
                user.email !== currentUser.email;
        });

        // sort suggested users by  the number of connections they have in commont
        suggestedUsers.sort((a, b) => {
            const aCommonConnections = a?.connections.filter((connection) => {
                connectedUserIds.includes(connection._id.toString());
            });

            const bCommonConnections = b?.connections.filter((con) =>
                connectedUserIds.includes(con._id.toString())
            );

            const aSharedConnections = suggestedUsers
                .filter((user) => user._id.toString() !== a._id.toString())
                .reduce((aCommonConnections, user) => {
                    aCommonConnections.concat(
                        user.connections.filter((connection) => {
                            connectedUserIds.includes(
                                connection._id.toString()
                            ) && connection._id.toString() === a._id.toString();
                        })
                    );
                });

            const bSharedConnections = suggestedUsers
                .filter((user) => user._id.toString() !== a._id.toString())
                .reduce((commonConnections, user) => {
                    commonConnections.concat(
                        user.connections.filter((connection) => {
                            connectedUserIds.includes(
                                connection._id.toString()
                            ) && connection._id.toString() === a._id.toString();
                        })
                    );
                });

            return (
                bCommonConnections.length +
                bSharedConnections.length -
                aCommonConnections.length -
                aSharedConnections.length
            );
        });

        // Limit the number of suggested users to 5
        suggestedUsers = suggestedUsers.slice(0, 30);

        return res.status(200).json(suggestedUsers);
    } catch (err) {
        next(err);
    }
};

const addRemoveConnection = async (req, res, next) => {
    try {
        const { userId, connectionId } = req.body;

        if (userId === connectionId) {
            throw new Error("You can't follow yourself");
        }

        const user = await User.findById(userId).populate("userInfo");
        const connection = await User.findById(connectionId).populate(
            "userInfo"
        );

        if (user.connections.some((con) => con.email === connection.email)) {
            user.connections = user.connections.filter(
                (con) => con._id.toString() !== connectionId
            );
            await user.save();
        } else {
            user.connections.push(connection);
            await user.save();
        }

        const userInfo = await User.findById({ _id: userId }).populate(
            "userInfo"
        );

        res.status(200).json(userInfo);
    } catch (err) {
        next(err);
    }
};

const updateUser = async (req, res, next) => {
    if (req.params.userId.toString() === req.params.id.toString()) {
        try {
            delete req.body._id;
            await User.findByIdAndUpdate(
                req.params.userId,
                { $set: req.body },
                { new: false }
            );
            const updatedUser = await User.findById(req.params.userId)
                .sort({ createdAt: -1 })
                .populate(" userInfo");

            res.status(200).json(updatedUser);
        } catch (e) {
            next(e);
        }
    }
};

module.exports = {
    getUser,
    getAllUsers,
    getUserConnection,
    getSuggestedConnection,
    addRemoveConnection,
    updateUser,
};
