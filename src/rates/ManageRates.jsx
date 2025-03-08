import React, { useState } from "react";
import {
  MdAddCircleOutline,
  MdArrowDropDownCircle,
  MdCalendarMonth,
  MdDragHandle,
  MdDragIndicator,
  MdExpandMore,
  MdKeyboardArrowDown,
  MdMenu,
  MdOutlineMoreHoriz,
  MdOutlineMoreVert,
} from "react-icons/md";

const ManageRates = ({ presetToEdit, onSave }) => {
  return (
    <div className="container bg-white bg-opacity-5 p-2 rounded">
      <div className="flex w-full">
        <h1 className="flex-grow">Rates</h1>
        <button>
          <MdAddCircleOutline />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-x-2 ">
          <RateInput
            label="Type"
            value="USED"
            className="w-10"
            ButtonIcon={MdKeyboardArrowDown}
          />
          <RateInput
            label="Year"
            value="2025"
            className="w-8"
            ButtonIcon={MdKeyboardArrowDown}
          />
          <RateInput
            label="Make"
            value="Honda"
            className="w-16"
            ButtonIcon={MdKeyboardArrowDown}
          />
          <RateInput
            label="Model"
            value="Passport"
            className="w-16"
            ButtonIcon={MdKeyboardArrowDown}
          />
          <RateInput
            label="Start"
            value="3/4/2025"
            className="w-16"
            ButtonIcon={MdCalendarMonth}
          />
          <RateInput
            label="Expire"
            value="4/30/2025"
            className="w-16"
            ButtonIcon={MdCalendarMonth}
          />
        </div>
        <div className="flex gap-x-2 ">
          <RateInput
            label="Start"
            value="24"
            className="w-6 text-right"
            ButtonIcon={MdKeyboardArrowDown}
          />
          <RateInput
            label="End"
            value="48"
            className="w-6 text-right"
            ButtonIcon={MdKeyboardArrowDown}
          />
        </div>
        <div className="flex">
          <div className="flex flex-col gap-1 select-none cursor-pointer  ">
            <div className="flex items-center bg-white bg-opacity-0 hover:bg-opacity-5 rounded">
              <span className="text-xs opacity-75 pl-2 py-1 text-right  rounded">
                24 - 48 mos.
              </span>
              <MdExpandMore className=" text-lg border-white border-opacity-35  opacity-55 mx-2" />
            </div>
            <span className="text-sm text-right px-4 py-1 border border-white border-opacity-10 rounded">
              12.99 %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const RateInput = ({
  label,
  value,
  name,
  onChange,
  disabled,
  className,
  ButtonIcon,
  ...props
}) => {
  return (
    <label className="flex-col flex">
      <span className="text-xs opacity-75">{label}</span>
      <div
        className={` px-2 flex  text-sm bg-white bg-opacity-5 rounded hover:bg-opacity-15 focus-within:bg-opacity-10 outline-none `}
      >
        <input
          onChange={onChange}
          name={name}
          value={value}
          disabled={disabled}
          type="text"
          autoComplete="off"
          className={`px-0 py-1 flex-grow bg-transparent outline-none ${className}`}
        />
        {ButtonIcon && (
          <button className="pl-2 py-1 rounded-full outline-none  bg-white bg-opacity-0">
            <ButtonIcon />
          </button>
        )}
      </div>
    </label>
  );
};

export default ManageRates;
