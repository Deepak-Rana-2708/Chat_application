const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
    participants: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    ],
    
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'blocked'], 
        default: 'pending' 
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

contactSchema.index({ participants: 1 });

module.exports = mongoose.model("Contact", contactSchema);