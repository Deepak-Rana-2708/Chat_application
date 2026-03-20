import React, { useState } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { IoSend } from "react-icons/io5";
import { MdImage } from "react-icons/md";
import EmojiPicker from "emoji-picker-react";
import { encryptData, decryptData } from "../Encrypt/encrypt";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleSend = async () => {
    if (!message.trim() && !selectedImage) return;

    if (selectedImage) {
      const formData = new FormData();
      formData.append("file", selectedImage);

      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          `${API_URL}/api/v1/file/upload`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );

        const decryptedResponse = decryptData(res.data);
        const filePath = decryptedResponse.filePath;
        const fileUrl = `${API_URL}/${filePath.replace(/\\/g, "/")}`;
        console.log("file path : ", fileUrl);
        onSendMessage(fileUrl, "image"); // msgType = image
        setSelectedImage(null);
      } catch (err) {
        console.log("Image upload error", err);
      }
    } else {
      onSendMessage(message, "text"); // msgType = text
    }

    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.inputArea}>
        {/* Emoji button */}
        <button
          style={styles.iconBtn}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <BsEmojiSmile size={22} />
        </button>

        {/* Emoji picker */}
        {showEmojiPicker && (
          <div style={styles.emojiPicker}>
            <EmojiPicker
              onEmojiClick={(emojiObject) =>
                setMessage((prev) => prev + emojiObject.emoji)
              }
            />
          </div>
        )}

        {/* Image button */}
        <label style={styles.iconBtn}>
          <MdImage size={22} />
          <input
            type="file"
            style={{ display: "none" }}
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSelectedImage(e.target.files[0]);
              }
            }}
          />
        </label>

        {/* Text input */}
        <input
          type="text"
          placeholder="Type a message..."
          style={styles.input}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
        />

        {/* Send button */}
        <button style={styles.sendBtn} onClick={handleSend}>
          <IoSend size={20} />
        </button>
      </div>

      {/* Image preview */}
      {selectedImage && (
        <div style={styles.preview}>
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="preview"
            style={{ maxHeight: "100px", borderRadius: "6px" }}
          />
          <button
            onClick={() => setSelectedImage(null)}
            style={styles.removePreviewBtn}
          >
            X
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    borderTop: "1px solid #e5e7eb",
    padding: "10px 15px",
    background: "white",
    flexShrink: 0,
    overflow: "visible",
    position: "relative",
  },

  inputArea: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    position: "relative",
  },

  iconBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
  },

  input: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    outline: "none",
  },

  sendBtn: {
    border: "none",
    background: "#6366f1",
    color: "white",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  emojiPicker: {
    position: "absolute",
    bottom: "50px", // input ke thoda upar
    left: "0", // input ke start se align
    zIndex: 2000, // header ke upar ke liye
  },

  preview: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "8px",
  },

  removePreviewBtn: {
    border: "none",
    background: "#ef4444",
    color: "white",
    padding: "2px 6px",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default ChatInput;
