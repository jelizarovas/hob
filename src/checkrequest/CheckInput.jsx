import React from "react";
import { MdClear } from "react-icons/md";

const CheckInput = ({
  label,
  name,
  value,
  placeholder,
  type = "text",
  onChange,
  multiline = false,
  icon,
}) => {
  return (
    <div className="my-2 text-md focus-within:text-indigo-300 selection:bg-indigo-400 selection:text-white">
      <label className=" text-sm flex items-center gap-2 mb-1  opacity-80 ">
        {icon && <span className="">{icon}</span>}
        {label}
      </label>
      {multiline ? (
        <textarea
          className="border flex items-center outline-none border-gray-500 focus-within:border-indigo-500  rounded bg-white bg-opacity-5 hover:bg-opacity-15 focus-within:bg-opacity-15 p-2 w-full bg-transparent text-white focus-within:text-indigo-200"
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          rows={2}
          
        />
      ) : (
        <div className="border flex items-center border-gray-500 focus-within:border-indigo-500  rounded bg-white bg-opacity-5 hover:bg-opacity-15 focus-within:bg-opacity-15 p-2 w-full bg-transparent text-white focus-within:text-indigo-200">
          <input
            className="w-full flex-grow bg-transparent outline-none"
            name={name}
            value={value}
            placeholder={placeholder}
            type={type}
            onChange={onChange}
          />
          {value.toString().length > 0 && (
            <button
            tabIndex={-1}
              onClick={() => onChange({ target: { name, value: "" } })}
              className="border border-white border-opacity-50 opacity-40 hover:opacity-100 rounded-full p-0.5"
            >
              <MdClear />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckInput;
