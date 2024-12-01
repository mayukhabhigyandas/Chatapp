// ChatState.js
import React, { useState } from "react";
import ChatContext from "./chatContext";

const ChatState = (props) => {
  const host = "http://localhost:9000";
  const [chats, setChats] = useState([]);

  // Get all chats
const getChats = async (senderId, receiverId) => {
  console.log("getChats called with:", senderId, receiverId);
  try {
    const response = await fetch(`${host}/api/messages/${senderId}/${receiverId}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'auth-token': sessionStorage.getItem('token'),
      },
    });
    
    const json = await response.json();
    console.log(json);
    console.log(senderId);
    setChats(Array.isArray(json) ? json : []); // Ensure chats is an array
  } catch (error) {
    console.error("Failed to fetch chats", error);
    setChats([]); // Set to an empty array on failure
  }
};

  // Add a chat
  const addChat = async ( senderId, receiverId, message) => {
    try {
      const response = await fetch(`${host}/api/messages/addchat`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'auth-token': sessionStorage.getItem('token')
        },
        body: JSON.stringify({ senderId, receiverId, message }),
      });

      if (!response.ok) {
        throw new Error('Failed to save message');
      }

      const chat = await response.json();

      setChats((prevChats) => [...prevChats, chat]);
    } catch (error) {
      console.error("Failed to add chat", error);
    }
  };

  return (
    <ChatContext.Provider value={{ chats, getChats, addChat }}>
      {props.children}
    </ChatContext.Provider>
  );
};

export default ChatState;
