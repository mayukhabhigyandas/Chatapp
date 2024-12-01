const express = require('express');
const router = express.Router();
var fetchuser = require("../middleware/fetchuser");
const Message = require('../models/Message');


// Save a New Message or save in database
router.post('/addchat', fetchuser, async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  // Validate request body
  if (!senderId || !receiverId || !message) {
    return res.status(400).json({ error: "All fields (senderId, receiverId, message) are required." });
  }

  try {
    // Create a new message
    const newMessage = new Message({ senderId, receiverId, message });
    const savedMessage = await newMessage.save();

    // Respond with the saved message
    res.status(201).json({
      message: "Message created successfully",
      data: savedMessage,
    });
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).json({ error: "Internal Server Error. Please try again later." });
  }
});

// Get Messages Between Two Users or happening message
router.get('/:senderId/:receiverId', fetchuser, async (req, res) => {
   // Get senderId from the authenticated user

   const senderId=req.user.id;
  const { receiverId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });
    console.log("Fetched Messages:", messages); 
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }

  console.log("Sender ID:", senderId);
  console.log("Receiver ID:", receiverId);
});



module.exports = router;