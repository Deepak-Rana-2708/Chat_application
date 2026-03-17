import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { encryptData, decryptData } from "../Encrypt/encrypt";
import { useNavigate, useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const ForgotPassword = () => {

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {

    const params = new URLSearchParams(location.search);
    const q = params.get("q");

    if (!q) {
      navigate("/login");
      return;
    }

    try {

      const parsed = JSON.parse(decodeURIComponent(q));
      const decrypted = decryptData(parsed);

      if (!decrypted?.allow) {
        navigate("/login");
      }

    } catch {
      navigate("/login");
    }

  }, []);

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!email) {
      toast.error("Email required");
      return;
    }

    setLoading(true);

    try {

      const encryptedDataObj = encryptData({ email });

      const jsonString = JSON.stringify(encryptedDataObj);
      const encodedData = encodeURIComponent(jsonString);

      const res = await axios.get(
        `${API_URL}/api/v1/user/forgot-password?data=${encodedData}`
      );

      const decryptResponse = decryptData(res.data);

      toast.success(decryptResponse.message);

      const encrypted = encryptData({ allow: true });
      const query = encodeURIComponent(JSON.stringify(encrypted));

      navigate(`/otp-verify?q=${query}`);

    } catch (error) {

      if (error.response?.data) {

        try {

          const decryptedError = decryptData(error.response.data);
          toast.error(decryptedError.message);

        } catch {

          toast.error("Something went wrong");

        }

      } else {

        toast.error("Server error");

      }

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-[420px] max-w-[95%]">

        <h2 className="text-2xl font-semibold text-center mb-6">
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
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
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

        </form>

      </div>
    </div>
  );

};

export default ForgotPassword;