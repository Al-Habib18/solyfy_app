/** @format */

const router = require("express").Router();
const {
    getUser,
    getAllUsers,
    getSuggestedConnection,

    updateUser,
    addRemoveConnection,
} = require("../../controllers/user");
const verifyToken = require("../../middlewares/verify-token");

router.get("/:id", verifyToken, getUser);

router.get("/find/all", verifyToken, getAllUsers);
router.get("/find/suggested-connections", verifyToken, getSuggestedConnection);

router.post("/update-user", verifyToken, updateUser);
router.post("/toggle-connection", verifyToken, addRemoveConnection);
module.exports = router;
