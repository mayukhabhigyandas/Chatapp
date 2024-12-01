const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  senderId: { type: String, ref: 'User', required: true },
  receiverId: { type: String, ref: 'User', required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Message=mongoose.model('Message', MessageSchema)
module.exports=Message;