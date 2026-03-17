import { useState, useRef, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { encryptData, decryptData } from "../Encrypt/encrypt";
import { useLocation, useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

const VerifyOTP = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);

  const inputs = useRef([]);

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

  const handleChange = (e, index) => {
    const value = e.target.value;

    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];

    newOtp[index] = value;

    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(paste)) return;

    const newOtp = paste.split("");

    setOtp(newOtp);

    newOtp.forEach((num, i) => {
      inputs.current[i].value = num;
    });
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      toast.error("Enter valid OTP");
      return;
    }

    try {
      setLoading(true);
      const encryptedDataObj = encryptData({otp: finalOtp });
      const res = await axios.post(
        `${API_URL}/api/v1/user/verify-otp`,
        encryptedDataObj,
      );
      const decryptedResponse = decryptData(res.data);
      toast.success(decryptedResponse.message);
        localStorage.setItem("otp", finalOtp);
      const encrypted = encodeURIComponent(location.search.split("q=")[1]);

      navigate(`/new-password?q=${encrypted}`);
    } catch (err) {
      if (err.response?.data) {
        const decryptedError = decryptData(err.response.data);

        toast.error(decryptedError.message);
      } else {
        toast.error("Invalid OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-[420px] max-w-[95%]">
        <h2 className="text-2xl font-semibold text-center mb-6">Verify OTP</h2>

        <form onSubmit={handleVerify}>
          <div className="flex justify-between mb-6">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                ref={(el) => (inputs.current[index] = el)}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl border rounded-lg"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
