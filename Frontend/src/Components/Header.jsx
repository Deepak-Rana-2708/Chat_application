import React, { useState, useEffect, useRef } from "react";
import { FaUserCircle, FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { socket } from "../socket";
import { encryptData, decryptData } from "../Encrypt/encrypt";
import { IoLogOutOutline } from "react-icons/io5";

const API_URL = import.meta.env.VITE_API_URL;

const Header = ({ toggleSidebar, isMobile }) => {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("User");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) setUserName(name);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    socket.on("new_invite_notification", (data) => {
      const newNotification = {
        _id: data.notificationId,
        message: data.message,
        createdAt: data.createdAt,
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setHasNewNotification(true);
    });

    return () => {
      socket.off("new_invite_notification");
    };
  }, []);
  // Fetch Notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${API_URL}/api/v1/user/listing-notifications?receiverId=${localStorage.getItem(
            "userId",
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const decryptedResponse = decryptData(res.data);

        setNotifications(decryptedResponse.data || []);
      } catch (error) {
        console.log("Notification fetch error", error);
      }
    };

    fetchNotifications();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    delete axios.defaults.headers.common["Authorization"];
    navigate("/login");
  };

  const handleInviteClick = () => {
    setDropdownOpen(false);
    setInviteOpen(true);
  };

const sendInvite = async () => {
  if (!email) return;

  try {
    const token = localStorage.getItem("token");

    const encryptedData = encryptData({ email });

    const res = await axios.post(
      `${API_URL}/api/v1/user/invite-user`,
      encryptedData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const decryptResponse = decryptData(res.data);

    if (!decryptResponse.success) {
      toast.error(decryptResponse.message);
      return;
    }

    toast.success(decryptResponse.message || "Invite sent successfully");

    setEmail("");
    setInviteOpen(false);

  } catch (error) {

    try {
      const decryptedError = decryptData(error.response.data);
      toast.error(decryptedError.message);
    } catch {
      toast.error("Failed to send invite");
    }

  }
};

  const handleAccept = async (notif) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API_URL}/api/v1/user/accept-invite`,
        {
          senderto: notif.sender,
          notificationId: notif._id,
          status: "accepted",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message || "Invite accepted");

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notif._id ? { ...n, status: "accepted" } : n,
        ),
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleReject = async (notif) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API_URL}/api/v1/user/accept-invite`,
        {
          senderto: notif.sender,
          notificationId: notif._id,
          status: "rejected",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message || "Invite rejected");

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notif._id ? { ...n, status: "rejected" } : n,
        ),
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      sendInvite();
    }
  };

  return (
    <>
      <header style={styles.header}>
        <div style={styles.leftSection}>
          {isMobile && (
            <button style={styles.hamburger} onClick={toggleSidebar}>
              ☰
            </button>
          )}

          <div style={styles.logo}>ChatApp</div>
        </div>

        <div style={styles.userSection} ref={dropdownRef}>
          {/* Bell Icon */}
          <div
            style={styles.bellIcon}
            onClick={() => {
              setNotificationOpen((prev) => !prev);
              setHasNewNotification(false);
            }}
          >
            <FaBell size={20} />
            {hasNewNotification && <span style={styles.redDot}></span>}
          </div>

          {/* Notification Dropdown */}
          {notificationOpen && (
            <div style={styles.notificationDropdown}>
              {notifications.length === 0 ? (
                <div style={styles.noNotification}>No notifications</div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif._id} style={styles.notificationItem}>
                    <div style={styles.notificationText}>{notif.message}</div>

                    {notif.status === "pending" ? (
                      <div style={styles.actionBtns}>
                        <button
                          style={styles.acceptBtn}
                          onClick={() => handleAccept(notif)}
                        >
                          Accept
                        </button>

                        <button
                          style={styles.rejectBtn}
                          onClick={() => handleReject(notif)}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div style={styles.statusText}>
                        {notif.status === "accepted"
                          ? "Accepted ✅"
                          : "Rejected ❌"}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* User Profile */}
          <div
            style={styles.userInfo}
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <FaUserCircle size={30} />
            <span style={styles.username}>{userName}</span>
          </div>

          {dropdownOpen && (
            <div style={styles.dropdown}>
              <button style={styles.dropdownBtn} onClick={handleInviteClick}>
                Invite Friend
              </button>

              <button
                style={{
                  ...styles.dropdownBtn,
                  background: "#ef4444",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onClick={handleLogout}
              >
                <IoLogOutOutline size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Invite Popup */}
      {inviteOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>Invite User</h3>

            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleEnter}
              style={styles.input}
            />

            <div style={styles.modalBtns}>
              <button style={styles.sendBtn} onClick={sendInvite}>
                Send
              </button>

              <button
                style={styles.cancelBtn}
                onClick={() => setInviteOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 15px",
    background: "#1f2937",
    color: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "60px",
    zIndex: 2000,
  },

  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  hamburger: {
    fontSize: "22px",
    border: "none",
    background: "transparent",
    color: "white",
    cursor: "pointer",
  },

  logo: {
    fontSize: "20px",
    fontWeight: 600,
  },

  userSection: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    marginRight: "15px",
    gap: "15px",
  },
  bellIcon: {
    cursor: "pointer",
    position: "relative",
  },
  redDot: {
    position: "absolute",
    top: "2px",
    right: "2px",
    width: "8px",
    height: "8px",
    background: "red",
    borderRadius: "50%",
  },
 notificationDropdown: {
  position: "absolute",
  top: "50px",
  right: "0",
  width: "320px",
  maxWidth: "90vw",

  background: "linear-gradient(135deg, #dbeafe, #e5e7eb, #bae6fd)",

  color: "#111827",
  borderRadius: "14px",

  boxShadow: "0 12px 35px rgba(0,0,0,0.18)",

  maxHeight: "350px",
  overflowY: "auto",
  padding: "10px",
  zIndex: 3000,
},

notificationItem: {
  borderBottom: "1px solid rgba(0,0,0,0.08)",
  padding: "10px 8px",
  borderRadius: "8px",
  transition: "0.2s",
},  

  notificationText: {
    fontSize: "14px",
    marginBottom: "8px",
  },

  actionBtns: {
    display: "flex",
    gap: "10px",
  },

  acceptBtn: {
    background: "#bbf7d0",
    color: "#065f46",
    border: "none",
    padding: "6px 12px",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "500",
  },

  rejectBtn: {
    background: "#fecaca",
    color: "#7f1d1d",
    border: "none",
    padding: "6px 12px",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "500",
  },
noNotification: {
  textAlign: "center",
  padding: "20px",
  color: "#374151",
},

  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  },

  username: {
    fontWeight: 500,
  },

  dropdown: {
    position: "absolute",
    top: "45px",
    right: "0",
    background: "#fff",
    color: "#000",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    minWidth: "160px",
    overflow: "hidden",
  },

  dropdownBtn: {
    padding: "10px 15px",
    border: "none",
    background: "#f3f4f6",
    cursor: "pointer",
    textAlign: "left",
  },

overlay: {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 5000,
},

 modal: {
  background: "linear-gradient(135deg, #dbeafe, #e5e7eb, #bae6fd)",
  padding: "25px",
  borderRadius: "16px",
  width: "320px",
  display: "flex",
  flexDirection: "column",
  gap: "15px",

  boxShadow: "0 15px 45px rgba(0,0,0,0.25)",
},

  input: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
  },

  modalBtns: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },

  sendBtn: {
    background: "#6366f1",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  cancelBtn: {
    background: "#e5e7eb",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default Header;
