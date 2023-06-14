/** @format */

const mongoose = require("mongoose");

const userIds = [new mongoose.Types.ObjectId()];

const user = [
    {
        _id: userIds[0],
        firstName: "test",
        lastName: "me",
        email: "test@example.com",
        password: "$2b$10$dsasdgsagasda//G9JxQ4bQ8KXf4OAIe/X/AK9skyWUy",
        picturePath: "p11.jpeg",
        friends: [],
        location: "san Fran ,Ca",
        occupation: "Software Engineer",
        viewedProfile: 2123,
        impressions: 382323,
        createdAt: 232312312,
        updatedAt: 232312312,
        __v: 0,
    },
];

module.exports = user;
