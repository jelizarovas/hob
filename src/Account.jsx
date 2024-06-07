// src/Account.js
import React from "react";
import { useAuth } from "./auth/AuthProvider";

const Account = () => {
  const { currentUser } = useAuth();

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Account Settings</h2>
      <p className="text-lg mb-2">Email: {currentUser.email}</p>
      {/* Additional account settings and updates can go here */}
    </div>
  );
};

export default Account;
