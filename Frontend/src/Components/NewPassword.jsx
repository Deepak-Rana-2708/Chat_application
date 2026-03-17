import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {encryptData, decryptData } from "../Encrypt/encrypt";
import { useLocation, useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

const NewPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const q = params.get("q");

    if (!q) {
      navigate("/forgot-password");
      return;
    }

    const parsed = JSON.parse(decodeURIComponent(q));

    const decrypted = decryptData(parsed);

    if (!decrypted?.allow) {
      navigate("/forgot-password");
    }
  }, []);

const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);

  try {

    // 1️⃣ localStorage se OTP nikalo
    const otp = localStorage.getItem("otp");

    if (!otp) {
      toast.error("OTP not found");
      return;
    }

    // 2️⃣ encrypt data
    const encryptedDataObj = encryptData({
      otp: otp,
      password: password
    });

    // 5️⃣ API call
    const res = await axios.post(
      `${API_URL}/api/v1/user/NewPassword`,encryptedDataObj
    );

    // 6️⃣ decrypt response
    const decryptResponse = decryptData(res.data);

    toast.success(decryptResponse.message);

    // 7️⃣ OTP remove
    localStorage.removeItem("otp");

    // 8️⃣ redirect login
    navigate("/login");

  } catch (error) {

    if (error.response?.data) {
      const decryptedError = decryptData(error.response.data);
      toast.error(decryptedError.message);
    } else {
      toast.error("Something went wrong");
    }

  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-[420px] max-w-[95%]">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Set New Password
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-3 rounded-lg mb-4"
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border p-3 rounded-lg mb-5"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewPassword;
