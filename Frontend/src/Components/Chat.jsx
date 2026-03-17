import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import { socket } from "../socket";

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const width = window.innerWidth;
    setIsMobile(width < 768);
    setShowSidebar(width >= 768);
  }, []);

  useEffect(() => {
    let timer;
    const handleResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const width = window.innerWidth;
        setIsMobile(width < 768);
        setShowSidebar(width >= 768);
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setShowSidebar((prev) => !prev);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    if (isMobile) setShowSidebar(false);
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    socket.io.opts.query = { userId };
    socket.connect();
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <Header toggleSidebar={toggleSidebar} isMobile={isMobile} />

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        {showSidebar && <Sidebar onSelectUser={handleUserSelect} />}

        {/* Chat Window */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <ChatWindow selectedUser={selectedUser} />
        </div>
      </div>
    </div>
  );
};

export default Chat;