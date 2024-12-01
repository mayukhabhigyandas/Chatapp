import React, { useState, useEffect, useContext, useMemo } from "react";
import { io } from "socket.io-client";
import chatContext from "../context/chat/chatContext";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const context = useContext(chatContext);
  const { chats, getChats, addChat } = context;

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [error, setError] = useState("");
  const senderId = sessionStorage.getItem("userId");
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const socket = useMemo(() => {
    if (token) {
      return io("http://localhost:9000", { auth: { token } });
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
    if (receiverId) {
      const senderId = sessionStorage.getItem("senderId");
      console.log("Calling getChats with:", senderId, receiverId); // Log senderId and receiverId
      getChats(senderId, receiverId);
    }

    if (socket) {
      socket.on("receiveMessage", (newMessage) => {
        if (
          (newMessage.senderId === senderId && newMessage.receiverId === receiverId) ||
          (newMessage.senderId === receiverId && newMessage.receiverId === senderId)
        ) {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      });
      if (receiverId) {
        socket.emit('joinRoom', receiverId);
      }
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [receiverId, senderId, socket, getChats, token, navigate]);

const sendMessage = async () => {
  if (message.trim()) {
    const chatData = {
      senderId,
      receiverId,
      message,
      time: new Date().toLocaleTimeString(),
    };

    console.log("Sending message:", chatData);

    try {
      // Emit message via WebSocket using the existing socket instance
      if (socket) {
        socket.emit("send_message", chatData);
      }

      // Optimistically update the UI
      setMessages((prev) => [...prev, chatData]);
      setMessage("");

      
      // Save message to the backend (ensure this is async if necessary)
      await addChat(senderId, receiverId, message); // Assuming addChat is async
      console.log("Chat data being sent:", chatData);
    } catch (error) {
      console.error("Error sending message: ", error);
      setError("Failed to send message, please try again.");
    }

  }
};

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>Chat Application</h2>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter Receiver ID"
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
          style={{
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            width: "100%",
          }}
        />
      </div>
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "10px",
          padding: "10px",
          height: "300px",
          overflowY: "auto",
        }}
      >
        {chats.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: msg.senderId === senderId ? "flex-end" : "flex-start", // Align right or left
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                backgroundColor: msg.senderId === senderId ? "#DCF8C6" : "#FFFFFF",
                padding: "10px",
                borderRadius: "10px",
                maxWidth: "60%",
                wordWrap: "break-word",
                border: msg.senderId === senderId ? "1px solid #007bff" : "1px solid #ccc",
                textAlign: "left", // Ensure text inside is left-aligned
              }}
            >
              <strong>{msg.senderId === senderId ? "You" : `User ${msg.senderId}`}: </strong>
              {msg.message}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            marginRight: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <button onClick={sendMessage} style={{ padding: "10px 20px", borderRadius: "5px" }}>
          Send
        </button>
      </div>
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
};

export default Chat;
