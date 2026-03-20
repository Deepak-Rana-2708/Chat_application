const User = require("../Models/UsersModel");
const Email = require("../onBoarding/Email");
const Notification = require("../Models/Notification");
const { getIo, getOnlineUsers } = require("../Controller/Socket");
const bcrypt = require("bcrypt");
const Contact = require("../Models/Contact");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createUser = async (userData, id) => {
  try {
    const { password } = userData;
    const existing = await User.findOne({
      email: userData.email,
      isDeleted: false,
    });
    if (existing) {
      throw new Error("User already exists with this email");
    }
    const hashPass = await bcrypt.hash(password, 10);
    try {
      await Email.EmailVerification({ email: userData.email });
    } catch (err) {
      console.log("Email Error : ", err);
    }
    const customer = await stripe.customers.create({
      name: userData.name,
      email: userData.email,
    });
    const addedById = id ? id : null;
    const newUser = new User({
      ...userData,
      password: hashPass,
      customerId: customer.id,
      addedBy: addedById,
    });
    if (!newUser) {
      throw new Error("Error creating user");
    }
    const user = await newUser.save();
    if (id) {
      await Contact.create({
        participants: [
          new mongoose.Types.ObjectId(user._id),
          new mongoose.Types.ObjectId(id),
        ],
        status: "accepted",
      });
    }
    return user;
  } catch (error) {
    console.log("error : ", error);
    throw new Error(error.message);
  }
};

const verifyEmail = async (email, exp) => {
  try {
    const verify = await User.findOne({ email: email, isDeleted: false });
    if (!verify) {
      throw new Error("Invalid verification link");
    }
    if (verify.isVerified) {
      throw new Error("Email is already verified");
    }
    if (exp && exp < Date.now()) {
      throw new Error("Verification link has expired");
    }
    const update = await User.findByIdAndUpdate(
      verify.id,
      { isVerified: true },
      { returnDocument: "after" },
    );
    if (!update) {
      throw new Error("Error verifying email");
    }
    return {
      message: "Your email has been successfully verified",
      success: true,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const login = async (body) => {
  try {
    const { email, password } = body;
    const user = await User.findOne({ email: email, isDeleted: false });
    if (!user) {
      throw new Error("Invalid email or password");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }
    if (!user.isVerified) {
      throw new Error("Email is not verified");
    }
    const data = await User.findById(user._id).select("-password");
    const AiExist = await User.findOne({ email: 'ai@system.com', isDeleted: false });
      const alreadyConnected = await Contact.findOne({
        participants: { $all: [AiExist.id, data.id] },
        status: "accepted",
      });
      if (!alreadyConnected) {
        await Contact.create({
          participants: [AiExist._id, data._id],
          status: "accepted",
        });
      }
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" },
    );
    return { token, data };
  } catch (error) {
    console.error("Error : ", error);
    throw new Error(error.message);
  }
};

const inviteUser = async (email, id, name) => {
  try {
    const existing = await User.findOne({ email: email, isDeleted: false });
    if (existing) {
      const AlreadyFriend = await Contact.findOne({
        participants: {
          $all: [
            new mongoose.Types.ObjectId(existing._id),
            new mongoose.Types.ObjectId(id),
          ],
        },
        isDeleted: false,
      });
      if (AlreadyFriend) {
        return {
          message: `${existing.name} Is Already In Your Friend List`,
          success: false,
        };
      }
      const newNotif = await Notification.create({
        receiver: existing._id,
        sender: id,
        message: `${name} has invited you to chat!`,
      });

      const io = getIo();
      const onlineUsers = getOnlineUsers();
      const receiverSocketId = onlineUsers[existing._id.toString()];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("new_invite_notification", {
          notificationId: newNotif._id,
          senderName: name,
          message: newNotif.message,
          createdAt: newNotif.createdAt,
        });
      }
      return {
        success: true,
        message: "Notification sent to " + existing.name,
      };
    }
    await Email.InviteEmail({ email: email, id: id });
    return {
      message: "Invitation sent successfully",
      success: true,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const forgotPassword = async (data) => {
  try {
    const Existing = await User.findOne({ email: data, isDeleted: false });
    if (!Existing) {
      throw new Error("Enter Valid Email!");
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    await Email.OTPEmail({ email: data, otp: otp });
    const Info = await User.findByIdAndUpdate(
      Existing._id,
      { otp: otp, otpExpiry: otpExpiry },
      { returnDocument: "after" },
    );
    if (!Info) {
      throw new Error("Something Went Wrong!");
    }
    return Info;
  } catch (error) {
    return error;
  }
};
module.exports = { createUser, verifyEmail, login, inviteUser, forgotPassword };
