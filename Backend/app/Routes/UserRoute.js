const express = require("express");
const router = express.Router();
const SocketController = require("../Controller/SocketController");
const userController = require('../Controller/UserController');

router.post("/signup", userController.Singup);
router.get("/verify-email", userController.VerifyEmail);
router.post("/login", userController.login);
router.post("/invite-user", userController.InviteUser);
router.post("/accept-invite", userController.acceptInvite);
router.get("/user-Detail", userController.Details);
router.get("/forgot-password", userController.forgotPassword);
router.post("/verify-otp", userController.VerifyOtp);
router.post("/NewPassword", userController.NewPassword);

//socket listing

router.get("/listing-message", SocketController.getAllMessages);
router.get("/listing-notifications", SocketController.GetAllNotifications);
router.get("/listing-users", SocketController.getAllUsers);
router.delete("/delete-message", SocketController.deleteMessage);
router.delete("/delete-user", SocketController.deleteUser);

module.exports = router;