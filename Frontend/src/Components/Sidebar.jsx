import React, { useEffect, useState } from "react";
import axios from "axios";
import { decryptData } from "../Encrypt/encrypt";

const API_URL = import.meta.env.VITE_API_URL;

const Sidebar = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
        setShowSidebar(false);
      } else {
        setIsMobile(false);
        setShowSidebar(true);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API_URL}/api/v1/user/listing-users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const decryptedResponse = decryptData(res.data);

      setUsers(decryptedResponse.data);
    } catch (error) {
      console.log("Users fetch error", error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const handleUserClick = (user) => {
    setSelectedUser(user.allUser);

    onSelectUser(user.allUser); // send id + name

    if (isMobile) {
      setShowSidebar(false);
    }
  };

  return (
    <>
      {isMobile && (
        <button
          style={styles.hamburger}
          onClick={() => setShowSidebar(!showSidebar)}
        >
          ☰
        </button>
      )}

      <div
        style={{
          ...styles.sidebar,
          left: showSidebar ? "0" : "-280px",
        }}
      >
        <div style={styles.title}>Chats</div>

        <div style={styles.userList}>
          {users.map((user) => {
            const firstLetter = user.allUser.name.charAt(0).toUpperCase();

            return (
              <div
                key={user.allUser._id}
                style={{
                  ...styles.userItem,
                  background:
                    selectedUser?._id === user.allUser._id
                      ? "#6366f1"
                      : "transparent",
                  color:
                    selectedUser?._id === user.allUser._id ? "white" : "black",
                }}
                onClick={() => handleUserClick(user)}
              >
                <div style={styles.avatar}>{firstLetter}</div>

                <div style={styles.userName}>{user.allUser.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

const styles = {
  hamburger: {
    position: "fixed",
    top: "15px",
    left: "15px",
    fontSize: "22px",
    border: "none",
    background: "white",
    cursor: "pointer",
    zIndex: "2000",
    padding: "6px 10px",
    borderRadius: "6px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  },

  sidebar: {
    width: "280px",
    height: "calc(100vh - 60px)",
    position: "fixed",
    top: "60px",
    left: 0,

    background: "linear-gradient(135deg, #dbeafe, #e5e7eb, #bae6fd)",

    borderTopRightRadius: "20px",
    borderBottomRightRadius: "20px",

    boxShadow: "4px 0 20px rgba(0,0,0,0.08)",

    zIndex: 1500,
    transition: "left 0.3s ease",
    display: "flex",
    flexDirection: "column",
  },

  title: {
    padding: "18px",
    fontSize: "18px",
    fontWeight: "600",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.4)",
    backdropFilter: "blur(6px)",
  },

  userList: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    paddingTop: "10px", // spacing from top
    display: "flex",
    flexDirection: "column",
    gap: "6px", // gap between users
  },

  userItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 18px",
    cursor: "pointer",
    transition: "0.25s",
    borderRadius: "10px",
  },

  avatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#4f46e5",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "16px",
    flexShrink: 0,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },

  userName: {
    fontSize: "15px",
    fontWeight: "500",
  },
};

export default Sidebar;
