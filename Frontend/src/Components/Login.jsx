import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { encryptData, decryptData } from "../Encrypt/encrypt";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const encryptedData = encryptData(formData);
      const res = await axios.post(
        `${API_URL}/api/v1/user/login`,
        encryptedData,
      );
      console.log("Api : ", API_URL);
      const data = decryptData(res.data);

      if (data.success) {
        toast.success(data.message || "Login successful");

        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.data._id);

          axios.defaults.headers.common["Authorization"] =
            `Bearer ${data.token}`;
        }

        setTimeout(() => {
          navigate("/chat");
        }, 1200);
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      try {
        const decryptedError = decryptData(error.response.data);
        toast.error(decryptedError.message || "Login failed");
      } catch {
        toast.error("Something went wrong");
      }

      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black-500 to-indigo-600 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Welcome Back
        </h2>

        <p className="text-center text-gray-500 mb-6">
          Login to continue chatting
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-left">
            <label className="block text-sm font-semibold mb-1">Email</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="text-left">
            <label className="block text-sm font-semibold mb-1">Password</label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            Login
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-2">
        <span
          className="text-indigo-600 cursor-pointer font-semibold hover:underline"
          onClick={() => {
            const encrypted = encryptData({ allow: true });
            const query = encodeURIComponent(JSON.stringify(encrypted));

            navigate(`/forgot-password?q=${query}`);
          }}
        >
          Forgot Password?
        </span>
      </p>

        <p className="text-center text-sm mt-6 text-gray-600">
          Don’t have an account?{" "}
          <span
            className="text-indigo-600 cursor-pointer font-semibold hover:underline"
            onClick={() => navigate("/signup")}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
