import React from "react";

export const Kbd = ({ label, className = "", ...props }) => (
  <kbd
    className={`text-[8px]  border uppercase leading-tight p-0.5 px-1 rounded text-gray-400 ${className}`}
    {...props}
  >
    {label}
  </kbd>
);
