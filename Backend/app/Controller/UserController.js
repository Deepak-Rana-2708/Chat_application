const {
  SignupValidation,
  LoginValidation,
  EmailValidation,
  acceptInviteValidation,
} = require("../Validation/SingupValidation");
const userServices = require("../Services/UserServices");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../Models/UsersModel");
const Notification = require("../Models/Notification");
const Contact = require("../Models/Contact");

const Singup = async (req, res) => {
  try {
    const { error } = SignupValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        success: false,
      });
    }
    const data = await userServices.createUser(
      req.body,
      req.decryptedQuery?.id,
    );
    return res.status(200).json({
      message: "Account Create Successfully Please Verify Your Email!",
      success: true,
    });
  } catch (error) {
    console.log("error : ", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

const VerifyEmail = async (req, res) => {
  try {
    const { email, exp } = req.decryptedQuery.data;

    const result = await userServices.verifyEmail(email, exp);

    return res.render("VerifyEmail", {
      message: result.message,
      success: result.success,
      frontendURL: process.env.Frontend_URI,
    });
  } catch (error) {
    return res.render("VerifyEmail", {
      message: error.message,
      success: false,
      frontendURL: process.env.Frontend_URI,
    });
  }
};

const login = async (req, res) => {
  try {
    const { error } = LoginValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        success: false,
      });
    }
    const token = await userServices.login(req.body);
    return res.status(200).json({
      message: "Login successfully",
      success: true,
      token: token.token,
      data: token.data,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const InviteUser = async (req, res) => {
  try {
    const { error } = EmailValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        success: false,
      });
    }
    const result = await userServices.inviteUser(
      req.body.email,
      req.identity.id,
      req.identity.name,
    );
    return res.status(200).json({
      message: result.message,
      success: result.success,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const Details = async (req, res) => {
  try {
    const users = await User.findOne({
      _id: new mongoose.Types.ObjectId(req.identity.id),
      isDeleted: false,
    }).select("-password");
    if (!users) {
      return res.status(400).json({
        message: "User Not Found!",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Data Fetch Successfully!",
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};
const acceptInvite = async (req, res) => {
  const { error } = acceptInviteValidation.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
      success: false,
    });
  }
  const { senderto, notificationId, status } = req.body;
  const myId = req.identity.id;

  const alreadyConnected = await Contact.findOne({
    participants: { $all: [senderto, myId] },
    status: "accepted",
  });

  if (alreadyConnected) {
    return res.status(400).json({ message: "Already connected" });
  }

  if (status === "rejected") {
    await Notification.findByIdAndUpdate(notificationId, {
      status: "rejected",
    });
    return res.status(400).json({
      message: "Invitation rejected!",
      success: false,
    });
  }

  await Contact.create({
    participants: [senderto, myId],
    status: status,
  });

  await Notification.findByIdAndUpdate(notificationId, { status: "accepted" });

  return res
    .status(200)
    .json({ success: true, message: "Invitation accepted!" });
};

const forgotPassword = async (req, res) => {
  try {
      const { email } = req.decryptedQuery.data || req.query;
      console.log('decrypted : ', req.decryptedQuery.data);
      if (!email) {
          return res.status(400).json({
              message: "Something Went Wrong!",
              success: false,
          });
      }
    const fPass = userServices.forgotPassword(email);
    return res.status(200).json({
      message: "OTP has been sent. Please check your email!",
      success: true,
    });
  } catch (error) {
      console.error("data: ", error);
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};
const VerifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({
        message: "Otp Is Required!",
        success: false,
      });
    }
    const Existing = await User.findOne({ otp: otp, isDeleted: false });
    if (!Existing) {
      return res.status(400).json({
        message: "Please enter a valid OTP or resend the OTP.",
        success: false,
      });
    }
    if (Date.now() > Existing.otpExpiry) {
      return res.status(400).json({
        message: "OTP has expired. Please request a new one.",
        success: false,
      });
    }
    return res.status(200).json({
      message: "OTP verified successfully.",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const NewPassword = async (req, res) => {
  try {
    const { otp, password } = req.body;
    if (!password) {
      return res.status(400).json({
        message: "Password Is Required!",
        success: false,
      });
    }
    
    const Existotp = await User.findOne({ otp: otp, isDeleted: false });
    if (!Existotp) {
      return res.status(400).json({
        message: "Something Went Wrong!",
        success: false,
      });
    }
    const hashPass = await bcrypt.hash(password, 10);
    const PassChange = await User.findByIdAndUpdate(
      Existotp._id,
      { password: hashPass, otp: null, otpExpiry: null },
      { returnDocument: "after" },
      );
      console.log("passChange : ", PassChange);
    if (!PassChange) {
      return res.status(400).json({
        message: "Something Went Wrong!",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Password Change Successfully!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};
module.exports = {
  Singup,
  VerifyEmail,
  login,
  InviteUser,
  acceptInvite,
  Details,
  forgotPassword,
    VerifyOtp,
  NewPassword,
};
