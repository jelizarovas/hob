import React from "react";

export const QuoteInput = ({
  name,
  value,
  label,
  Icon,
  onChange,
  type = "number",
  className = "",
  onBlur,
  ...props
}) => {
  return (
    <label className="flex flex-col text-left print:text-black print:flex-row">
      <span className="text-[10px] print:text-sm">{label}</span>
      <div className="bg-white bg-opacity-5 hover:bg-opacity-50 transition-all rounded-md text-sm flex flex-row">
        {Icon && <span>{Icon}</span>}
        <input
          name={name}
          className={`bg-transparent px-2 py-1 text-white print:text-black flex-grow outline-none  ${className} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
          type={type}
          onChange={onChange}
          value={value || ""}
          onBlur={onBlur}
        />
      </div>
    </label>
  );
};
