// src/Account.js
import React from "react";
import { useAuth } from "./auth/AuthProvider";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { Link } from "react-router-dom";

const Account = () => {
  const { currentUser } = useAuth();

  return (
    <div className="container mx-auto p-8">
      <div className="flex space-x-4  text-2xl font-bold mb-4">
        <Link
          className="w-24 bg-white bg-opacity-5 flex items-center justify-center rounded hover:bg-opacity-20 transition-all"
          to="/"
        >
          <MdKeyboardArrowLeft />
        </Link>
        <h2 className="flex-grow px-4">Account Settings</h2>
      </div>
      <p className="text-lg mb-2">Email: {currentUser.email}</p>
      <div className="flex flex-col space-y-2">
        <AccountInput label="Full Name" value={currentUser.displayName} />
        <AccountInput label="Address" value={currentUser.displayName} />
      </div>
    </div>
  );
};

const AccountInput = ({
  label,
  value = "",
  placeholder = "",
  type = "text",
  onChange,
  ...props
}) => {
  const [inputValue, setInputValue] = React.useState(value);

  return (
    <label className="flex flex-col">
      <span className="text-xs uppercase opacity-50 mb-1">{label}</span>
      <input
        className="bg-transparent px-2 py-1 border border-white border-opacity-10 rounded"
        value={inputValue}
        // placeholder={placeholder}
        type={type}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Disabled"
        disabled
      />
    </label>
  );
};

export default Account;
