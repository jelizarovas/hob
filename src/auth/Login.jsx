// src/Login.js
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const history = useHistory();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      history.push("/");
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };
  return (
    <div className="w-96 mx-auto p-10">
      <h2>Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-4 text-black">
        <input
          className="px-4 py-1 rounded"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          className="px-4 py-1 rounded"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit" className="bg-gray-500 rounded p-1">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
