import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
import { encryptData, decryptData } from "../Encrypt/encrypt";
import toast from "react-hot-toast";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false); // Loading state add

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return; // Agar request already chal rahi ho, return kar do

    setLoading(true); // Button disable karne ke liye

    try {
      const encryptedBody = encryptData(formData);

      // URL query id handle karte hue
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get("id");

      // POST request
      const res = id
        ? await axios.post(
            `${API_URL}/api/v1/user/signup?id=${id}`,
            encryptedBody,
          )
        : await axios.post(`${API_URL}/api/v1/user/signup`, encryptedBody);

      // Decrypt response
      const decryptedResponse = decryptData(res.data);

      if (decryptedResponse.success) {
        toast.success(decryptedResponse.message || "Signup successful");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        toast.error(decryptedResponse.message || "Signup failed");
      }
    } catch (error) {
      if (error.response?.data) {
        const decryptedError = decryptData(error.response.data);
        toast.error(decryptedError.message || "Something went wrong");
      } else {
        toast.error("Network error");
      }
      console.error(error);
    } finally {
      setLoading(false); // Request complete hone par button enable
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black-500 to-indigo-600 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label className="block text-sm font-semibold mb-1">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="text-left">
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="text-left">
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading} // Button disable while loading
            className={`w-full py-2 rounded-lg transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer font-semibold"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Signup;
