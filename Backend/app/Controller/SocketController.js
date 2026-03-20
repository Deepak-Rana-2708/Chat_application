const messages = require("../Models/Message");
const mongoose = require("mongoose");
const Notification = require("../Models/Notification");
const Contact = require("../Models/Contact");
const User = require("../Models/UsersModel");

// agar invite pr click krta hai to email check krega first db me agar phele se hai. to invite jayega notification accept ka or agar nhi hai to
// invite jayega mail pr account create krne k liye!

const getAllMessages = async (req, res) => {

  try {

    const { search, id } = req.decryptedQuery;

    const sender = new mongoose.Types.ObjectId(req.identity.id);
    const receiver = new mongoose.Types.ObjectId(id);

    const query = {
      $or: [
        { sender: sender, receiver: receiver, isDeleted: false },
        { sender: receiver, receiver: sender, isDeleted: false }
      ]
    };

    if (search) {
      query.message = { $regex: search, $options: "i" };
    }
    const msg = await messages.find(query).sort({ createdAt: 1 });
    
    return res.status(200).json({
      message: "Messages retrieved successfully",
      success: true,
      data: msg
    });

  } catch (error) {

    return res.status(500).json({
      message: error.message,
      success: false
    });

  }

};

const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const myId = new mongoose.Types.ObjectId(req.identity.id);
    const query = {
      status: "accepted",
      participants: { $in: [myId] },
    };

    if (search) {
      query["addedByUser.name"] = { $regex: search, $options: "i" };
    }

    const pipelines = [
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "addedByUser",
        },
      },

      {
        $unwind: {
          path: "$addedByUser",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $match: {
          ...query,
          "addedByUser._id": { $ne: myId },
        },
      },

      {
        $project: {
          _id: 1,
          status: 1,
          allUser: "$addedByUser",
        },
      },
    ];

    const users = await Contact.aggregate(pipelines);
    
    return res.status(200).json({
      message: "Users retrieved successfully",
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("error : ", error);

    return res.status(500).json({
      message: "Error occurred while retrieving users",
      success: false,
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { id } = req.query;
    const isMsg = await messages.findOne({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });
    if (isMsg) {
      return res.status(400).json({
        message: "Message already deleted",
        success: false,
      });
    }
    const msgDel = await messages.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { returnDocument: "after" },
    );
    return res.status(200).json({
      message: "Message deleted successfully",
      success: true,
      data: msgDel,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error occurred while deleting message",
      success: false,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.query;
    const isUser = await User.findOne({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });
    if (!isUser) {
      return res.status(400).json({
        message: "User Not Found!",
        success: false,
      });
    }
    const DelUser = await User.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { returnDocument: "after" },
    );
    if (!DelUser) {
      return res.status(400).json({
        message: "Error deleting user",
        success: false,
      });
    }
    return res.status(200).json({
      message: "User Deleted Successfully!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error occured while deleting user",
      success: false,
    });
  }
};

const GetAllNotifications = async (req, res) => {
  try {
    const { receiverId } = req.query;
    if(!receiverId){
      return res.status(400).json({
        message: "Receiver ID is required",
        success: false,
      });
    }
    const notifications = await Notification.find({
      receiver: new mongoose.Types.ObjectId(receiverId),
      isDeleted: false,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Notifications retrieved successfully",
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      message: "Error occurred while retrieving notifications",
      success: false,
    });
  }
}

module.exports = {
  getAllMessages,
  getAllUsers,
  deleteMessage,
  deleteUser,
  GetAllNotifications
};
