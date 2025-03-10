import React, { useState, useEffect } from "react";
import {
  MdAddCircleOutline,
  MdArrowDropDownCircle,
  MdCalendarMonth,
  MdDeleteForever,
  MdDragHandle,
  MdDragIndicator,
  MdExpandMore,
  MdKeyboardArrowDown,
  MdMenu,
  MdOutlineMoreHoriz,
  MdOutlineMoreVert,
} from "react-icons/md";
import { DropDown } from "../components/Dropdown";

const ManageRates = ({ presetToEdit, onSave }) => {
  const [selectedRange, setSelectedRange] = useState(null);

  return (
    <div className="container bg-white bg-opacity-5 p-2 rounded">
      <div className="flex w-full">
        <h1 className="flex-grow">Rates</h1>
        <button>
          <MdAddCircleOutline />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 flex-wrap ">
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
        {/* <div className="flex gap-x-2 ">
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
        </div> */}

        <div className="flex">
          <DropDown
            options={["24", "36"]}
            disableSearch={true}
            value={"24"}
            onSelect={(range) => setSelectedRange(range)}
            renderButton={({ buttonRef, isOpen, open, close }) => (
              <button
                ref={buttonRef}
                onClick={() => (isOpen ? close() : open())}
                className={` px-2 flex  text-sm bg-white bg-opacity-5 rounded hover:bg-opacity-15 focus-within:bg-opacity-10 outline-none `}
              >
                <input
                  onChange={() => {}}
                  name={"rate"}
                  value={25}
                  disabled={"false"}
                  type="text"
                  autoComplete="off"
                  className={`px-0 py-1 flex-grow bg-transparent outline-none`}
                />
                <MdExpandMore className="text-lg border-white border-opacity-35 opacity-55 mr-2" />
              </button>
            )}
          />
        </div>

        <div className="flex">
          <RateOption />
          <div className="flex items-center text-lg ">
            <button className="bg-white bg-opacity-0 hover:bg-opacity-15 px-4 py-2 rounded mx-2">
              <MdAddCircleOutline />
            </button>
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

const RateRangeSelector = ({ close, onSelect, value }) => {
  const [start, setStart] = useState(value?.minTerm || "");
  const [end, setEnd] = useState(value?.maxTerm || "");

  // Auto-update whenever start or end changes and both are valid
  useEffect(() => {
    const parsedStart = Number(start);
    const parsedEnd = Number(end);
    if (
      !isNaN(parsedStart) &&
      !isNaN(parsedEnd) &&
      start !== "" &&
      end !== "" &&
      parsedStart <= parsedEnd
    ) {
      onSelect({ minTerm: parsedStart, maxTerm: parsedEnd });
    }
  }, [start, end, onSelect]);

  return (
    <div className="p-2 bg-zinc-800 rounded  text-white">
      <div className="flex gap-x-2">
        <RateInput
          label="Start"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="w-6 text-right"
          ButtonIcon={MdKeyboardArrowDown}
        />
        <RateInput
          label="End"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="w-6 text-right"
          ButtonIcon={MdKeyboardArrowDown}
        />
      </div>
      <div className="flex">
        <button className="flex items-center text-xs py-2 mt-2 w-full border rounded border-white border-opacity-25 gap-2 px-2">
          <MdDeleteForever />
          <span className="whitespace-nowrap">Remove range</span>
        </button>
      </div>
    </div>
  );
};

const RateOption = ({
  setSelectedRange,
  close,
  open,
  selectedRange,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1 select-none cursor-pointer  ">
      <DropDown
        options={[]}
        disableSearch={true}
        value={selectedRange}
        onSelect={(range) => setSelectedRange(range)}
        RenderListContainer={RateRangeSelector}
        renderButton={({ buttonRef, isOpen, open, close }) => (
          <button
            ref={buttonRef}
            onClick={() => (isOpen ? close() : open())}
            className="flex items-center bg-white bg-opacity-0 hover:bg-opacity-5 rounded"
          >
            <span className="text-xs opacity-75 ml-4 py-1 text-right rounded">
              {selectedRange
                ? `${selectedRange.minTerm} - ${selectedRange.maxTerm} mos.`
                : "Select Range"}
            </span>
            <MdExpandMore className="text-lg border-white border-opacity-35 opacity-55 mr-2" />
          </button>
        )}
      />
      <span className="text-sm text-right px-4 py-1 border border-white border-opacity-10 rounded">
        12.99 %
      </span>
    </div>
  );
};

export default ManageRates;
