// ChatWindow.js
import React, { useState, useRef, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import { socket } from "../Socket";
import axios from "axios";
import { encryptData, decryptData } from "../Encrypt/encrypt";

const API_URL = import.meta.env.VITE_API_URL;

const ChatWindow = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selectedUser) return;

    const getAllMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const encryptedId = encryptData({ id: selectedUser._id });
        const queryParam = encodeURIComponent(JSON.stringify(encryptedId));
        const res = await axios.get(
          `${API_URL}/api/v1/user/listing-message?id=${queryParam}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const decryptedResponse = decryptData(res.data);
        const formatted = decryptedResponse.data.map((msg) => ({
          text: msg.message,
          sender: msg.sender?.toString() === currentUserId ? "me" : "other",
          messageType: msg.messageType || "text",
        }));
        setMessages(formatted);
      } catch (err) {
        console.log("chat fetch error", err);
      }
    };

    getAllMessages();
  }, [selectedUser, currentUserId]);

  useEffect(() => {
    socket.on("receive_private_message", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          text: data.msg,
          sender: "other",
          messageType: data.msgType || "text",
        },
      ]);
    });
    return () => socket.off("receive_private_message");
  }, []);

  const handleSendMessage = (text, msgType) => {
    if (!selectedUser) return;
    setMessages((prev) => [
      ...prev,
      { text, sender: "me", messageType: msgType },
    ]);
    socket.emit("private_message", {
      toUserId: selectedUser._id,
      message: text,
      msgType,
    });
  };

  if (!selectedUser) {
    return (
      <div style={styles.noChatWrapper}>
        <div style={styles.noChatBox}>
          <div style={styles.noChatIcon}>💬</div>
          <h3 style={styles.noChatTitle}>No Conversation Selected</h3>
          <p style={styles.noChatText}>
            Choose a user from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <ChatHeader selectedUser={selectedUser} />

      <div style={styles.messagesArea}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={msg.sender === "me" ? styles.sentMsg : styles.receivedMsg}
          >
            {msg.messageType === "text" && msg.text}
            {msg.messageType === "image" && (
              <img
                src={msg.text}
                alt="sent file"
                style={{ maxWidth: "220px", borderRadius: "8px" }}
              />
            )}
            {msg.messageType === "file" && (
              <a
                href={msg.text}
                download
                style={{ color: "#6366f1", textDecoration: "underline" }}
              >
                Download File
              </a>
            )}
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    marginLeft: window.innerWidth > 768 ? "280px" : "0px",
    marginTop: "0px",
    overflow: "hidden",
    background: "#f9fafb",
    transition: "margin-left 0.3s ease",
  },

  messagesArea: {
    flex: 1,
    padding: "20px",
    paddingTop: "12px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    scrollbarWidth: "thin",
    scrollbarColor: "#cbd5e1 transparent",
  },

  receivedMsg: {
    alignSelf: "flex-start",
    background: "#f3f4f6",
    color: "#111827",
    padding: "10px 14px",
    borderRadius: "12px",
    maxWidth: "260px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },

  sentMsg: {
    alignSelf: "flex-end",
    background: "#6366f1",
    color: "white",
    padding: "10px 14px",
    borderRadius: "12px",
    maxWidth: "260px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },

  noChat: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    color: "#6b7280",
  },
  noChatWrapper: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #dbeafe, #e5e7eb, #bae6fd)",
  },

  noChatBox: {
    textAlign: "center",
    background: "#ffffff",
    padding: "30px 40px",
    borderRadius: "16px",
   boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
  },

  noChatIcon: {
    fontSize: "40px",
    marginBottom: "10px",
  },

  noChatTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "6px",
  },

  noChatText: {
    fontSize: "14px",
    color: "#6b7280",
  },
};

export default ChatWindow;
