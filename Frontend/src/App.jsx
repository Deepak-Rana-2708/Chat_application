import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Chat from "./Components/Chat";
import Signup from "./Components/Signup";
import Login from "./Components/Login";
import ForgotPassword from "./Components/ForgotPassword";
import VerifyOTP from "./Components/VerifyOtp";
import NewPassword from "./Components/NewPassword";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            animation: "slideInRight 0.3s ease",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-verify" element={<VerifyOTP />} />
        <Route path="/new-password" element={<NewPassword />} />
      </Routes>
    </>
  );
}

export default App;
