import React from "react";
import { FaUserCircle } from "react-icons/fa";

const ChatHeader = ({ selectedUser }) => {

  if (!selectedUser) {
    return null;
  }

  return (

    <div style={styles.chatHeader}>

      <FaUserCircle size={30} color="#6366f1" />

      <div style={styles.headerName}>
        {selectedUser.name}
      </div>

    </div>

  );

};

const styles = {

chatHeader: {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "14px 20px",
  background: "#f9fafb",
  borderBottom: "1px solid #e5e7eb",
  flexShrink: 0
},

  headerName: {
    fontSize: "16px",
    fontWeight: "600"
  }

};

export default ChatHeader;