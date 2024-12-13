// src/Login.js
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { AiOutlineMail, AiFillLock } from "react-icons/ai";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import LiveBackground from "./LiveBackground";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const history = useHistory();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      history.push("/");
    } catch (error) {
      let errorMessage = "Failed to log in. Please try again.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "No user found with this email.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Please try again later.";
      }
      setError(errorMessage);
      console.error("Error logging in:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = () => {
    alert(
      "Contact ajelizarovas@rairdon.com to reset password. This is currently disabled."
    );
  };

  return (
    <div className="relative min-h-screen">
      {/* Live Background */}
      <LiveBackground />

      {/* Login Form */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md p-6    backdrop-blur-md rounded-lg shadow-lg border border-white border-opacity-10 ">
          <div className="flex items-center justify-start gap-2 ">
            <img
              src="/apple-touch-icon.png" // Use the Apple Touch Icon as the logo
              alt="Hofb.app Logo"
              className="mx-auto  w-24 rounded-2xl"
            />
            <div className="flex flex-col flex-grow ">
              <h2 className="text-4xl font-bold   uppercase ">
                HofB
              </h2>
              <p className=" text-gray-300 text-xs mb-6">
                One-stop inventory viewing tool.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col mt-6 gap-4">
            <label
              htmlFor="email"
              className="text-sm font-medium flex items-center gap-2"
            >
              <AiOutlineMail /> Email
            </label>
            <input
              id="email"
              className="px-4 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-white"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
            />

            <label
              htmlFor="password"
              className="text-sm font-medium flex items-center gap-2"
            >
              <AiFillLock /> Password
            </label>
            <div className="relative">
              <input
                id="password"
                className="px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-white w-full"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 text-sm text-gray-400 hover:text-white focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>

            <button
              type="submit"
              className={`w-full py-2 rounded bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 focus:ring-offset-gray-800 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </form>

          <div className="mt-4 text-sm text-center">
            <p>
              <span
                onClick={handleResetPassword}
                className="text-blue-400 hover:underline cursor-pointer"
              >
                Forgot password?
              </span>
            </p>
            <p className="mt-2">
              Need access?{" "}
              <a
                href="mailto:ajelizarovas@rairdon.com"
                className="text-blue-400 hover:underline"
              >
                Request access
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
