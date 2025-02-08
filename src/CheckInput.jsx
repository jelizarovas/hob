import React from "react";
import { PDFDocument, rgb, TextAlignment } from "pdf-lib";
import download from "downloadjs";

import { MdClear, MdUndo } from "react-icons/md";
import { useLocation, useHistory, Link } from "react-router-dom";

export const CheckInput = ({
  name,
  placeholder = "",
  Icon = undefined,
  type = "text",
  inputMode,
  step,
  value,
  defaultValue,
  onChange,
  readOnly = false,
  units = "",
  align = "left",
  label = "",
  min = 0,
  onBlur = () => {},
  helperText = "",
  autoFocus = false,
  Helper = () => {
    return null;
  },
  ActionButton = () => {
    return null;
  },
  meta,
  labelAction = null,
  className = "",
  containerClassName = "",
  onKeyDown = null,
  pattern = null,
  input,
  disableSelectOnFocus = false,
  ...rest
}) => {
  const textAlign = {
    center: "text-center",
    left: "text-left",
    right: "text-right",
  };

  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (autoFocus) inputRef.current.focus();
  }, [autoFocus]);

  return (
    <div
      className={`w-full  ${
        defaultValue && defaultValue !== value ? "bg-slate-100 rounded-lg" : ""
      }  focus-within:text-slate-300 max-w-lg box-border mb-2 transition-all ${containerClassName}`}
    >
      {!!label && type !== "hidden" && (
        <label htmlFor={name} className="text-xs font-sans   text-justify pl-2 flex justify-between items-center">
          {label}{" "}
          {labelAction && (
            <button type="button" onClick={labelAction}>
              <MdClear />
            </button>
          )}
          {/* {defaultValue && defaultValue !== value && (
            <button
              className="px-2 flex items-center space-x-2 bg-black bg-opacity-5 rounded-md text-[8px]"
              onClick={revertHandler(
                onChange ? onChange : input?.onChange,
                defaultValue,
                name
              )}
            >
              <MdUndo />
              <span>{defaultValue}</span>
            </button>
          )} */}
        </label>
      )}
      <div className="relative w-full flex justify-between items-center  bg-white bg-opacity-70  hover:border-slate-300 hover:focus-within:border-slate-500  rounded-md  border focus-within:border-slate-400 transition-all  ">
        {!!Icon && <Icon className="ml-2 min-w-fit" />}
        <input
          {...rest}
          onKeyDown={onKeyDown}
          ref={inputRef}
          type={type}
          name={name}
          placeholder={placeholder?.toString()}
          autoComplete="off"
          value={value || ""}
          // onChange={onChange}
          step={step}
          readOnly={readOnly}
          inputMode={inputMode}
          min={min}
          onBlur={onBlur}
          pattern={pattern}
          // onFocus={(e) => !disableSelectOnFocus && e.target.select()}
          {...input}
          onChange={onChange ? onChange : input?.onChange}
          onPaste={pasteHandler(onChange ? onChange : input?.onChange)}
          className={`w-full px-2 py-1 flex-grow  text-black text-sm focus:text-gray-900 ${textAlign[align]} bg-transparent outline-none ${className}`}
        />

        {units && (
          <span className="  flex items-center pr-2  cursor-pointer opacity-20 focus:opacity-100 hover:opacity-100">
            {units}
          </span>
        )}
        {ActionButton && (
          // <span className="  flex items-center pr-2  cursor-pointer opacity-20 focus:opacity-100 hover:opacity-100">
          <ActionButton />
          // </span>
        )}
      </div>
      {helperText && <div className="text-xs text-gray-600 mx-2">{helperText}</div>}
      {!!Helper && <Helper />}
      {meta?.touched && meta?.error && <span className="text-xs text-red-400 mx-2">{meta.error}</span>}
    </div>
  );
};

const pasteHandler = (onChange) => {
  return function (event) {
    event.preventDefault();
    let selectionStart = event.target.selectionStart;
    let selectionEnd = event.target.selectionEnd;
    let pasteText = event.clipboardData.getData("text").trim();
    let initialValue = event.target.value;
    event.target.value =
      event.target.value.substring(0, selectionStart) +
      pasteText +
      event.target.value.substring(selectionEnd, initialValue.length);
    onChange(event);
    event.target.selectionStart = selectionStart;
    event.target.selectionEnd = selectionStart + pasteText.length;
  };
};

const revertHandler = (onChange, defaultValue, name) => {
  return function (event) {
    event.preventDefault();
    onChange({ target: { name, value: defaultValue } });
  };
};
