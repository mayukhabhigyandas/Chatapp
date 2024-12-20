import React from 'react';
import Home from './components/Home';
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import ChatState from "./context/chat/chatstate";
import Signup from "./components/Signup";
import About from "./components/About";
import Alert  from "./components/Alert";
import { BrowserRouter as Router, Routes, Route , Navigate } from "react-router-dom";
import { useState } from "react";

function App() {
  const [alert, setAlert ] =useState(null);
  const showAlert= (message, type)=>{
    setAlert({
      msg:message,
      type:type
    })
    setTimeout(()=>{
      setAlert(null);
      
    }, 1500);
  }

  return (
    
    <ChatState>
      <Router>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home showAlert={showAlert}/>} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login showAlert={showAlert}/>} />
            <Route path="/signup" element={<Signup showAlert={showAlert}/>} />
          </Routes>
        </div>
      </Router>
  </ChatState>
  );
}

export default App;
